
export type PersonaSlug = 'orchestrator' | 'executive' | 'tasks' | 'calendar' | 'email' | 'research' | 'automation';

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'perplexity';

export type StorageProvider = 'notion' | 'google-drive' | 'onedrive' | 'local';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  primaryDataStore?: StorageProvider;
  taskStorageProvider?: StorageProvider;
  dataStoreRootRef?: string; // ID of the root folder or database
}

// Productivity Interfaces
export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  date: string;
  isRead: boolean;
  provider: 'google' | 'microsoft';
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  attendees: string[];
  provider: 'google' | 'microsoft';
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  provider: 'google' | 'microsoft';
}

export interface DataRepository {
  id: string;
  userId: string;
  provider: StorageProvider;
  name: string;
  config: Record<string, any>;
  secretRef: string;
  isPrimary: boolean;
  status: 'connected' | 'error' | 'syncing';
}

export interface Persona {
  id: string;
  name: string;
  slug: PersonaSlug;
  icon: string;
  description: string;
  systemPrompt: string;
  useCases: string[];
}

export type TaskStatus = 'Not started' | 'In progress' | 'Completed';
export type TaskPriority = 'High Priority' | 'Medium' | 'Low' | 'None';
export type TaskType = 'Today To-Do' | 'Later To-Do' | 'Maybe To-Do';

export interface Task {
  id: string;
  title: string;
  dueDate?: string;
  doItDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  areaOfLife: 'Career' | 'Food' | 'Special Interests' | 'Health' | 'Finance' | 'Home' | 'Personal';
  person: 'Work' | 'Spouse' | 'Personal' | 'Family';
  source?: string;
  archived: boolean;
  completed: boolean;
  notes?: string;
  attachedFiles?: string[];
  estTime?: string;
  feels?: 'Excited' | 'Neutral' | 'Dreading' | 'Focused' | 'Overwhelmed';
  relatedItems?: string[];
  monthlyGoals?: string[];
  yearlyGoals?: string[];
  personasInvolved?: PersonaSlug[];
  ocrExtract?: string;
  comments?: { user: string; text: string; date: string }[];
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  startedAt: Date;
  endedAt?: Date;
  provider: AIProvider;
  messages: Interaction[];
}

export interface UserSubscription {
  tier: 'Free' | 'Pro' | 'Business';
  tokensUsed: number;
  tokenLimit: number;
  byokTokensUsed: number;
  workflowsUsed: number;
  workflowLimit: number;
}

export interface Interaction {
  id: string;
  conversationId: string;
  timestamp: Date;
  sender: 'user' | 'agent';
  agentSlug?: PersonaSlug;
  content: string;
  tokens?: number;
  provider?: AIProvider;
  source?: 'user' | 'platform';
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: any[];
  active: boolean;
}
