
import React, { useState } from 'react';

interface SourceInputProps {
  onGenerate: (sourceText: string, eventName: string) => void;
  isLoading: boolean;
  error: string | null;
}

const SourceInput: React.FC<SourceInputProps> = ({ onGenerate, isLoading, error }) => {
  const [sourceText, setSourceText] = useState('');
  const [eventName, setEventName] = useState('My AI Action Plan');
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setSourceText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceText.trim()) {
      onGenerate(sourceText, eventName);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-gray-800 rounded-lg shadow-2xl flex flex-col items-center">
      <h2 className="text-3xl font-bold text-cyan-400 mb-2">Create Your Action Plan</h2>
      <p className="text-gray-400 mb-6 text-center">Paste your content, upload a file, or enter a YouTube URL (note: URL processing is simulated) to get started.</p>
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md relative w-full mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div>
          <label htmlFor="eventName" className="block text-sm font-medium text-gray-300 mb-1">
            Plan Name
          </label>
          <input
            type="text"
            id="eventName"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="e.g., Q3 Marketing Strategy"
            required
          />
        </div>

        <div>
           <label htmlFor="sourceText" className="block text-sm font-medium text-gray-300 mb-1">
            Source Content (Paste Text, File Content, or Transcript)
          </label>
           <textarea
            id="sourceText"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 h-64 resize-y focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Paste your article, meeting notes, or video transcript here..."
            required
          />
        </div>

        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center">
                <label htmlFor="file-upload" className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-500">
                    Upload File (.txt, .md)
                </label>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.md" />
            </div>

            <button
                type="submit"
                disabled={isLoading || !sourceText.trim()}
                className="px-8 py-3 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                >
                {isLoading ? (
                    <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Generating...
                    </>
                ) : 'Generate Action Plan'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default SourceInput;
