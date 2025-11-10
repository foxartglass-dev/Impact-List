
import React, { useRef } from 'react';
import { Plan } from '../types';

interface HeaderProps {
  plan: Plan;
  onImport: (plan: Plan) => void;
  onClear: () => void;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ plan, onImport, onClear, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(plan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${plan.eventName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const importedPlan = JSON.parse(text);
            // Basic validation
            if (importedPlan.eventName && Array.isArray(importedPlan.actionItems)) {
                onImport(importedPlan);
            } else {
                alert('Invalid plan file format.');
            }
          }
        } catch (error) {
          alert('Error parsing plan file.');
          console.error(error);
        }
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-cyan-400">ImpactList</h1>
        <h2 className="text-lg text-gray-300 hidden md:block">{plan.eventName}</h2>
      </div>
      {isLoading && (
        <div className="flex items-center gap-2 text-yellow-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          AI is thinking...
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
        />
        <button onClick={handleImportClick} className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500">
            Import JSON
        </button>
        <button onClick={handleExport} disabled={plan.actionItems.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
            Export JSON
        </button>
         <button onClick={onClear} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500">
            Start Over
        </button>
      </div>
    </header>
  );
};

export default Header;
