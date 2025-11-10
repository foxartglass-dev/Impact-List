
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

export interface AiCoachMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface ActionItem {
  id: string;
  title: string;
  why: string;
  sourceCitation: string;
  status: Status;
  control: Control;
  effort: Effort;
  cost: number;
  coachHistory: AiCoachMessage[];
}

export interface Plan {
  eventName: string;
  sourceText: string;
  actionItems: ActionItem[];
}
