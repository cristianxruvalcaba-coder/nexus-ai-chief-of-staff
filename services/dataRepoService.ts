
import { DataRepository } from '../types';

export interface RepoDocument {
  id: string;
  title: string;
  content: string;
  url: string;
  lastModified: Date;
}

class DataRepoService {
  private repositories: DataRepository[] = [];

  constructor() {
    const saved = localStorage.getItem('nexus_repos');
    if (saved) this.repositories = JSON.parse(saved);
  }

  async connect(repo: Omit<DataRepository, 'id' | 'secretRef' | 'isPrimary'>, apiKey: string): Promise<DataRepository> {
    const newRepo: DataRepository = {
      ...repo,
      id: `repo_${Math.random().toString(36).substr(2, 9)}`,
      secretRef: `secret_${Math.random().toString(36).substr(2, 9)}`, // In real app, store in Secret Manager
      isPrimary: this.repositories.length === 0
    };

    // Simulate validation
    console.log(`Connecting to ${repo.provider} with key: ${apiKey.substring(0, 4)}...`);
    
    this.repositories.push(newRepo);
    localStorage.setItem('nexus_repos', JSON.stringify(this.repositories));
    return newRepo;
  }

  async listDocuments(repoId: string): Promise<RepoDocument[]> {
    const repo = this.repositories.find(r => r.id === repoId);
    if (!repo) throw new Error("Repository not found");

    // Mock data based on provider
    if (repo.provider === 'notion') {
      return [
        { id: '1', title: 'Q4 Strategy Draft', content: '...', url: '#', lastModified: new Date() },
        { id: '2', title: 'Hiring Plan', content: '...', url: '#', lastModified: new Date() }
      ];
    }

    return [
      { id: 'd1', title: 'Executive Summary.pdf', content: '...', url: '#', lastModified: new Date() }
    ];
  }

  async createDocument(repoId: string, title: string, content: string): Promise<RepoDocument> {
    console.log(`Creating document "${title}" in repo ${repoId}`);
    return {
      id: Math.random().toString(),
      title,
      content,
      url: '#',
      lastModified: new Date()
    };
  }

  getRepositories(): DataRepository[] {
    return this.repositories;
  }
}

export const dataRepoService = new DataRepoService();
