
import { EmailMessage, CalendarEvent, DriveFile } from '../types';

class Microsoft365Service {
  async listEmails(): Promise<EmailMessage[]> {
    console.log("Fetching Outlook messages...");
    return [
      { id: 'ms1', threadId: 't3', subject: 'Microsoft Cloud Update', from: 'support@microsoft.com', to: 'alex@outlook.com', body: 'Updates to your subscription.', date: new Date().toISOString(), isRead: false, provider: 'microsoft' }
    ];
  }

  async listEvents(): Promise<CalendarEvent[]> {
    console.log("Fetching Outlook Calendar events...");
    return [
      { id: 'ev3', title: 'Family Dinner', startTime: new Date().toISOString(), endTime: new Date().toISOString(), attendees: [], provider: 'microsoft' }
    ];
  }

  async listFiles(): Promise<DriveFile[]> {
    console.log("Fetching OneDrive files...");
    return [
      { id: 'od1', name: 'Resume_Nexus.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', webViewLink: '#', provider: 'microsoft' }
    ];
  }
}

export const microsoft365 = new Microsoft365Service();
