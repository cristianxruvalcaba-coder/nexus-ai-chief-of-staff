
import { EmailMessage, CalendarEvent, DriveFile } from '../types';

class GoogleWorkspaceService {
  async listEmails(): Promise<EmailMessage[]> {
    console.log("Fetching Gmail messages...");
    return [
      { id: 'gm1', threadId: 't1', subject: 'Quarterly Review', from: 'jane@company.com', to: 'alex@nexus.ai', body: 'Please see attached report.', date: new Date().toISOString(), isRead: false, provider: 'google' },
      { id: 'gm2', threadId: 't2', subject: 'Project Alpha Sync', from: 'dev-team@company.com', to: 'alex@nexus.ai', body: 'Updated the roadmap.', date: new Date().toISOString(), isRead: true, provider: 'google' }
    ];
  }

  async listEvents(): Promise<CalendarEvent[]> {
    console.log("Fetching Google Calendar events...");
    const now = new Date();
    return [
      { id: 'ev1', title: 'Product Deep Dive', startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), attendees: ['jane@company.com'], provider: 'google' },
      { id: 'ev2', title: 'Board Meeting', startTime: new Date(now.getTime() + 7200000).toISOString(), endTime: new Date(now.getTime() + 10800000).toISOString(), attendees: ['investors@vcs.com'], provider: 'google' }
    ];
  }

  async listFiles(): Promise<DriveFile[]> {
    console.log("Fetching Google Drive files...");
    return [
      { id: 'df1', name: 'Strategy_2025.pdf', mimeType: 'application/pdf', webViewLink: '#', provider: 'google' },
      { id: 'df2', name: 'Financial_Projections.gsheet', mimeType: 'application/vnd.google-apps.spreadsheet', webViewLink: '#', provider: 'google' }
    ];
  }

  async createDoc(title: string, content: string): Promise<string> {
    console.log(`Creating Google Doc: ${title}`);
    return `doc_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const googleWorkspace = new GoogleWorkspaceService();
