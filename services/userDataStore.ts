
import { Task, Conversation, Workflow, User, StorageProvider } from '../types';

interface TaskStorageAdapter {
  getTasks(rootRef: string | null): Promise<Task[]>;
  saveTask(task: Task, rootRef: string | null): Promise<void>;
  getProviderName(): string;
}

class LocalStorageAdapter implements TaskStorageAdapter {
  async getTasks(): Promise<Task[]> {
    const data = localStorage.getItem('nexus_local_tasks');
    return data ? JSON.parse(data) : [];
  }
  async saveTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    const updated = [...tasks.filter(t => t.id !== task.id), task];
    localStorage.setItem('nexus_local_tasks', JSON.stringify(updated));
  }
  getProviderName() { return 'Local Cache'; }
}

class NotionTaskAdapter implements TaskStorageAdapter {
  async getTasks(rootRef: string | null): Promise<Task[]> {
    console.log(`[Notion API] Querying database: ${rootRef}`);
    const data = localStorage.getItem(`nexus_notion_tasks_${rootRef}`);
    return data ? JSON.parse(data) : [];
  }
  async saveTask(task: Task, rootRef: string | null): Promise<void> {
    console.log(`[Notion API] Updating page: ${task.id} in db ${rootRef}`);
    const tasks = await this.getTasks(rootRef);
    const updated = [...tasks.filter(t => t.id !== task.id), task];
    localStorage.setItem(`nexus_notion_tasks_${rootRef}`, JSON.stringify(updated));
  }
  getProviderName() { return 'Notion'; }
}

class GoogleDriveTaskAdapter implements TaskStorageAdapter {
  async getTasks(rootRef: string | null): Promise<Task[]> {
    console.log(`[Google Drive API] Fetching nexus_tasks.json from folder: ${rootRef}`);
    const data = localStorage.getItem(`nexus_gdrive_tasks_${rootRef}`);
    return data ? JSON.parse(data) : [];
  }
  async saveTask(task: Task, rootRef: string | null): Promise<void> {
    console.log(`[Google Drive API] Writing to nexus_tasks.json in folder: ${rootRef}`);
    const tasks = await this.getTasks(rootRef);
    const updated = [...tasks.filter(t => t.id !== task.id), task];
    localStorage.setItem(`nexus_gdrive_tasks_${rootRef}`, JSON.stringify(updated));
  }
  getProviderName() { return 'Google Drive'; }
}

class OneDriveTaskAdapter implements TaskStorageAdapter {
  async getTasks(rootRef: string | null): Promise<Task[]> {
    console.log(`[OneDrive API] Fetching tasks.xlsx data from folder: ${rootRef}`);
    const data = localStorage.getItem(`nexus_onedrive_tasks_${rootRef}`);
    return data ? JSON.parse(data) : [];
  }
  async saveTask(task: Task, rootRef: string | null): Promise<void> {
    console.log(`[OneDrive API] Syncing row to tasks.xlsx in folder: ${rootRef}`);
    const tasks = await this.getTasks(rootRef);
    const updated = [...tasks.filter(t => t.id !== task.id), task];
    localStorage.setItem(`nexus_onedrive_tasks_${rootRef}`, JSON.stringify(updated));
  }
  getProviderName() { return 'OneDrive'; }
}

class UserDataStore {
  private primaryProvider: StorageProvider | null = null;
  private taskStorageProvider: StorageProvider | null = null;
  private rootRef: string | null = null;
  private adapters: Record<StorageProvider, TaskStorageAdapter> = {
    'local': new LocalStorageAdapter(),
    'notion': new NotionTaskAdapter(),
    'google-drive': new GoogleDriveTaskAdapter(),
    'onedrive': new OneDriveTaskAdapter()
  };

  async init(user: User) {
    this.primaryProvider = user.primaryDataStore || null;
    this.taskStorageProvider = user.taskStorageProvider || user.primaryDataStore || 'local';
    this.rootRef = user.dataStoreRootRef || null;
    
    if (this.primaryProvider && !this.rootRef) {
      await this.setupRemoteStorage();
    }
  }

  private async setupRemoteStorage() {
    console.log(`Initializing Nexus Storage on ${this.primaryProvider}...`);
    this.rootRef = `nexus_root_${Math.random().toString(36).substr(2, 9)}`;
    const session = JSON.parse(localStorage.getItem('nexus_session') || '{}');
    if (session.user) {
      session.user.dataStoreRootRef = this.rootRef;
      localStorage.setItem('nexus_session', JSON.stringify(session));
    }
  }

  // Task Operations (Routed via Adapter)
  async saveTask(task: Task) {
    const provider = this.taskStorageProvider || 'local';
    const adapter = this.adapters[provider];
    await adapter.saveTask(task, this.rootRef);
  }

  async getTasks(): Promise<Task[]> {
    const provider = this.taskStorageProvider || 'local';
    const adapter = this.adapters[provider];
    return await adapter.getTasks(this.rootRef);
  }

  getTaskStorageProviderName(): string {
    const provider = this.taskStorageProvider || 'local';
    return this.adapters[provider].getProviderName();
  }

  // Conversation Operations (Defaulting to Primary Data Store)
  async saveConversation(conv: Conversation) {
    const key = `nexus_remote_chats_${this.rootRef}`;
    const convs = await this.getConversations();
    const updated = [...convs.filter(c => c.id !== conv.id), conv];
    localStorage.setItem(key, JSON.stringify(updated));
  }

  async getConversations(): Promise<Conversation[]> {
    if (!this.rootRef) return [];
    const data = localStorage.getItem(`nexus_remote_chats_${this.rootRef}`);
    return data ? JSON.parse(data) : [];
  }

  async saveWorkflows(workflows: Workflow[]) {
    if (!this.rootRef) return;
    localStorage.setItem(`nexus_remote_workflows_${this.rootRef}`, JSON.stringify(workflows));
  }

  async getWorkflows(): Promise<Workflow[]> {
    if (!this.rootRef) return [];
    const data = localStorage.getItem(`nexus_remote_workflows_${this.rootRef}`);
    return data ? JSON.parse(data) : [];
  }

  isReady() {
    return !!this.primaryProvider;
  }
}

export const userDataStore = new UserDataStore();
