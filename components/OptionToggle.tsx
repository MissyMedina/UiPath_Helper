
import React from 'react';

interface OptionToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const OptionToggle: React.FC<OptionToggleProps> = ({ label, description, enabled, onChange, disabled = false }) => {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${disabled ? 'opacity-50' : ''} bg-gray-100 dark:bg-gray-700/50`}>
      <div className="flex-grow">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        className={`${
          enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-800 disabled:cursor-not-allowed`}
        onClick={() => onChange(!enabled)}
        disabled={disabled}
      >
        <span
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

export default OptionToggle;
