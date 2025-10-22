
import React, { useState } from 'react';
import type { WorkflowSolutions, WorkflowSolution } from '../types';
import Diagram from './Diagram';
import DetailsTable from './DetailsTable';

interface WorkflowDisplayProps {
  solutions: WorkflowSolutions;
}

type Tab = 'ai' | 'traditional';

const WorkflowDisplay: React.FC<WorkflowDisplayProps> = ({ solutions }) => {
  const [activeTab, setActiveTab] = useState<Tab>('ai');

  const activeSolution: WorkflowSolution = activeTab === 'ai' ? solutions.aiSolution : solutions.traditionalSolution;

  const TabButton: React.FC<{ tabId: Tab; label: string }> = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-200 ${
        activeTab === tabId
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-4">
        <TabButton tabId="ai" label={solutions.aiSolution.title} />
        <TabButton tabId="traditional" label={solutions.traditionalSolution.title} />
      </div>

      <div className="animate-fade-in">
        <p className="text-gray-600 dark:text-gray-300 mb-6">{activeSolution.summary}</p>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Workflow Diagram</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <Diagram nodes={activeSolution.diagram} />
            </div>
          </div>
          
          <DetailsTable title="Required Components" headers={['Name', 'Package', 'Description']} data={activeSolution.components.map(c => [c.name, c.package, c.description])} />
          <DetailsTable title="Variables" headers={['Name', 'Type', 'Scope', 'Default Value']} data={activeSolution.variables.map(v => [v.name, v.type, v.scope, v.defaultValue || ''])} />
          <DetailsTable title="Arguments" headers={['Name', 'Direction', 'Type', 'Description']} data={activeSolution.arguments.map(a => [a.name, a.direction, a.type, a.description])} />

        </div>
      </div>
    </div>
  );
};

export default WorkflowDisplay;
