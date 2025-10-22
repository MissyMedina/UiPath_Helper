
import React from 'react';

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Welcome to the Workflow Architect</h2>
        <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
            Describe the business process you want to automate in the panel on the left. This tool will analyze your description and generate a complete UiPath workflow design, including diagrams, components, and variables.
        </p>
    </div>
  );
};

export default Welcome;
