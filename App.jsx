import React, { useState } from 'react';
import { Target, Globe, X, Award, MapPin, Table, Search, ShieldCheck, Heart, AlertCircle, Loader2 } from 'lucide-react';

/**
 * RC Abuja HighRise Market Engine (The Sniper)
 * Version: 2.0 (Elite Edition)
 * Purpose: Precision real-time lead generation for vocational empowerment.
 * Architect: Rtn. Babatunde Adesina — The Agentic Orchestrator
 * RC Abuja HighRise Vocational Service Project 2026
 */

// MANDATORY: Key is provided by environment variables in Vercel/Deployment
const apiKey = ""; 

const App = () => {
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- CLEAN-STREAM PROTOCOL ---
  // Ensures zero markdown symbols (*, #, _, etc.) clutter the professional interface or audio.
  const sanitize = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/[*#_~`\[\]()<>|]/g, '').trim();
  };

  // --- RESILIENCE PATCH: EXPONENTIAL BACKOFF ---
  // Orchestrates up to 5 retry attempts for maximum reliability during live demos.
  const executeMarketSweep = async () => {
    if (!query.trim()) return;
    setIsScraping(true);
    setErrorMsg(null);
    
    const sysInstruction = `You are the 'RC Abuja HighRise Market Engine'. 
    Your mission is to find high-quality business leads based on the query. 
    Return ONLY a JSON array of objects with keys: {name, phone, location, niche}. 
    DO NOT use markdown code blocks. NO asterisks. NO hashes. 
    Focus on real, grounded data.`;

    const delays = [1000, 2000, 4000, 8000, 16000];
    
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Generate 12-15 business leads for: ${query}` }] }],
            systemInstruction: { parts: [{ text: sysInstruction }] },
            tools: [{ "google_search": {} }] 
          })
        });

        if (!response.ok) throw new Error("Network Response Failure");

        const data = await response.json();
        const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        
        // Clean JSON formatting
        const cleanJson = rawOutput.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        
        const finalLeads = (Array.isArray(parsed) ? parsed : []).map(l => ({
          name: sanitize(l.name || "Entity Unidentified"),
          phone: sanitize(l.phone || "Contact Pending"),
          location: sanitize(l.location || "Regional Area"),
          niche: sanitize(l.niche || "General Enterprise")
        }));
        
        setLeads(finalLeads);
        setShowModal(true);
        setIsScraping(false);
        return; 

      } catch (e) {
        if (attempt === delays.length) {
          setErrorMsg("Orchestration Interrupted: Check signal and retry.");
          setIsScraping(false);
        } else {
          await new Promise(res => setTimeout(res, delays[attempt]));
        }
      }
    }
  };

  const exportCSV = () => {
    const csvHeader = "Business Name,Contact,Location,Niche\n";
    const csvRows = leads.map(l => `"${l.name}","${l.phone}","${l.location}","${l.niche}"`).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `RC_HighRise_Market_Leads.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#002147] text-white flex flex-col font-sans selection:bg-yellow-500 selection:text-[#002147]">
      {/* Premium Command Header */}
      <nav className="p-6 border-b border-yellow-500/30 bg-[#00152e] flex justify-between items-center sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-500 p-2.5 rounded-xl shadow-lg shadow-yellow-500/10">
            <Target size={28} className="text-[#002147]" />
          </div>
          <div>
            <span className="font-black tracking-widest uppercase text-base block leading-none">RC Abuja HighRise</span>
            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.3em]">Market Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Award size={16} className="text-yellow-500" />
          Architect: Rtn. Babatunde Adesina
        </div>
      </nav>

      {/* Hero Action Center */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none italic">
            Precision <span className="text-yellow-500 not-italic">Scouting</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
            Execute a real-time sweep of the global market to orchestrate business growth for our community.
          </p>
        </div>

        {/* The Scrutiny Module */}
        <div className="w-full max-w-2xl bg-white/5 p-12 rounded-[50px] border border-white/10 shadow-2xl space-y-8 backdrop-blur-xl relative">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Lead Parameters</label>
            <div className="relative">
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && executeMarketSweep()}
                className="w-full bg-black/40 p-7 rounded-3xl text-white text-center text-2xl outline-none border border-white/10 focus:border-yellow-500 transition-all font-bold" 
                placeholder="e.g. IT Consultants in Wuse" 
              />
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700" size={24} />
            </div>
          </div>

          <button 
            disabled={isScraping || !query.trim()} 
            onClick={executeMarketSweep} 
            className="w-full bg-yellow-500 py-7 rounded-3xl font-black text-xl uppercase text-[#002147] shadow-[0_20px_50px_rgba(234,179,8,0.2)] hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {isScraping ? <Loader2 size={26} className="animate-spin" /> : <Globe size={26} />}
            {isScraping ? "Scrutinizing Market..." : "Execute Precision Sweep"}
          </button>

          {errorMsg && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-red-400 text-sm font-bold animate-bounce">
              <AlertCircle size={20} /> {errorMsg}
            </div>
          )}
        </div>

        {/* Trust Framework */}
        <div className="flex flex-wrap justify-center gap-10 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
          <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-yellow-500" /> Grounded Truth</span>
          <span className="flex items-center gap-2"><Table size={14} className="text-blue-500" /> Export Ready</span>
          <span className="flex items-center gap-2"><Heart size={14} className="text-red-500" /> Vocational Service</span>
        </div>
      </main>

      {/* Results Display */}
      {showModal && (
        <div className="fixed inset-0 bg-[#00152e]/98 backdrop-blur-3xl z-[100] flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-slate-900 border-2 border-yellow-500/30 rounded-[40px] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-yellow-500 leading-none">Market Intelligence</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{leads.length} Precision Results</p>
              </div>
              <div className="flex gap-4">
                <button onClick={exportCSV} className="bg-green-600 px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-500 transition-all"><Table size={20}/> Export CSV</button>
                <button onClick={() => setShowModal(false)} className="bg-white/5 p-3 rounded-2xl hover:bg-red-500 border border-white/10 transition-colors"><X/></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-8">
              <table className="w-full text-left font-light">
                <thead className="text-[10px] uppercase text-slate-500 border-b border-white/10">
                  <tr>
                    <th className="p-5 tracking-widest">Name</th>
                    <th className="p-5 tracking-widest">Contact</th>
                    <th className="p-5 tracking-widest">Location</th>
                    <th className="p-5 tracking-widest">Specialty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.map((l, i) => (
                    <tr key={i} className="hover:bg-yellow-500/5 transition-all group">
                      <td className="p-5 font-bold text-white group-hover:text-yellow-500 transition-colors">{l.name}</td>
                      <td className="p-5 text-yellow-500/80 font-mono italic">{l.phone}</td>
                      <td className="p-5 text-slate-400 text-sm flex items-center gap-2 mt-1.5"><MapPin size={14} className="text-slate-600"/> {l.location}</td>
                      <td className="p-5 text-slate-500 italic text-sm">{l.niche}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branded Line */}
      <footer className="bg-[#00152e] h-28 border-t-8 border-yellow-500 flex items-center justify-between px-12 mt-auto">
        <div className="flex items-center gap-6">
          <img src="https://upload.wikimedia.org/wikipedia/en/thumb/0/06/Rotary_International_logo.svg/1200px-Rotary_International_logo.svg.png" alt="Rotary" className="h-12 brightness-0 invert opacity-40" />
          <div className="h-12 w-[1px] bg-white/10"></div>
          <p className="text-xs font-black text-white/60 uppercase tracking-widest">RC Abuja HighRise</p>
        </div>
        <Heart className="text-red-600 fill-red-600 animate-pulse" size={24} />
      </footer>
    </div>
  );
};

export default App;
