
import React from 'react';

interface DetailsTableProps {
  title: string;
  headers: string[];
  data: string[][];
}

const DetailsTable: React.FC<DetailsTableProps> = ({ title, headers, data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">{title}</h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetailsTable;
