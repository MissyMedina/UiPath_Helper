import React, { useState } from 'react';
import type { WorkflowSolutions } from './types';
import { generateWorkflowSuggestion } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import WorkflowDisplay from './components/WorkflowDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Welcome from './components/Welcome';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [solutions, setSolutions] = useState<WorkflowSolutions | null>(null);

  const handleGenerate = async (description: string, allowMarketplace: boolean) => {
    setIsLoading(true);
    setError(null);
    setSolutions(null);
    try {
      const result = await generateWorkflowSuggestion(description, allowMarketplace);
      setSolutions(result);
    } catch (err) {
      setError(err instanceof Error ? `An error occurred: ${err.message}` : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-h-[600px] border border-gray-200 dark:border-gray-700">
              {isLoading && <LoadingSpinner />}
              {error && <ErrorMessage message={error} />}
              {!isLoading && !error && solutions && <WorkflowDisplay solutions={solutions} />}
              {!isLoading && !error && !solutions && <Welcome />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;