
export interface VoiceSettings {
  autoSpeak: boolean;
  voiceName: string;
  rate: number;
  pitch: number;
}

class VoiceService {
  private recognition: any | null = null;
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
    
    // Load voices
    this.loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
  }

  getVoices() {
    return this.voices;
  }

  isSupported() {
    return !!this.recognition && !!this.synth;
  }

  startListening(onResult: (text: string, isFinal: boolean) => void, onEnd: () => void, onError: (err: any) => void) {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      onResult(transcript, result.isFinal);
    };

    this.recognition.onend = onEnd;
    this.recognition.onerror = onError;

    try {
      this.recognition.start();
    } catch (e) {
      console.error("Speech recognition already started or failed:", e);
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  speak(text: string, settings: VoiceSettings, onEnd?: () => void) {
    if (!this.synth) return;
    
    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = this.voices.find(v => v.name === settings.voiceName);
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.rate = settings.rate || 1;
    utterance.pitch = settings.pitch || 1;
    
    if (onEnd) utterance.onend = onEnd;
    
    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceService = new VoiceService();
