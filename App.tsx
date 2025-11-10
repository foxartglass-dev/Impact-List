import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ActionItem, Plan, Status, Control, Effort, AiCoachMessage, PlanSnapshot, PlanMeta, AiCoachResponsePayload } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { generateActionItems, getCoachResponse } from './services/geminiService';
import Header from './components/Header';
import SourceInput from './components/SourceInput';
import KanbanBoard from './components/KanbanBoard';
import AiCoachPanel from './components/AiCoachPanel';
import TotalsBar from './components/TotalsBar';

const createEmptyPlan = (): Plan => {
  const now = new Date().toISOString();
  return {
    meta: {
      version: "v1",
      created_at: now,
      updated_at: now,
    },
    eventName: "My Action Plan",
    sourceText: "",
    actionItems: [],
  };
};

function App() {
  const [plan, setPlan] = useLocalStorage<Plan>('impactlist-plan', createEmptyPlan());
  const [snapshots, setSnapshots] = useLocalStorage<PlanSnapshot[]>('impactlist-snapshots', []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [generationFailed, setGenerationFailed] = useState(false);

  const updatePlan = useCallback((newPlan: Plan | ((p: Plan) => Plan)) => {
    setPlan(prevPlan => {
      const updatedPlan = newPlan instanceof Function ? newPlan(prevPlan) : newPlan;
      updatedPlan.meta.updated_at = new Date().toISOString();
      return updatedPlan;
    });
  }, [setPlan]);

  const handleGeneratePlan = useCallback(async (sourceText: string, eventName: string, customPrompt?: string) => {
    setIsLoading(true);
    setError(null);
    setGenerationFailed(false);
    console.log("ingest_started: Plan generation started.");

    try {
      const generatedItems = await generateActionItems(sourceText, customPrompt);
      console.log("ingest_succeeded: Received items from AI.");

      if(generatedItems.length === 0) {
        setGenerationFailed(true);
        setError("The AI couldn't generate any action items. You can try again with a different prompt.");
        updatePlan(p => ({...p, sourceText, eventName, actionItems: [] }));
        return;
      }

      const newActionItems: ActionItem[] = generatedItems.map(item => {
        const controlWeight = item.control === Control.Mine ? 1.0 : 0.5;
        const effortWeight = { [Effort.Low]: 1, [Effort.Medium]: 2, [Effort.High]: 3 }[item.effort || Effort.Medium];
        const impactHint = item.impactHint || 1.0;
        const rankScore = parseFloat(((controlWeight * impactHint) / effortWeight).toFixed(2));

        return {
          id: uuidv4(),
          title: item.title || 'Untitled',
          why: item.why || 'No rationale provided.',
          source_refs: item.source_refs || [],
          status: Status.Later,
          control: Control.Mine,
          effort: Effort.Medium,
          cost: 0,
          coachHistory: [],
          rankScore,
          impactHint
        };
      });

      const now = new Date().toISOString();
      updatePlan({
        meta: { version: "v1", created_at: now, updated_at: now },
        eventName,
        sourceText,
        actionItems: newActionItems,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
      setGenerationFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, [updatePlan]);

  const updateActionItem = useCallback((updatedItem: ActionItem) => {
    console.log(`triage_changed: Item ${updatedItem.id} updated to status ${updatedItem.status}`);
    updatePlan(prevPlan => ({
      ...prevPlan,
      actionItems: prevPlan.actionItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    }));
  }, [updatePlan]);
  
  const handleItemDrag = useCallback((itemId: string, newStatus: Status) => {
      const item = plan.actionItems.find(i => i.id === itemId);
      if (item && item.status !== newStatus) {
          updateActionItem({ ...item, status: newStatus });
      }
  }, [plan.actionItems, updateActionItem]);

  const handleClearPlan = useCallback(() => {
    updatePlan(createEmptyPlan());
    setActiveItemId(null);
    setGenerationFailed(false);
    setError(null);
  }, [updatePlan]);

  const handleImportPlan = (importedPlan: Plan) => {
    setPlan(importedPlan);
    setActiveItemId(null);
  };

  const handleSaveSnapshot = () => {
    const label = prompt("Enter a name for this snapshot:", `Snapshot ${new Date().toLocaleString()}`);
    if (label) {
        const newSnapshot: PlanSnapshot = {
            label,
            timestamp: new Date().toISOString(),
            plan: { ...plan } // Create a deep copy
        };
        setSnapshots(prev => [...prev, newSnapshot]);
    }
  };

  const handleLoadSnapshot = (timestamp: string) => {
    const snapshot = snapshots.find(s => s.timestamp === timestamp);
    if(snapshot) {
        setPlan(snapshot.plan);
    }
  };

  const activeItem = useMemo(() => plan.actionItems.find(item => item.id === activeItemId), [activeItemId, plan.actionItems]);

  const handleSendCoachMessage = useCallback(async (userMessage: string) => {
    if (!activeItem) return;

    const updatedHistory: AiCoachMessage[] = [...activeItem.coachHistory, { sender: 'user', content: userMessage }];
    updateActionItem({ ...activeItem, coachHistory: updatedHistory });

    setIsLoading(true);
    const startTime = Date.now();
    try {
      const aiResponsePayload = await getCoachResponse(activeItem, userMessage);
      const latency = Date.now() - startTime;
      console.log(`coach_response: Received response from coach for item ${activeItem.id} in ${latency}ms.`);

      const finalHistory = [...updatedHistory, { sender: 'ai' as 'ai', content: aiResponsePayload }];
      updateActionItem({ ...activeItem, coachHistory: finalHistory });

    } catch(e) {
       const errorText = e instanceof Error ? e.message : "An unknown error occurred.";
       const errorResponse: AiCoachResponsePayload = {
         message: `Sorry, I couldn't respond. Error: ${errorText}`,
         first_moves: [], check_prereqs: [], risks: [], done_when: []
       }
       const errorHistory = [...updatedHistory, { sender: 'ai' as 'ai', content: errorResponse }];
       updateActionItem({ ...activeItem, coachHistory: errorHistory });
    } finally {
      setIsLoading(false);
    }
  }, [activeItem, updateActionItem]);

  const handleSelectItem = useCallback((id: string | null) => {
    if (id) {
        console.log(`coach_opened: Coach opened for item ${id}.`);
    }
    setActiveItemId(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header 
        plan={plan} 
        onImport={handleImportPlan} 
        onClear={handleClearPlan}
        isLoading={isLoading}
        snapshots={snapshots}
        onSaveSnapshot={handleSaveSnapshot}
        onLoadSnapshot={handleLoadSnapshot}
      />
      <main className="flex-grow flex p-4 gap-4 overflow-hidden">
        {plan.actionItems.length === 0 ? (
          <SourceInput 
            onGenerate={handleGeneratePlan} 
            isLoading={isLoading} 
            error={error}
            showPromptOverride={generationFailed}
            initialSourceText={plan.sourceText}
            initialEventName={plan.eventName}
          />
        ) : (
          <div className="flex-grow flex flex-col overflow-hidden">
            <KanbanBoard 
                items={plan.actionItems} 
                onUpdateItem={updateActionItem} 
                onSelectItem={handleSelectItem} 
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
