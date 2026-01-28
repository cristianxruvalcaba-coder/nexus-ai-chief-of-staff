
import React, { useState, useEffect } from 'react';
import { UserSubscription, DataRepository, User, StorageProvider } from '../types';
import { dataRepoService } from '../services/dataRepoService';
import { voiceService, VoiceSettings as VoiceConfig } from '../services/voiceService';
import { authService } from '../services/authService';
import { userDataStore } from '../services/userDataStore';

const Settings: React.FC<{ subscription: UserSubscription }> = ({ subscription }) => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [repos, setRepos] = useState<DataRepository[]>(dataRepoService.getRepositories());
  const [apiKeys, setApiKeys] = useState({
    openai: localStorage.getItem('nexus_key_openai') || '',
    anthropic: localStorage.getItem('nexus_key_anthropic') || '',
    perplexity: localStorage.getItem('nexus_key_perplexity') || '',
    gemini: localStorage.getItem('nexus_key_gemini') || ''
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceConfig>({
    autoSpeak: localStorage.getItem('nexus_auto_speak') === 'true',
    voiceName: localStorage.getItem('nexus_voice_name') || '',
    rate: 1,
    pitch: 1
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setAvailableVoices(voiceService.getVoices());
  }, []);

  const saveKey = (provider: string, key: string) => {
    localStorage.setItem(`nexus_key_${provider}`, key);
    setApiKeys(prev => ({ ...prev, [provider]: key }));
  };

  const updateVoiceSetting = (key: keyof VoiceConfig, value: any) => {
    const newSettings = { ...voiceSettings, [key]: value };
    setVoiceSettings(newSettings);
    localStorage.setItem(`nexus_${key}`, value.toString());
  };

  const handleSetPrimaryStore = async (provider: StorageProvider) => {
    if (!user) return;
    const updatedUser: User = { ...user, primaryDataStore: provider };
    setUser(updatedUser);
    const session = JSON.parse(localStorage.getItem('nexus_session') || '{}');
    session.user = updatedUser;
    localStorage.setItem('nexus_session', JSON.stringify(session));
    await userDataStore.init(updatedUser);
  };

  const handleSetTaskStore = async (provider: StorageProvider) => {
    if (!user) return;
    const updatedUser: User = { ...user, taskStorageProvider: provider };
    setUser(updatedUser);
    const session = JSON.parse(localStorage.getItem('nexus_session') || '{}');
    session.user = updatedUser;
    localStorage.setItem('nexus_session', JSON.stringify(session));
    await userDataStore.init(updatedUser);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">System Configuration</h1>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white mb-12 shadow-xl shadow-blue-500/20 flex items-center justify-between">
         <div className="max-w-md">
            <h2 className="text-xl font-black mb-2 flex items-center gap-2">
               🚀 UNLIMITED CAPACITY MODE
            </h2>
            <p className="text-blue-100 text-sm font-medium leading-relaxed">
               Add your own API keys below to bypass platform token limits. 
            </p>
         </div>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span>🛡️</span> Storage & Vault Architecture
        </h2>
        
        <div className="grid gap-6">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Primary Data Store</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { id: 'notion', name: 'Notion', icon: '📝' },
                { id: 'google-drive', name: 'Drive', icon: '📂' },
                { id: 'onedrive', name: 'OneDrive', icon: '☁️' },
                { id: 'local', name: 'Local', icon: '💻' }
              ].map(store => (
                <button
                  key={store.id}
                  onClick={() => handleSetPrimaryStore(store.id as any)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all border-2 ${
                    user?.primaryDataStore === store.id 
                      ? 'bg-blue-600/20 border-blue-500 text-white' 
                      : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-2xl">{store.icon}</span>
                  <span className="font-bold text-[10px]">{store.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Task Storage Engine</h3>
                <p className="text-sm text-slate-500">Universal adapter: where your Master Tasks are persisted.</p>
              </div>
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Multi-Adapter Active
              </div>
            </div>
            
            <select 
              value={user?.taskStorageProvider || 'local'}
              onChange={(e) => handleSetTaskStore(e.target.value as StorageProvider)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
            >
              <option value="local">Local Storage (Fast, Offline-First)</option>
              <option value="notion">Notion Database (Connected)</option>
              <option value="google-drive">Google Drive (JSON/Spreadsheet)</option>
              <option value="onedrive">Microsoft OneDrive (Excel/JSON)</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
           <span>🤖</span> AI Model Providers (BYOK)
        </h2>
        <div className="grid gap-4">
          {[
            { id: 'gemini', name: 'Google Gemini 2.0', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg' },
            { id: 'openai', name: 'OpenAI (GPT-4o)', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg' },
            { id: 'anthropic', name: 'Anthropic (Claude 3.5)', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Anthropic_logo.svg' },
            { id: 'perplexity', name: 'Perplexity (Search)', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Perplexity_AI_logo.svg' }
          ].map(provider => {
            const isConfigured = apiKeys[provider.id as keyof typeof apiKeys].length > 10;
            return (
              <div key={provider.id} className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm flex items-center justify-between transition-all hover:border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center p-2 bg-slate-50 rounded-xl relative">
                      <img src={provider.logo} alt={provider.name} className={`max-w-full ${isConfigured ? 'grayscale-0 opacity-100' : 'grayscale opacity-70'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{provider.name}</h3>
                      {isConfigured && <span className="text-[8px] bg-green-100 text-green-700 font-black px-1.5 py-0.5 rounded uppercase">Your Key Active</span>}
                    </div>
                  </div>
                </div>
                <input 
                  type="password" 
                  value={apiKeys[provider.id as keyof typeof apiKeys]}
                  onChange={(e) => saveKey(provider.id, e.target.value)}
                  placeholder="API Key" 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none w-48 font-mono"
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Settings;
