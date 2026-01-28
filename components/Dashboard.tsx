
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserSubscription, User } from '../types';
import { authService } from '../services/authService';

const data = [
  { name: 'Mon', usage: 1200 },
  { name: 'Tue', usage: 1900 },
  { name: 'Wed', usage: 3200 },
  { name: 'Thu', usage: 2100 },
  { name: 'Fri', usage: 4500 },
  { name: 'Sat', usage: 800 },
  { name: 'Sun', usage: 1100 },
];

const Dashboard: React.FC<{ subscription: UserSubscription }> = ({ subscription }) => {
  const [user] = useState<User | null>(authService.getCurrentUser());
  const platformUsagePercentage = (subscription.tokensUsed / subscription.tokenLimit) * 100;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Executive Control</h1>
          <p className="text-slate-500 flex items-center gap-2">
            Welcome back, {user?.displayName.split(' ')[0]}. Your platform is secured by <span className="font-bold text-blue-600 uppercase text-xs tracking-widest">{user?.primaryDataStore || 'Standard Encryption'}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs font-bold border border-slate-800 flex items-center gap-2 shadow-lg">
             <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
             Vault Connected
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-xs font-bold border border-blue-100">
            {subscription.tier} Tier
          </div>
        </div>
      </header>

      {/* Connectivity Banner */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-4 mb-10 flex items-center gap-6 overflow-x-auto no-scrollbar shadow-sm">
         <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4 shrink-0 border-r border-slate-100 pr-6">Connectivity Status</div>
         <div className="flex gap-8 items-center pr-4">
            {[
              { name: 'Gmail', status: 'Active', icon: '📩' },
              { name: 'Calendar', status: 'Active', icon: '📅' },
              { name: 'OneDrive', status: 'Offline', icon: '☁️' },
              { name: 'Notion', status: 'Active', icon: '📝' },
              { name: 'GitHub', status: 'Syncing', icon: '🐙' }
            ].map(s => (
              <div key={s.name} className="flex items-center gap-2 shrink-0">
                 <span className="text-lg">{s.icon}</span>
                 <span className="text-xs font-bold text-slate-700">{s.name}</span>
                 <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-green-500' : s.status === 'Offline' ? 'bg-slate-300' : 'bg-amber-400 animate-pulse'}`}></span>
              </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* PLATFORM TOKENS */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
             <span className="text-[8px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded font-black uppercase">Quota Tracking</span>
          </div>
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Platform Capacity</h3>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {subscription.tokensUsed.toLocaleString()} <span className="text-slate-300 text-lg">/ {subscription.tokenLimit.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${platformUsagePercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-bold">Standard fallback tokens</p>
        </div>

        {/* BYOK TOKENS */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
             <span className="text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded font-black uppercase">Direct Keys</span>
          </div>
          <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Private API Usage</h3>
          <div className="text-3xl font-bold text-white mb-2">
            {(subscription.byokTokensUsed || 0).toLocaleString()} <span className="text-slate-600 text-lg">TOKENS</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-full rounded-full opacity-50" />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Unlimited Capacity Unlocked</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Productivity Velocity</h3>
          <div className="text-3xl font-bold text-slate-900 mb-2">142 <span className="text-slate-300 text-lg">tasks</span></div>
          <p className="text-[10px] text-green-600 mt-2 font-bold uppercase tracking-widest">↑ 12% Productivity Gain</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span>📈</span> Resource Consumption
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="usage" radius={[4, 4, 0, 0]}>
                   {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#2563eb' : '#f1f5f9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
            <span>🚨</span> Intelligent Alerts
            <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Clear All</button>
          </h3>
          <div className="space-y-4">
            {[
              { id: 1, type: 'calendar', title: 'Double booking detected: Client Pitch vs board', time: '2h ago', color: 'bg-amber-50 text-amber-700 border-amber-100' },
              { id: 2, type: 'task', title: '7 high-priority tasks missing due dates in Notion', time: '5h ago', color: 'bg-red-50 text-red-700 border-red-100' },
              { id: 3, type: 'email', title: 'Draft reply generated for "Strategic Partnership"', time: '8h ago', color: 'bg-blue-50 text-blue-700 border-blue-100' }
            ].map(alert => (
              <div key={alert.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${alert.color} transition-transform hover:scale-[1.01] cursor-pointer`}>
                <div className="text-xl shrink-0">
                  {alert.type === 'calendar' ? '📅' : alert.type === 'task' ? '✅' : '📧'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{alert.title}</p>
                  <p className="text-[10px] opacity-60 uppercase font-black tracking-widest">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
             <p className="text-xs text-slate-400 font-medium">Nexus Intelligence is monitoring 12 cross-platform triggers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
