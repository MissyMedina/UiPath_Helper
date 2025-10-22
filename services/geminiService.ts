import { GoogleGenAI, Type } from '@google/genai';
import type { WorkflowSolutions, WorkflowSolution, DiagramNode } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This schema defines the main structure. The complex diagram is generated as a string.
const solutionSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        diagram: {
            type: Type.STRING,
            description: 'A string containing a valid, escaped JSON array representing the hierarchical workflow diagram. This string will be parsed into a JSON object in the application.'
        },
        components: {
            type: Type.ARRAY,
            description: 'List of UiPath activities required.',
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    package: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['name', 'package', 'description']
            }
        },
        variables: {
            type: Type.ARRAY,
            description: 'List of variables needed.',
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING },
                    scope: { type: Type.STRING },
                    defaultValue: { type: Type.STRING, nullable: true, description: 'Optional default value.' }
                },
                required: ['name', 'type', 'scope']
            }
        },
        arguments: {
            type: Type.ARRAY,
            description: 'List of in/out/in-out arguments.',
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    direction: { type: Type.STRING },
                    type: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['name', 'direction', 'type', 'description']
            }
        }
    },
    required: ['title', 'summary', 'diagram', 'components', 'variables', 'arguments']
};

/**
 * A robust JSON parser that attempts to extract a JSON object from a string that may contain extraneous text,
 * such as markdown code fences added by the AI model.
 * @param text The raw string response from the AI model.
 * @returns A parsed JavaScript object.
 * @throws An error if no valid JSON can be parsed.
 */
function extractAndParseJson(text: string): any {
    // 1. Look for a markdown ```json block
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        try {
            return JSON.parse(markdownMatch[1]);
        } catch (e) {
            console.warn("Could not parse content of markdown block, falling back.", e);
            // Fall through to other methods if this fails
        }
    }

    // 2. Look for the first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = text.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(potentialJson);
        } catch (e) {
            console.warn("Could not parse content between first and last brace, falling back.", e);
            // Fall through to the final attempt
        }
    }
    
    // 3. Final attempt: parse the whole string directly
    // This will throw if it's invalid, which is the desired behavior if all else fails.
    return JSON.parse(text);
}


/**
 * Parses an indented text representation of a workflow into a DiagramNode structure.
 * This is more robust than asking the AI to generate perfect JSON.
 * @param text The indented string from the AI model.
 * @returns An array of root DiagramNode objects.
 */
function parseIndentedDiagram(text: string): DiagramNode[] {
    const lines = text.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const getIndent = (line: string): number => line.match(/^\s*/)?.[0].length ?? 0;

    const rootNodes: DiagramNode[] = [];
    const stack: { node: DiagramNode; indent: number }[] = [];

    // This state determines which branch the *next* parsed node will be added to.
    let nextNodeBranchKey: 'children' | 'then' | 'else' | 'body' = 'children';

    for (const line of lines) {
        const indent = getIndent(line);
        const content = line.trim();

        // Handle branch keywords which modify the state for the *next* node.
        const contentLower = content.toLowerCase();
        if (contentLower === 'then:') {
            nextNodeBranchKey = 'then';
            continue; // This line is a keyword, not a node, so we continue.
        }
        if (contentLower === 'else:') {
            nextNodeBranchKey = 'else';
            continue;
        }
        if (contentLower === 'body:') {
            nextNodeBranchKey = 'body';
            continue;
        }

        // Pop from stack until we find the parent for the current indentation level.
        while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        const parent = stack.length > 0 ? stack[stack.length - 1].node : null;

        // Parse the activity node from the line's content.
        const parts = content.split(':');
        const type = parts.shift()?.trim() || 'Unknown';
        const name = parts.join(':').trim();
        const newNode: DiagramNode = { name, type };

        // Attach the new node to its parent in the correct branch.
        if (parent) {
            // Initialize the branch array on the parent if it doesn't exist yet.
            if (!parent[nextNodeBranchKey]) {
                parent[nextNodeBranchKey] = [];
            }
            (parent[nextNodeBranchKey] as DiagramNode[]).push(newNode);
        } else {
            // If there's no parent, this is a root node.
            rootNodes.push(newNode);
        }
        
        // The current node becomes a potential parent for subsequent, more indented nodes.
        stack.push({ node: newNode, indent });

        // After placing a node, the default branch for the *next* sibling node (at same or lesser indent) is 'children'.
        nextNodeBranchKey = 'children';
    }

    return rootNodes;
}


/**
 * Generates a single, focused workflow solution.
 * @param description The user's process description.
 * @param allowMarketplace Whether to allow marketplace packages.
 * @param solutionType The type of solution to generate ('ai' or 'traditional').
 * @returns A single WorkflowSolution.
 */
