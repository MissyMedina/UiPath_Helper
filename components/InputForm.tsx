import React, { useState } from 'react';
import OptionToggle from './OptionToggle';

interface InputFormProps {
  onGenerate: (description: string, allowMarketplace: boolean) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [description, setDescription] = useState<string>('');
  const [allowMarketplace, setAllowMarketplace] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onGenerate(description, allowMarketplace);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Process Description
            </label>
            <textarea
              id="description"
              rows={8}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 transition duration-150"
              placeholder="e.g., Read new emails, download PDF invoices, extract invoice number and total amount, and enter data into an Excel sheet."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <OptionToggle
              label="Marketplace Packages"
              description="Allow suggestions from the UiPath Marketplace."
              enabled={allowMarketplace}
              onChange={setAllowMarketplace}
              disabled={isLoading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600 transition duration-150"
            >
              {isLoading ? 'Generating...' : 'Build Workflow'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InputForm;