import React, { useState } from 'react';
import { ActionItem, Status } from '../types';
import ActionItemCard from './ActionItemCard';

interface KanbanColumnProps {
  status: Status;
  items: ActionItem[];
  onUpdateItem: (item: ActionItem) => void;
  onSelectItem: (id: string | null) => void;
  onDropItem: (itemId: string, newStatus: Status) => void;
  activeItemId: string | null;
}

const columnStyles = {
    [Status.Now]: { bg: 'bg-green-900/50', border: 'border-green-500', title: 'text-green-400' },
    [Status.Next]: { bg: 'bg-blue-900/50', border: 'border-blue-500', title: 'text-blue-400' },
    [Status.Later]: { bg: 'bg-gray-800/60', border: 'border-gray-600', title: 'text-gray-400' },
    [Status.Skip]: { bg: 'bg-red-900/50', border: 'border-red-500', title: 'text-red-400' },
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, items, onUpdateItem, onSelectItem, onDropItem, activeItemId }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("itemId");
    onDropItem(itemId, status);
    setIsOver(false);
  };

  const style = columnStyles[status];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-lg h-full overflow-hidden transition-all duration-300 ${style.bg} ${isOver ? `ring-2 ${style.border}` : ''}`}
      aria-label={`Kanban column for ${status} items`}
      role="region"
    >
      <div className={`p-4 border-b-2 ${style.border}`}>
        <h3 id={`column-header-${status}`} className={`text-lg font-bold ${style.title}`}>{status} ({items.length})</h3>
      </div>
      <div className="flex-grow p-2 overflow-y-auto space-y-2" role="list" aria-labelledby={`column-header-${status}`}>
        {items.map(item => (
          <ActionItemCard
            key={item.id}
            item={item}
            onUpdate={onUpdateItem}
            onSelect={onSelectItem}
            isActive={item.id === activeItemId}
          />
        ))}
         {items.length === 0 && <div className="text-center text-gray-500 p-4">Drop items here</div>}
      </div>
    </div>
  );
};

export default KanbanColumn;
