
import React from 'react';
import { ActionItem, Status } from '../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  items: ActionItem[];
  onUpdateItem: (item: ActionItem) => void;
  onSelectItem: (id: string | null) => void;
  onDropItem: (itemId: string, newStatus: Status) => void;
  activeItemId: string | null;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ items, onUpdateItem, onSelectItem, onDropItem, activeItemId }) => {
  const columns: Status[] = [Status.Now, Status.Next, Status.Later];

  return (
    <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-4">
      {columns.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          items={items.filter(item => item.status === status)}
          onUpdateItem={onUpdateItem}
          onSelectItem={onSelectItem}
          onDropItem={onDropItem}
          activeItemId={activeItemId}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
