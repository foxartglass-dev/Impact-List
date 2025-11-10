import React from 'react';
import { ActionItem, Status, Control, Effort } from '../types';

interface ActionItemCardProps {
  item: ActionItem;
  onUpdate: (item: ActionItem) => void;
  onSelect: (id: string) => void;
  isActive: boolean;
}

const ActionItemCard: React.FC<ActionItemCardProps> = ({ item, onUpdate, onSelect, isActive }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("itemId", item.id);
  };

  const handleChange = (field: keyof ActionItem, value: any) => {
    onUpdate({ ...item, [field]: value });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const statuses = Object.values(Status);
      const currentIndex = statuses.indexOf(item.status);
      const nextIndex = (currentIndex + 1) % statuses.length;
      handleChange('status', statuses[nextIndex]);
    }
  };


  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(item.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listitem"
      aria-selected={isActive}
      className={`bg-gray-800 p-4 rounded-md shadow-lg cursor-pointer border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${isActive ? 'border-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
    >
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-gray-100 pr-2">{item.title}</h4>
            {item.rankScore && (
                <span title="Auto-rank score hint" className="text-xs bg-gray-600 text-cyan-300 font-mono px-2 py-1 rounded-full">{item.rankScore.toFixed(2)}</span>
            )}
        </div>
      <p className="text-sm text-gray-400 mt-1 italic">Why: {item.why}</p>
      
      {item.source_refs && item.source_refs.length > 0 && (
          <div className="mt-2">
              <span 
                  className="text-xs text-cyan-400 cursor-pointer hover:underline"
                  title={`Source References:\n${item.source_refs.join('\n')}`}
                  onClick={(e) => e.stopPropagation()} // Prevent card selection
              >
                  View source
              </span>
          </div>
       )}

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Control */}
        <div className="flex flex-col">
            <label className="text-gray-500 mb-1">Control</label>
            <select
                value={item.control}
                onChange={(e) => handleChange('control', e.target.value as Control)}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-700 border border-gray-600 text-white rounded p-1 text-xs focus:ring-cyan-500 focus:border-cyan-500"
            >
                {Object.values(Control).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
        {/* Effort */}
        <div className="flex flex-col">
            <label className="text-gray-500 mb-1">Effort</label>
            <select
                value={item.effort}
                onChange={(e) => handleChange('effort', e.target.value as Effort)}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-700 border border-gray-600 text-white rounded p-1 text-xs focus:ring-cyan-500 focus:border-cyan-500"
            >
                 {Object.values(Effort).map(e => <option key={e} value={e}>{e}</option>)}
            </select>
        </div>
        {/* Cost */}
        <div className="flex flex-col">
            <label className="text-gray-500 mb-1">Cost ($)</label>
            <input
                type="number"
                value={item.cost}
                onChange={(e) => handleChange('cost', parseInt(e.target.value, 10) || 0)}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-700 border border-gray-600 text-white rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-cyan-500 focus:border-cyan-500"
                min="0"
            />
        </div>
         {/* Status */}
        <div className="flex flex-col">
            <label className="text-gray-500 mb-1">Status</label>
            <select
                value={item.status}
                onChange={(e) => handleChange('status', e.target.value as Status)}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-700 border border-gray-600 text-white rounded p-1 text-xs focus:ring-cyan-500 focus:border-cyan-500"
            >
                 {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
      </div>
    </div>
  );
};

export default ActionItemCard;
