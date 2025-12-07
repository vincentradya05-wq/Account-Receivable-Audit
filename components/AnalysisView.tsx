import React, { useState, useRef, useEffect } from 'react';
import { InvoiceRow, AuditSummary, ChatMessage } from '../types';
import { geminiService } from '../geminiService';
import { Send, Mic, StopCircle, Bot, User, Loader2, Play } from 'lucide-react';

interface AnalysisViewProps {
  data: InvoiceRow[];
  summary: AuditSummary;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, summary }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: 'Halo. Saya AuditGuard, asisten auditor senior Anda. Ada yang bisa saya bantu terkait prosedur substantif hari ini? Anda bisa bertanya tentang risiko Lapping atau konfirmasi piutang.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Audio Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseText = await geminiService.analyzeQuery(input, data, summary, history);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, modelMsg]);
    setIsProcessing(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing mic", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    
    // Add a placeholder "Audio Message" to UI
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: "🎤 [Voice Query]",
      timestamp: new Date(),
      isAudio: true
    };
    setMessages(prev => [...prev, userMsg]);

    // Convert Blob to Base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      const base64Content = base64data.split(',')[1]; // Remove data URL prefix

      const responseText = await geminiService.analyzeAudioQuery(base64Content, data, summary);
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, modelMsg]);
      setIsProcessing(false);
    };
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm border
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none' 
                  : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'}`}>
                <p className="whitespace-pre-wrap leading-relaxed text-sm">
                  {msg.text}
                </p>
                <span className={`text-[10px] mt-2 block opacity-70`}>
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start w-full">
            <div className="flex max-w-[80%] gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                 <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                <span className="text-sm text-slate-500">Analyzing audit evidence...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xl flex items-center gap-4">
           <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition-all flex-shrink-0 flex items-center justify-center
              ${isRecording 
                ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
            `}
          >
            {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleSend()}
            placeholder="Ask about Lapping, Specific Invoices, or Bad Debt..."
            className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
            disabled={isProcessing}
          />
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
