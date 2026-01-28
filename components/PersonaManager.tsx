
import React from 'react';
import { PERSONAS } from '../constants';

const PersonaManager: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Executive Team</h1>
        <p className="text-slate-500">Customize the system prompts and roles for each specialized AI agent.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PERSONAS.map(p => (
          <div key={p.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl">
                {p.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">@{p.slug}</span>
              </div>
              <button className="text-blue-600 text-sm font-bold hover:underline">Edit Prompt</button>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Instructions</h4>
              <p className="text-sm text-slate-600 line-clamp-3 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                "{p.systemPrompt}"
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {p.useCases.map(uc => (
                  <span key={uc} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium">
                    {uc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        <div className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center group hover:border-blue-400 transition-colors cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-3xl mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            ＋
          </div>
          <h3 className="text-lg font-bold text-slate-900">Custom Agent</h3>
          <p className="text-sm text-slate-500">Hire a specialized AI for a custom use case.</p>
        </div>
      </div>
    </div>
  );
};

export default PersonaManager;
