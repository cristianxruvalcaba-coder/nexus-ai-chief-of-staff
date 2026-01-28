
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import WorkflowBuilder from './components/WorkflowBuilder';
import TaskDatabase from './components/TaskDatabase';
import Settings from './components/Settings';
import PersonaManager from './components/PersonaManager';
import { UserSubscription, User } from './types';
import { SUBSCRIPTION_LIMITS } from './constants';
import { authService } from './services/authService';
import { userDataStore } from './services/userDataStore';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: 'Free',
    tokensUsed: 12500,
    tokenLimit: SUBSCRIPTION_LIMITS.Free.tokens,
    byokTokensUsed: 0,
    workflowsUsed: 1,
    workflowLimit: SUBSCRIPTION_LIMITS.Free.workflows
  });

  useEffect(() => {
    if (user && user.primaryDataStore) {
      userDataStore.init(user);
    }
  }, [user]);

  const handleLogin = async (provider: 'google' | 'github' | 'microsoft') => {
    const loggedInUser = await authService.login(provider);
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="mb-10">
            <div className="w-24 h-24 bg-blue-600 rounded-[2rem] mx-auto flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-500/20 mb-8 rotate-3">
              N
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">NEXUS AI</h1>
            <p className="text-slate-400 font-medium px-4">Operating System for the high-performance executive.</p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => handleLogin('google')}
              className="w-full bg-white text-slate-900 py-3.5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 hover:bg-slate-50 shadow-lg shadow-white/5 active:scale-95"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-5 h-5" alt="Google" />
              Sign in with Google
            </button>
            <button 
              onClick={() => handleLogin('github')}
              className="w-full bg-slate-800 text-white py-3.5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 hover:bg-slate-700 shadow-lg active:scale-95"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" className="w-5 h-5 invert" alt="GitHub" />
              Sign in with GitHub
            </button>
            <button 
              onClick={() => handleLogin('microsoft')}
              className="w-full bg-white text-slate-700 py-3.5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 border border-slate-200 hover:bg-slate-50 shadow-lg active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              Sign in with Microsoft
            </button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-800/50">
             <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">End-to-End Encrypted</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Zero-Data Policy</span>
             </div>
             <p className="text-[9px] text-slate-600 leading-relaxed px-4">
               By signing in, you agree to our privacy architecture where your data resides exclusively in your own cloud infrastructure.
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto bg-white relative">
          <Routes>
            <Route path="/" element={<Dashboard subscription={subscription} />} />
            <Route path="/chat" element={<ChatInterface subscription={subscription} setSubscription={setSubscription} />} />
            <Route path="/workflows" element={<WorkflowBuilder />} />
            <Route path="/tasks" element={<TaskDatabase />} />
            <Route path="/personas" element={<PersonaManager />} />
            <Route path="/settings" element={<Settings subscription={subscription} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
