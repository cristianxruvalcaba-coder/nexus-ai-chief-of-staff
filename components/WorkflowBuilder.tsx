
import React, { useState } from 'react';
import { Workflow } from '../types';

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'w1',
    name: 'Morning Briefing',
    description: 'Summarizes Gmail and Calendar at 8 AM daily.',
    active: true,
    steps: []
  },
  {
    id: 'w2',
    name: 'Auto-Task Cleanup',
    description: 'Archives completed tasks in Notion every Sunday.',
    active: false,
    steps: []
  }
];

const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Automation Workflows</h1>
          <p className="text-slate-500">Multi-step sequences triggered by events or schedules.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
          <span>＋</span> New Workflow
        </button>
      </header>

      <div className="grid gap-6">
        {workflows.map(wf => (
          <div key={wf.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${wf.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {wf.active ? '⚡' : '💤'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{wf.name}</h3>
                <p className="text-slate-500 text-sm">{wf.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <div className={`text-sm font-bold ${wf.active ? 'text-green-600' : 'text-slate-400'}`}>
                  {wf.active ? 'RUNNING' : 'INACTIVE'}
                </div>
                <div className="text-xs text-slate-400">Last run: 4h ago</div>
              </div>
              <button 
                onClick={() => toggleWorkflow(wf.id)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${wf.active ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${wf.active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-3xl p-8 flex items-center gap-8">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-sm border border-blue-100">💡</div>
        <div>
          <h4 className="text-lg font-bold text-blue-900 mb-1">Agent Discovery</h4>
          <p className="text-blue-700/70 max-w-lg">
            Nexus can suggest new workflows by analyzing your chat history and integration usage. 
            Enable "Smart Suggestions" in Settings.
          </p>
        </div>
        <button className="ml-auto text-blue-600 font-bold hover:underline">Learn more</button>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
