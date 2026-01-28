
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TaskType } from '../types';
import { userDataStore } from '../services/userDataStore';

const TaskDatabase: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<'All' | 'Today' | 'Week' | 'Maybe' | 'Completed'>('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setSyncStatus('syncing');
    setIsSyncing(true);
    try {
      const loaded = await userDataStore.getTasks();
      setTasks(loaded || []);
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    setSyncStatus('syncing');
    try {
      await userDataStore.saveTask(updatedTask);
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const createNewTask = async () => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: 'New Executive Task',
      status: 'Not started',
      priority: 'None',
      type: 'Later To-Do',
      areaOfLife: 'Personal',
      person: 'Personal',
      archived: false,
      completed: false,
      estTime: '15m'
    };
    await handleUpdateTask(newTask);
    setTasks(prev => [newTask, ...prev]);
    setSelectedTask(newTask);
  };

  const toggleComplete = (task: Task) => {
    handleUpdateTask({
      ...task,
      completed: !task.completed,
      status: !task.completed ? 'Completed' : 'Not started'
    });
  };

  const archiveTask = (task: Task) => {
    handleUpdateTask({ ...task, archived: true });
    if (selectedTask?.id === task.id) setSelectedTask(null);
  };

  const setAsToday = (task: Task) => {
    const today = new Date().toISOString().split('T')[0];
    handleUpdateTask({ ...task, type: 'Today To-Do', dueDate: today, doItDate: today });
  };

  const filteredTasks = tasks.filter(task => {
    if (task.archived) return false;
    const today = new Date().toISOString().split('T')[0];
    switch (activeView) {
      case 'Today': return task.type === 'Today To-Do' || task.dueDate === today;
      case 'Maybe': return task.type === 'Maybe To-Do';
      case 'Completed': return task.completed;
      case 'Week': {
        if (!task.dueDate) return false;
        const d = new Date(task.dueDate);
        const diff = (d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        return diff >= -1 && diff <= 7;
      }
      default: return !task.completed;
    }
  });

  const getSyncColor = () => {
    switch(syncStatus) {
      case 'synced': return 'bg-green-500';
      case 'syncing': return 'bg-amber-500 animate-pulse';
      case 'error': return 'bg-red-500';
      case 'offline': return 'bg-slate-400';
      default: return 'bg-slate-200';
    }
  };

  return (
    <div className="flex h-full bg-slate-50 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">✅</span>
                Master Task Database
              </h1>
              <div className="flex items-center gap-2 mt-1">
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Global Productivity Vault</p>
                 <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                 <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${getSyncColor()}`}></span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Synced to: <span className="text-blue-600">{userDataStore.getTaskStorageProviderName()}</span>
                    </span>
                 </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={createNewTask}
               className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all"
             >
               + New Task
             </button>
             <button 
               onClick={loadTasks}
               className={`p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all ${isSyncing ? 'animate-spin' : ''}`}
               title="Manual Sync"
             >
               🔄
             </button>
          </div>
        </header>

        <div className="px-8 py-4 bg-white border-b border-slate-100 flex items-center gap-1">
          {['All', 'Today', 'Week', 'Maybe', 'Completed'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view as any)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                activeView === view ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-12 text-center">Done</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Task Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Due Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Priority</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Life Area</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTasks.map(task => (
                  <tr 
                    key={task.id} 
                    onClick={() => setSelectedTask(task)}
                    className={`hover:bg-blue-50/30 cursor-pointer transition-colors group ${selectedTask?.id === task.id ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="px-6 py-4 text-center" onClick={(e) => { e.stopPropagation(); toggleComplete(task); }}>
                      <button className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                        task.completed ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'
                      }`}>
                        {task.completed && <span className="text-white text-[10px]">✓</span>}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {task.title}
                        </span>
                        {task.type === 'Today To-Do' && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Today</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500">{task.dueDate || '--'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider ${
                        task.status === 'Completed' ? 'bg-green-50 text-green-700' : 
                        task.status === 'In progress' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider ${
                        task.priority === 'High Priority' ? 'bg-red-50 text-red-700' :
                        task.priority === 'Medium' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span> {task.areaOfLife}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedTask && (
        <div className="w-[450px] bg-white border-l border-slate-200 shadow-2xl overflow-y-auto flex flex-col sticky top-0 h-full z-20">
          <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-3">
               <span className="text-2xl">📝</span>
               <h3 className="font-black text-slate-900 uppercase tracking-tighter">Task Detail</h3>
             </div>
             <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-900 transition-colors">✕</button>
          </header>

          <div className="p-8 space-y-8">
            <div className="flex gap-2">
              <button 
                onClick={() => toggleComplete(selectedTask)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${selectedTask.completed ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'}`}
              >
                {selectedTask.completed ? 'Re-open' : 'Complete'}
              </button>
              <button 
                onClick={() => setAsToday(selectedTask)}
                className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all"
              >
                Due Today
              </button>
              <button 
                onClick={() => archiveTask(selectedTask)}
                className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
              >
                Archive
              </button>
            </div>

            <div className="space-y-4">
              <input 
                type="text" 
                value={selectedTask.title}
                onChange={(e) => handleUpdateTask({...selectedTask, title: e.target.value})}
                className="text-2xl font-black text-slate-900 w-full focus:outline-none border-b border-transparent focus:border-blue-100 pb-2"
                placeholder="Task Name"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Due Date</label>
                  <input 
                    type="date" 
                    value={selectedTask.dueDate || ''}
                    onChange={(e) => handleUpdateTask({...selectedTask, dueDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Do It Date</label>
                  <input 
                    type="date" 
                    value={selectedTask.doItDate || ''}
                    onChange={(e) => handleUpdateTask({...selectedTask, doItDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs font-bold text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <PropertySelect 
                  label="Status" 
                  value={selectedTask.status} 
                  options={['Not started', 'In progress', 'Completed']} 
                  onChange={(v) => handleUpdateTask({...selectedTask, status: v as TaskStatus})}
                />
                <PropertySelect 
                  label="Priority" 
                  value={selectedTask.priority} 
                  options={['High Priority', 'Medium', 'Low', 'None']} 
                  onChange={(v) => handleUpdateTask({...selectedTask, priority: v as TaskPriority})}
                />
                <PropertySelect 
                  label="Type" 
                  value={selectedTask.type} 
                  options={['Today To-Do', 'Later To-Do', 'Maybe To-Do']} 
                  onChange={(v) => handleUpdateTask({...selectedTask, type: v as TaskType})}
                />
              </div>
              <div className="space-y-4">
                <PropertySelect 
                  label="Area of Life" 
                  value={selectedTask.areaOfLife} 
                  options={['Career', 'Food', 'Special Interests', 'Health', 'Finance', 'Home', 'Personal']} 
                  onChange={(v) => handleUpdateTask({...selectedTask, areaOfLife: v as any})}
                />
                <PropertySelect 
                  label="Person" 
                  value={selectedTask.person} 
                  options={['Work', 'Spouse', 'Personal', 'Family']} 
                  onChange={(v) => handleUpdateTask({...selectedTask, person: v as any})}
                />
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Est. Time</label>
                  <input 
                    type="text" 
                    value={selectedTask.estTime || ''}
                    onChange={(e) => handleUpdateTask({...selectedTask, estTime: e.target.value})}
                    placeholder="e.g. 45m"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs font-bold text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Feels Like</label>
               <div className="flex flex-wrap gap-2">
                 {['Excited', 'Neutral', 'Dreading', 'Focused', 'Overwhelmed'].map(feel => (
                   <button
                     key={feel}
                     onClick={() => handleUpdateTask({...selectedTask, feels: feel as any})}
                     className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                       selectedTask.feels === feel ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                     }`}
                   >
                     {feel}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Notes & Documentation</label>
                <textarea 
                  value={selectedTask.notes || ''}
                  onChange={(e) => handleUpdateTask({...selectedTask, notes: e.target.value})}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-4 text-xs font-medium text-slate-700 leading-relaxed focus:outline-none focus:ring-4 focus:ring-blue-100/50"
                  placeholder="Capture context..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PropertySelect: React.FC<{ label: string; value: string; options: string[]; onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default TaskDatabase;
