
import React, { useMemo } from 'react';
import { ActionItem, Status, Effort } from '../types';

interface TotalsBarProps {
  items: ActionItem[];
}

const effortWeight: { [key in Effort]: number } = {
  [Effort.Low]: 1,
  [Effort.Medium]: 2,
  [Effort.High]: 3,
};

const TotalsBar: React.FC<TotalsBarProps> = ({ items }) => {
  const totals = useMemo(() => {
    const initialTotals = {
      [Status.Now]: { count: 0, cost: 0, effort: 0 },
      [Status.Next]: { count: 0, cost: 0, effort: 0 },
      [Status.Later]: { count: 0, cost: 0, effort: 0 },
    };

    return items.reduce((acc, item) => {
      if (item.status !== Status.Skip) {
        acc[item.status].count += 1;
        acc[item.status].cost += item.cost;
        acc[item.status].effort += effortWeight[item.effort];
      }
      return acc;
    }, initialTotals);
  }, [items]);

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm p-4 mt-4 rounded-t-lg shadow-2xl border-t border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-green-900/50 rounded-md">
          <h4 className="font-bold text-lg text-green-400">Now</h4>
          <div className="flex justify-around mt-2 text-sm">
            <span>Items: {totals.Now.count}</span>
            <span>Effort: {totals.Now.effort}</span>
            <span>Cost: ${totals.Now.cost.toLocaleString()}</span>
          </div>
        </div>
        <div className="p-3 bg-blue-900/50 rounded-md">
          <h4 className="font-bold text-lg text-blue-400">Next</h4>
          <div className="flex justify-around mt-2 text-sm">
            <span>Items: {totals.Next.count}</span>
            <span>Effort: {totals.Next.effort}</span>
            <span>Cost: ${totals.Next.cost.toLocaleString()}</span>
          </div>
        </div>
        <div className="p-3 bg-gray-700/60 rounded-md">
          <h4 className="font-bold text-lg text-gray-400">Later</h4>
          <div className="flex justify-around mt-2 text-sm">
            <span>Items: {totals.Later.count}</span>
            <span>Effort: {totals.Later.effort}</span>
            <span>Cost: ${totals.Later.cost.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalsBar;
