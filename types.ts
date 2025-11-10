export enum Status {
  Now = 'Now',
  Next = 'Next',
  Later = 'Later',
  Skip = 'Skip',
}

export enum Control {
  Mine = 'Mine',
  ThirdParty = '3rd-party',
}

export enum Effort {
  Low = 'L',
  Medium = 'M',
  High = 'H',
}

export interface PlanMeta {
  version: "v1";
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

export interface AiCoachResponsePayload {
    first_moves: string[];
    check_prereqs: string[];
    risks: string[];
    done_when: string[];
    message: string;
}

export interface AiCoachMessage {
  sender: 'user' | 'ai';
  content: string | AiCoachResponsePayload;
}

export interface ActionItem {
  id: string;
  title: string;
  why: string;
  source_refs: string[];
  status: Status;
  control: Control;
  effort: Effort;
  cost: number;
  coachHistory: AiCoachMessage[];
  rankScore?: number;
  impactHint?: number;
}

export interface PlanSnapshot {
    label: string;
    timestamp: string;
    plan: Plan;
}

export interface Plan {
  meta: PlanMeta;
  eventName: string;
  sourceText: string;
  actionItems: ActionItem[];
}


// --- Placeholder types for future features ---

export interface LiveTalk {
    id: string;
    title: string;
    status: 'pending' | 'live' | 'done';
}

export interface LiveEvent {
    id: string;
    talks: LiveTalk[];
}

export interface Lead {
    email: string;
    listId: string;
    consent: boolean;
    timestamp: string;
}

export interface DIFMFeasibility {
    confidence: "rock_solid" | "partial" | "not_ready";
    est_completion_pct: number;
    remaining_steps: string[];
}
