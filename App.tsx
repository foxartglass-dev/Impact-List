
import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ActionItem, Plan, Status, Control, Effort, AiCoachMessage } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { generateActionItems, getCoachResponse } from './services/geminiService';
import Header from './components/Header';
import SourceInput from './components/SourceInput';
import KanbanBoard from './components/KanbanBoard';
import AiCoachPanel from './components/AiCoachPanel';
import TotalsBar from './components/TotalsBar';

const emptyPlan: Plan = {
  eventName: "My Action Plan",
  sourceText: "",
  actionItems: [],
};

function App() {
  const [plan, setPlan] = useLocalStorage<Plan>('impactlist-plan', emptyPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const handleGeneratePlan = useCallback(async (sourceText: string, eventName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedItems = await generateActionItems(sourceText);
      const newActionItems: ActionItem[] = generatedItems.map(item => ({
        id: uuidv4(),
        title: item.title || 'Untitled',
        why: item.why || 'No rationale provided.',
        sourceCitation: item.sourceCitation || 'No citation.',
        status: Status.Later,
        control: Control.Mine,
        effort: Effort.Medium,
        cost: 0,
        coachHistory: [],
      }));
      setPlan({
        eventName,
        sourceText,
        actionItems: newActionItems,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [setPlan]);

  const updateActionItem = useCallback((updatedItem: ActionItem) => {
    setPlan(prevPlan => ({
      ...prevPlan,
      actionItems: prevPlan.actionItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    }));
  }, [setPlan]);
  
  const handleItemDrag = useCallback((itemId: string, newStatus: Status) => {
      const item = plan.actionItems.find(i => i.id === itemId);
      if (item && item.status !== newStatus) {
          updateActionItem({ ...item, status: newStatus });
      }
  }, [plan.actionItems, updateActionItem]);

  const handleClearPlan = useCallback(() => {
    setPlan(emptyPlan);
    setActiveItemId(null);
  }, [setPlan]);

  const handleImportPlan = (importedPlan: Plan) => {
    setPlan(importedPlan);
    setActiveItemId(null);
  };

  const activeItem = useMemo(() => plan.actionItems.find(item => item.id === activeItemId), [activeItemId, plan.actionItems]);

  const handleSendCoachMessage = useCallback(async (userMessage: string) => {
    if (!activeItem) return;

    const updatedHistory: AiCoachMessage[] = [...activeItem.coachHistory, { sender: 'user', text: userMessage }];
    updateActionItem({ ...activeItem, coachHistory: updatedHistory });

    setIsLoading(true);
    try {
      const geminiHistory = activeItem.coachHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
      }));
      
      const aiResponse = await getCoachResponse(activeItem, userMessage, geminiHistory);

      const finalHistory = [...updatedHistory, { sender: 'ai' as 'ai', text: aiResponse }];
      updateActionItem({ ...activeItem, coachHistory: finalHistory });

    } catch(e) {
       const errorText = e instanceof Error ? e.message : "An unknown error occurred.";
       const errorHistory = [...updatedHistory, { sender: 'ai' as 'ai', text: `Sorry, I couldn't respond. Error: ${errorText}` }];
       updateActionItem({ ...activeItem, coachHistory: errorHistory });
    } finally {
      setIsLoading(false);
    }
  }, [activeItem, updateActionItem]);


  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header 
        plan={plan} 
        onImport={handleImportPlan} 
        onClear={handleClearPlan}
        isLoading={isLoading}
      />
      <main className="flex-grow flex p-4 gap-4 overflow-hidden">
        {plan.actionItems.length === 0 ? (
          <SourceInput onGenerate={handleGeneratePlan} isLoading={isLoading} error={error} />
        ) : (
          <div className="flex-grow flex flex-col overflow-hidden">
            <KanbanBoard 
                items={plan.actionItems} 
                onUpdateItem={updateActionItem} 
                onSelectItem={setActiveItemId} 
                onDropItem={handleItemDrag}
                activeItemId={activeItemId}
            />
            <TotalsBar items={plan.actionItems} />
          </div>
        )}
        <AiCoachPanel 
          item={activeItem} 
          isOpen={!!activeItem} 
          onClose={() => setActiveItemId(null)}
          onSendMessage={handleSendCoachMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;
