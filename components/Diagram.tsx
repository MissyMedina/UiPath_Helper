import React from 'react';
import type { DiagramNode } from '../types';

const NodeIcon: React.FC<{ type: string }> = ({ type }) => {
  const iconClass = "w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 shrink-0";
  // FIX: Handle cases where 'type' might be undefined to prevent crashes.
  switch ((type || '').toLowerCase()) {
    case 'sequence':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4-4 4m0 6H4m0 0l4 4m-4-4 4-4" /></svg>;
    case 'activity':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'if':
        return <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 5h3v2h-3V7zm3 10h-3v-2h3v2zm0-4h-3v-2h3v2z"/></svg>;
    case 'for each':
      // FIX: Corrected typo from iconc_lass to iconClass.
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path d="M4 9a9 9 0 0114.75 4.54" /><path d="M20 15a9 9 0 01-14.75-4.54" /></svg>;
    default:
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
  }
};

const BranchContainer: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-2">
        <div className="pl-4">
            <div className="relative border-l-2 border-gray-300 dark:border-gray-600">
                <div className="absolute -left-[10px] top-2 h-px w-2 bg-gray-300 dark:bg-gray-600"></div>
                <div className="pl-4 py-2">
                     <p className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mb-2">{title}</p>
                     <div className="space-y-2">{children}</div>
                </div>
            </div>
        </div>
    </div>
);

const NodeDisplay: React.FC<{ node: DiagramNode }> = ({ node }) => {
    return (
        <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm flex flex-col">
            <div className="flex items-center">
                <NodeIcon type={node.type} />
                <div className="flex-grow">
                    <p className="font-bold text-blue-700 dark:text-blue-400">{node.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{node.type}</p>
                </div>
            </div>
            {node.description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 pl-8">{node.description}</p>}
            
            {/* Render Container Branches */}
            {(node.then || node.else) && (
                <>
                    <BranchContainer title="Then">
                        <Diagram nodes={node.then ?? []} />
                    </BranchContainer>
                    <BranchContainer title="Else">
                        <Diagram nodes={node.else ?? []} />
                    </BranchContainer>
                </>
            )}

            {node.body && (
                <BranchContainer title="Body">
                    <Diagram nodes={node.body} />
                </BranchContainer>
            )}

            {node.children && (
                 <div className="pl-8 mt-2">
                    <Diagram nodes={node.children} />
                </div>
            )}
        </div>
    )
}

const Diagram: React.FC<{ nodes: DiagramNode[] }> = ({ nodes }) => {
  // Defensive check: The AI model can sometimes return a single object for a container's body
  // instead of an array with one object. This ensures `nodes` is always an array before mapping.
  const nodesArray = Array.isArray(nodes) ? nodes : (nodes ? [nodes] : []);

  if (nodesArray.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-sm pl-4">Empty</p>;
  }

  return (
    <div className="space-y-2">
      {nodesArray.map((node, index) => (
        <div key={index} className="flex items-start">
             {/* This structure is simplified as the nesting is handled by containers now */}
             <NodeDisplay node={node} />
        </div>
      ))}
    </div>
  );
};

export default Diagram;