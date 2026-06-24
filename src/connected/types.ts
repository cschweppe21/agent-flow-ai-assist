export type ContactStatus =
  | 'to_reach_out'
  | 'reached_out'
  | 'in_conversation'
  | 'met'
  | 'ongoing'
  | 'dormant';

export type InteractionType = 'call' | 'email' | 'meeting' | 'message' | 'event' | 'other';

export interface Interaction {
  id: string;
  date: string;
  type: InteractionType;
  note: string;
}

export interface Referral {
  id: string;
  name: string;
  company?: string;
  school?: string;
  smartContact?: string;
  contactId?: string;
  date?: string;
}

export interface Ratings {
  responsiveness: number;
  rapport: number;
  helpfulness: number;
}

export interface Groundwork {
  personal: string[];
  company: string[];
  industry: string[];
}

export interface Attachment {
  id: string;
  name: string;
  path: string;
}

export interface Contact {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  school?: string;
  gradYear?: string;
  industry?: string;
  referredById?: string;
  status: ContactStatus;
  priority: boolean;
  alumni: boolean;
  ratings: Ratings;
  notes: string;
  groundwork: Groundwork;
  interactions: Interaction[];
  referrals: Referral[];
  followUpDate?: string;
  followUpRecommended?: boolean;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'contacts' | 'graph';
export type GraphCluster = 'company' | 'school';
export type SortField = 'name' | 'company' | 'followUp' | 'recency' | 'rating';
export type FilterMode = 'all' | 'followUp' | 'priority';
