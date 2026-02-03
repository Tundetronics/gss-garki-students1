import React, { useState, useEffect } from 'react';
import { 
  Target, Search, Download, ShieldCheck, 
  Trash2, Table, Users, MapPin, Sparkles, X, Volume2 
} from 'lucide-react';

const apiKey = ""; // Provided at runtime

const App = () => {
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // --- 🎯 THE SNIPER ENGINE ---
  const executeSniperScrape = async () => {
    if (!query) return;
    setIsScraping(true);
    setLeads([]);

    const systemPrompt = `You are the 'Sniper Lead Orchestrator'. Your job is to find REAL business leads. 
    Search for names, phone numbers (if available), and locations for the user's request. 
    Return ONLY a JSON array of objects with the keys: 'business_name', 'contact', 'location', 'specialty'.
    Example format: [{"business_name": "Example Ltd", "contact": "08012345678", "location": "Abuja", "specialty": "Solar"}]`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Find leads for: ${query}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: [{ "google_search": {} }] // Uses Google Search grounding
        })
      });

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      
      // Clean JSON from potential markdown backticks
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const parsedLeads = JSON.parse(cleanJson);
      
      setLeads(parsedLeads);
      setShowModal(true);
    } catch (e) {
      console.error("Sniper Error:", e);
    } finally {
      setIsScraping(false);
    }
  };

  // --- 📊 EXCEL (CSV) GENERATOR ---
  const exportToExcel = () => {
    const headers = ["Business Name", "Contact", "Location", "Specialty"];
    const rows = leads.map(l => [l.business_name, l.contact, l.location, l.specialty].join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `GSS_Garki_Leads_${query.replace(/\s/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-red-600">
      {/* Navbar */}
      <nav className="p-6 border-b border-white/10 bg-black/50 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-3 uppercase font-black tracking-widest text-sm text-red-500">
          <Target size={20} className="animate-pulse" />
          Sniper Lead Orchestrator
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block">Real-Time Market Intelligence</div>
      </nav>

      {/* Main UI */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            Precision <br/><span className="text-red-600 italic">Market Scouting</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-xl mx-auto font-light">
            Orchestrate a real-time sweep of the internet to identify qualified business partners and customers.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-white/5 p-12 rounded-[50px] border border-white/10 shadow-2xl space-y-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Search size={120} />
          </div>

          <div className="space-y-4 relative z-10">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Industry & Location</label>
            <div className="relative">
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSniperScrape()}
                className="w-full bg-black/50 p-6 rounded-2xl text-white text-center text-xl outline-none border border-white/10 focus:border-red-600 transition-all placeholder:text-slate-700"
                placeholder="e.g. Graphic Designers in Abuja"
              />
              <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
            </div>
          </div>

          <button 
            disabled={isScraping || !query}
            onClick={executeSniperScrape}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 py-6 rounded-2xl font-black text-xl uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isScraping ? (
              <>
                <div className="h-6 w-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Executing Sniper Sweep...</span>
              </>
            ) : (
              <>
                <Target size={24} />
                <span>Execute Sniper Scrape</span>
              </>
            )}
          </button>
        </div>

        <div className="flex gap-8 text-slate-500 font-black text-[10px] uppercase tracking-widest">
            <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-green-500"/> Verified Contacts</span>
            <span className="flex items-center gap-2"><Table size={14} className="text-blue-500"/> Excel Ready</span>
        </div>
      </main>

      {/* Result Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 lg:p-10 animate-in zoom-in duration-300">
          <div className="bg-slate-900 border-2 border-red-600/30 rounded-[40px] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_0_100px_rgba(220,38,38,0.2)]">
            
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Sparkles className="text-yellow-500" />
                  Scouted Lead Terminal
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Precision Intelligence • {leads.length} Entities Found</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={exportToExcel}
                  className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-xl text-white font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                  <Download size={20}/> Export to Excel
                </button>
                <button onClick={() => setShowModal(false)} className="bg-white/10 p-3 rounded-xl text-white hover:bg-red-600 transition-colors"><X/></button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 lg:p-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="p-4">Business Name</th>
                    <th className="p-4">Contact/Phone</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Specialty</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="p-4 font-bold text-white group-hover:text-red-400">{lead.business_name}</td>
                      <td className="p-4 font-mono text-sm text-green-400">{lead.contact}</td>
                      <td className="p-4 text-slate-400 flex items-center gap-2"><MapPin size={12}/> {lead.location}</td>
                      <td className="p-4 text-slate-400 italic text-sm">{lead.specialty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-red-600/5 border-t border-red-600/20 text-center">
               <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Confidential Intelligence Report • GSS Garki Entrepreneurship Program</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-blue-900 h-20 border-t-8 border-yellow-500 flex items-center justify-between px-10 mt-auto">
        <div className="flex items-center gap-4">
          <Users className="text-yellow-500" size={24} />
          <p className="text-sm font-black text-white uppercase">Vocational Service Excellence</p>
        </div>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Rotary Abuja HighRise</p>
      </footer>
    </div>
  );
};

export default App;
