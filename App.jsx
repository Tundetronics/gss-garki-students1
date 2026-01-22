 import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Volume2, QrCode, X, 
  Settings, Sparkles, ShieldAlert, Heart
} from 'lucide-react';

// Access the API key from Vercel/Vite environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

const App = () => {
  const [val, setVal] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [diagError, setDiagError] = useState("");

  const callAI = async (prompt) => {
    if (!apiKey || apiKey.length < 5) {
      return "DIAGNOSTIC ERROR: API Key missing. Please add VITE_GEMINI_API_KEY to Vercel Environment Variables and REDEPLOY.";
    }

    setIsProcessing(true);
    const sys = "Expert academic counselor for GSS Garki students. Create an 8-day intensive study plan. Use plain human-friendly text only. No markdown.";
    
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: sys }] }
        }) 
      });

      if (r.status === 403 || r.status === 400) {
        return "DIAGNOSTIC ERROR: Invalid or expired API Key. Please verify your key in Google AI Studio.";
      }

      const d = await r.json();
      return d.candidates[0].content.parts[0].text;
    } catch (e) {
      return "ORCHESTRATION FAILED: Connection interrupted. Please check your internet signal.";
    } finally {
      setIsProcessing(false);
    }
  };

  const runOrchestration = async () => {
    if (!val) return;
    const res = await callAI(`Plan for: ${val}`);
    setResult(res);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-blue-600">
      <nav className="p-6 border-b border-white/10 bg-black/40 backdrop-blur-xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-yellow-500" />
          <span className="font-black tracking-widest uppercase text-sm">Success Navigator</span>
        </div>
        <div className="text-[10px] font-bold text-blue-400 tracking-[0.3em] uppercase">GSS Garki Gift</div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            Your Academic <br/><span className="text-yellow-500 italic">Blueprint</span>
          </h1>
          <p className="text-xl text-slate-400">Enter your subjects to orchestrate a personalized study path.</p>
        </div>

        <div className="w-full max-w-xl bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-6">
          <input 
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full bg-black/50 p-6 rounded-2xl text-white text-center text-2xl outline-none border border-white/10 focus:border-blue-500 transition-all"
            placeholder="e.g. Maths, Biology"
          />
          <button 
            onClick={runOrchestration}
            className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-black text-xl uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <Sparkles size={24}/> Orchestrate Plan
          </button>
        </div>
      </main>

      <footer className="bg-blue-900 h-20 border-t-8 border-yellow-500 flex items-center justify-between px-10 mt-auto">
        <div className="flex items-center gap-4">
          <Settings className="text-yellow-500 animate-spin-slow" size={24} />
          <p className="text-sm font-black text-white uppercase">Rotary Club of Abuja HighRise</p>
        </div>
        <Heart className="text-yellow-500 fill-yellow-500" size={20} />
      </footer>

      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-6">
          <div className="bg-slate-900 border-2 border-yellow-500/40 rounded-[40px] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-black text-white uppercase">Result Terminal</h2>
              <button onClick={() => setShowModal(false)} className="bg-white/10 p-3 rounded-xl text-white hover:bg-red-500 transition-colors"><X/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 text-xl text-slate-300 leading-relaxed whitespace-pre-wrap">
              {result && result.startsWith("DIAGNOSTIC") ? (
                <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-3xl flex items-center gap-6">
                    <ShieldAlert className="text-red-500" size={48}/>
                    <p className="text-red-200 font-bold">{result}</p>
                </div>
              ) : (
                result
              )}
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex flex-col items-center justify-center space-y-6">
          <div className="h-20 w-20 border-8 border-t-yellow-500 border-white/5 rounded-full animate-spin"></div>
          <p className="text-xl font-black text-white uppercase tracking-[0.5em] animate-pulse">Orchestrating...</p>
        </div>
      )}

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
      `}</style>
    </div>
  );
};

export default App;
