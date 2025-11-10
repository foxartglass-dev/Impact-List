
import React, { useState, useRef, useEffect } from 'react';
import { ActionItem } from '../types';

interface AiCoachPanelProps {
  item: ActionItem | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const QuickPrompts = [
    "What's the very first step?",
    "Give me some examples.",
    "Generate a checklist for this.",
    "What are the potential risks?",
    "What's the proof of done?",
];

const AiCoachPanel: React.FC<AiCoachPanelProps> = ({ item, isOpen, onClose, onSendMessage, isLoading }) => {
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [item?.coachHistory]);
  
  const handleSend = (prompt?: string) => {
    const message = prompt || userInput;
    if (message.trim()) {
      onSendMessage(message);
      setUserInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };
  
  if (!isOpen || !item) {
    return null;
  }

  return (
    <aside className="w-full max-w-md bg-gray-800 rounded-lg shadow-2xl flex flex-col transition-all duration-300 transform">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-cyan-400">AI Action Coach</h3>
          <p className="text-sm text-gray-300 truncate">{item.title}</p>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">&times;</button>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {item.coachHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-cyan-800 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && item.coachHistory[item.coachHistory.length -1]?.sender === 'user' && (
             <div className="flex justify-start">
                 <div className="max-w-xs md:max-w-sm rounded-lg px-4 py-2 bg-gray-700 text-gray-200">
                     <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                     </div>
                 </div>
             </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex flex-wrap gap-2 mb-3">
            {QuickPrompts.map(prompt => (
                <button 
                    key={prompt} 
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-full disabled:opacity-50"
                >
                    {prompt}
                </button>
            ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for guidance..."
            className="flex-grow bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !userInput.trim()}
            className="px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AiCoachPanel;
