export interface DiagramNode {
  type: string;
  name: string;
  description?: string;
  // Generic children for sequences, flowcharts etc.
  children?: DiagramNode[];
  // Specific branches for container activities
  then?: DiagramNode[];
  else?: DiagramNode[];
  body?: DiagramNode[];
}

export interface ComponentDetail {
  name: string;
  package: string;
  description: string;
}

export interface VariableDetail {
  name: string;
  type: string;
  scope: string;
  defaultValue?: string;
}

export interface ArgumentDetail {
  name: string;
  direction: 'In' | 'Out' | 'InOut';
  type: string;
  description: string;
}

export interface WorkflowSolution {
  title: string;
  summary: string;
  diagram: DiagramNode[];
  components: ComponentDetail[];
  variables: VariableDetail[];
  arguments: ArgumentDetail[];
}

export interface WorkflowSolutions {
  aiSolution: WorkflowSolution;
  traditionalSolution: WorkflowSolution;
}