const generateSingleSolution = async (
  description: string,
  allowMarketplace: boolean,
  solutionType: 'ai' | 'traditional'
): Promise<WorkflowSolution> => {
    
  const solutionSpecificInstruction = solutionType === 'ai'
    ? "This solution MUST leverage UiPath AI services (like AI Center, Document Understanding, Computer Vision, etc.) where appropriate."
    : "This solution MUST AVOID AI services and use traditional, rule-based automation techniques (e.g., string manipulation, selectors, data scraping, Find Image, OCR).";

  const systemInstruction = `
You are an expert UiPath RPA architect with deep knowledge of all official UiPath products, services, and best practices. Your knowledge is strictly based on official UiPath documentation and officially supported sources.
Your task is to analyze a user's process description and design the optimal RPA workflow based on a specific approach.
${solutionSpecificInstruction}

**Diagram as Indented Text (CRITICAL):**
- The 'diagram' field in the final JSON output MUST be a STRING.
- This string must contain the workflow diagram represented as simple indented text.
- Use two spaces for each level of indentation.
- Each line should follow the format: \`ActivityType: Display Name\`
- For container activities like 'If', use special keywords on their own indented lines to denote branches: \`then:\`, \`else:\`.
- For loops like 'For Each', use the keyword \`body:\` on its own indented line.

**Example Diagram Format:**
\`\`\`
Sequence: Main Sequence
  Assign: Get User Credentials
  If: Credentials Found
    then:
      Log Message: Login Successful
    else:
      Throw: Credentials Invalid Exception
  For Each: Data Row in DataTable
    body:
      Type Into: Enter Row Data
\`\`\`
This text format is simple and less error-prone. Adhere to it strictly.

**Crucial Guidance for difficult requests:**
- For the 'traditional' solution: If the user asks for a non-AI solution to a problem that is typically best solved with AI (like verifying handwriting, unstructured images, or complex PDFs), you MUST still provide a viable traditional workflow.
- Propose the best possible non-AI alternative using official packages. This might involve techniques like using OCR activities on specific screen regions to check for the presence of *any* text, or using 'Find Image' activities to locate anchors.
- You should acknowledge the potential brittleness or limitations of these non-AI methods in the 'summary' field of your response.

**Final Output Rules (ABSOLUTE):**
- Your ENTIRE response MUST be ONLY the JSON object itself.
- DO NOT include markdown fences (\`\`\`json), explanations, introductions, or any text outside of the primary JSON structure.
- The output must be directly parsable by a standard JSON parser.
  `;

  const userPrompt = `
Process Description: "${description}"

Package Preference: ${allowMarketplace ? "Allow Marketplace Packages" : "Official Packages Only"}

Generate the specified workflow solution now.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: solutionSchema,
      thinkingConfig: { thinkingBudget: 32768 } // Allocate maximum budget for complex reasoning
    }
  });

  const jsonText = response.text.trim();
  let solution: any;

  try {
      solution = extractAndParseJson(jsonText);
  } catch (parseError) {
      console.error(`Failed to parse main solution JSON for '${solutionType}' solution. Raw text:`, jsonText, parseError);
      throw new Error(`Model returned malformed JSON. Raw text: ${jsonText}`);
  }

  // Now, parse the new indented diagram string into a proper object.
  if (typeof solution.diagram === 'string' && solution.diagram.trim()) {
      try {
          solution.diagram = parseIndentedDiagram(solution.diagram);
      } catch (diagError) {
          console.error(`Failed to parse indented diagram text for '${solutionType}' solution. Raw string:`, solution.diagram, diagError);
          throw new Error(`Failed to parse diagram text. Raw string: ${solution.diagram}. Error: ${diagError.message}`);
      }
  } else {
      solution.diagram = [];
  }

  return solution as WorkflowSolution;
};

/**
 * Orchestrates the generation of both AI and traditional workflow solutions by making parallel requests.
 */
export const generateWorkflowSuggestion = async (
  description: string,
  allowMarketplace: boolean
): Promise<WorkflowSolutions> => {
  try {
    // Run both requests in parallel for efficiency
    const [aiSolution, traditionalSolution] = await Promise.all([
      generateSingleSolution(description, allowMarketplace, 'ai'),
      generateSingleSolution(description, allowMarketplace, 'traditional')
    ]);

    return {
      aiSolution,
      traditionalSolution,
    };
  } catch (error) {
    console.error("Error generating workflow suggestions:", error);
    if (error instanceof SyntaxError || (error instanceof Error && (error.message.includes("JSON") || error.message.includes("malformed")))) {
      throw new Error("The AI model returned an invalid data structure. Please try again.");
    }
    // Forward the more specific error message from generateSingleSolution
    throw error;
  }
};