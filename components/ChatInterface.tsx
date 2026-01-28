
import React, { useState, useRef, useEffect } from 'react';
import { aiProviderService } from '../services/aiProviderService';
import { gemini } from '../services/geminiService';
import { voiceService, VoiceSettings } from '../services/voiceService';
import { PERSONAS } from '../constants';
import { Persona, Interaction, UserSubscription, AIProvider } from '../types';

interface ChatProps {
    subscription: UserSubscription;
    setSubscription: React.Dispatch<React.SetStateAction<UserSubscription>>;
}

const ChatInterface: React.FC<ChatProps> = ({ subscription, setSubscription }) => {
  const [messages, setMessages] = useState<Interaction[]>([
    { id: '1', conversationId: 'c1', sender: 'agent', agentSlug: 'orchestrator', content: 'Hello Alex, I am Nexus. How can I assist your operations today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'auto'>('auto');
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    autoSpeak: localStorage.getItem('nexus_auto_speak') === 'true',
    voiceName: localStorage.getItem('nexus_voice_name') || '',
    rate: 1,
    pitch: 1
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, interimTranscript]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = textToSend || input;
    if (!messageContent.trim() || isTyping) return;

    const userMessage: Interaction = {
      id: Date.now().toString(),
      conversationId: 'c1',
      sender: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setInterimTranscript('');
    setIsTyping(true);

    try {
      let providerToUse: AIProvider = selectedProvider === 'auto' 
        ? await aiProviderService.getBestProvider(messageContent) 
        : selectedProvider;

      let targetPersona = activePersona;
      if (activePersona.slug === 'orchestrator') {
          const slug = await gemini.orchestrate(messageContent);
          targetPersona = PERSONAS.find(p => p.slug === slug) || PERSONAS[0];
          setActivePersona(targetPersona);
      }

      const history = messages.slice(-5).map(m => ({ 
        role: m.sender === 'user' ? 'user' as const : 'model' as const, 
        text: m.content 
      }));

      const response = await aiProviderService.chat(
          providerToUse,
          targetPersona, 
          messageContent, 
          history, 
          { 
            useSearch: targetPersona.slug === 'research' || messageContent.toLowerCase().includes('search') 
          }
      );

      const agentMessage: Interaction = {
        id: (Date.now() + 1).toString(),
        conversationId: 'c1',
        sender: 'agent',
        agentSlug: targetPersona.slug,
        content: response.text,
        timestamp: new Date(),
        tokens: response.usage.totalTokens,
        provider: response.provider,
        source: response.source
      };

      setMessages(prev => [...prev, agentMessage]);
      
      setSubscription(prev => {
        const tokenAmount = agentMessage.tokens || 0;
        if (response.source === 'platform') {
          return {
            ...prev,
            tokensUsed: prev.tokensUsed + tokenAmount
          };
        } else {
          return {
            ...prev,
            byokTokensUsed: (prev.byokTokensUsed || 0) + tokenAmount
          };
        }
      });

      // Voice Output Logic
      if (voiceSettings.autoSpeak || isVoiceMode) {
        voiceService.speak(response.text, voiceSettings, () => {
          if (isVoiceMode) {
            startVoiceCapture();
          }
        });
      }

    } catch (error: any) {
      console.error(error);
      const errorMessage: Interaction = {
        id: (Date.now() + 1).toString(),
        conversationId: 'c1',
        sender: 'agent',
        agentSlug: 'orchestrator',
        content: `Operational failure: ${error.message || "Unknown error"}.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const startVoiceCapture = () => {
    setIsListening(true);
    voiceService.startListening(
      (text, isFinal) => {
        setInterimTranscript(text);
        if (isFinal) {
          setIsListening(false);
          handleSend(text);
        }
      },
      () => setIsListening(false),
      (err) => {
        console.error("STT Error:", err);
        setIsListening(false);
      }
    );
  };

  const toggleVoiceMode = () => {
    const newState = !isVoiceMode;
    setIsVoiceMode(newState);
    if (newState) {
      startVoiceCapture();
    } else {
      voiceService.stopListening();
      voiceService.stopSpeaking();
    }
  };

  const speakMessage = (text: string) => {
    voiceService.speak(text, voiceSettings);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="text-2xl">{activePersona.icon}</div>
          <div>
            <h2 className="font-bold text-slate-900">{activePersona.name}</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                 <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span> {isListening ? 'Listening...' : 'Active'}
              </span>
              <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
                 <select 
                    value={selectedProvider} 
                    onChange={(e) => setSelectedProvider(e.target.value as any)}
                    className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded focus:outline-none"
                 >
                    <option value="auto">Auto-Router</option>
                    <option value="gemini">Gemini Flash</option>
                    <option value="openai">GPT-4o</option>
                    <option value="anthropic">Claude 3.5</option>
                    <option value="perplexity">Perplexity</option>
                 </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleVoiceMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isVoiceMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <span className={isVoiceMode ? 'animate-pulse' : ''}>🎙️</span>
            {isVoiceMode ? 'Voice Active' : 'Voice Mode'}
          </button>
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              {PERSONAS.map(p => (
                  <button 
                      key={p.id}
                      onClick={() => setActivePersona(p)}
                      title={p.name}
                      className={`p-2 rounded-lg transition-all ${activePersona.slug === p.slug ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                      {p.icon}
                  </button>
              ))}
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-sm ${
                msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200'
              }`}>
                {msg.sender === 'user' ? '👤' : PERSONAS.find(p => p.slug === msg.agentSlug)?.icon || '🧠'}
              </div>
              <div className={`group relative px-5 py-3.5 rounded-3xl shadow-sm text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.content}
                
                {msg.sender === 'agent' && (
                  <button 
                    onClick={() => speakMessage(msg.content)}
                    className="absolute -right-10 top-2 p-2 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Read Aloud"
                  >
                    🔊
                  </button>
                )}

                {(msg.tokens || msg.provider) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100/20 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                              {msg.provider || 'System'} • {msg.tokens || 0} tokens
                           </span>
                           {msg.source && (
                             <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${msg.source === 'user' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                               {msg.source === 'user' ? 'Your API' : 'Platform API'}
                             </span>
                           )}
                        </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {interimTranscript && (
          <div className="flex justify-end">
             <div className="max-w-[85%] px-5 py-3.5 rounded-3xl bg-blue-50 text-blue-400 italic text-sm border border-blue-100">
               {interimTranscript}...
             </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm shrink-0 animate-bounce">
                {activePersona.icon}
              </div>
              <div className="px-5 py-3.5 bg-white border border-slate-100 rounded-3xl rounded-tl-none flex gap-1 items-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="p-6 bg-white border-t border-slate-200 pb-8">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="max-w-4xl mx-auto">
          <div className="relative flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : `Instruct ${activePersona.name}...`}
                className={`w-full bg-slate-50 border border-slate-200 rounded-3xl pl-6 pr-12 py-4.5 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all text-slate-900 shadow-inner ${isListening ? 'ring-2 ring-red-100' : ''}`}
                disabled={isListening}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1.5 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white w-12 h-12 rounded-2xl shadow-lg transition-all flex items-center justify-center"
              >
                <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            <button 
              type="button"
              onClick={isListening ? voiceService.stopListening : startVoiceCapture}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              title={isListening ? "Stop Listening" : "Voice Input"}
            >
              <span className="text-xl">{isListening ? '⏹️' : '🎙️'}</span>
            </button>
          </div>
        </form>
        <div className="max-w-4xl mx-auto mt-4 flex items-center justify-between px-2">
           <div className="flex gap-5">
               <button type="button" className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                 <span className="text-lg">📎</span> Docs
               </button>
               <button type="button" className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                 <span className="text-lg">🎙️</span> Voice
               </button>
               <button type="button" className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                 <span className="text-lg">📊</span> Analyze
               </button>
           </div>
           {isListening && (
             <div className="flex items-center gap-2">
                <div className="h-1 w-1 bg-red-400 rounded-full animate-ping"></div>
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Live Audio Feed</span>
             </div>
           )}
           <div className="text-[10px] text-slate-300 font-medium flex items-center gap-3">
              <span>Nexus Context: Voice Enabled</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <span className="flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                 Platform Fallback Ready
              </span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
