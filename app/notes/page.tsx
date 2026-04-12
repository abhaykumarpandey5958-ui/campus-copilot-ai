"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Volume2, 
  Copy, 
  ChevronLeft, 
  FileText, 
  Trash2, 
  Check, 
  Layers
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NotesPage() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (summaryRef.current) {
        summaryRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [summary]);

  const speak = (raw: string) => {
    if (!voiceOn) return;
    speechSynthesis.cancel();
    const clean = raw.replace(/[#*_`>-]/g, "").replace(/\n/g, " ");
    const utter = new SpeechSynthesisUtterance(clean);
    speechSynthesis.speak(utter);
  };

  const handleSummarize = async () => {
    if (!text.trim() || loading) return;

    setLoading(true);
    setSummary("");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("API failure");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder("utf-8");
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let eolIndex;
        while ((eolIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, eolIndex).trim();
          buffer = buffer.slice(eolIndex + 1);

          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content || "";
              if (delta) {
                fullContent += delta;
                setSummary(fullContent);
              }
            } catch {
              // Skip partial JSON chunks
            }
          }
        }
      }
      
      speak(fullContent);
    } catch {
      setSummary("❌ Error generating smart summary. Please try again.");
    }

    setLoading(false);
  };

  const copyText = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-2xl bg-white/[0.02] sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <FileText size={18} className="text-purple-400" />
            </div>
            <h1 className="font-bold tracking-tight text-lg">Notes Pro AI</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceOn(!voiceOn)}
            className={`p-2.5 rounded-xl border transition-all ${
              voiceOn 
              ? "bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
              : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}
            title={voiceOn ? "Voice synthesis active" : "Enable voice"}
          >
            <Volume2 size={18} />
          </button>
          <button
            onClick={() => { setText(""); setSummary(""); }}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
            title="Clear all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        
        {/* Title Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Layers size={12} />
                <span>Knowledge Management</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">
                Transform messy data into <br />
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-500 text-transparent bg-clip-text">
                    concise knowledge.
                </span>
            </h2>
            <p className="text-gray-400 max-w-2xl leading-relaxed">
                Paste your research papers, lecture transcripts, or messy notes below. Our AI will strip the noise and extract the essential truth.
            </p>
        </motion.div>

        {/* Input Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group mb-12"
        >
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Drop your content here (Ctrl+V)..."
                className="w-full h-80 p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] resize-none focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all text-lg leading-relaxed shadow-2xl"
            />
            
            <div className="absolute bottom-6 right-6 flex gap-4">
                <button
                    onClick={handleSummarize}
                    disabled={!text.trim() || loading}
                    className="flex items-center gap-3 bg-gradient-to-br from-purple-600 to-blue-600 px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={18} />
                            <span>Summarize Now</span>
                        </>
                    )}
                </button>
            </div>
        </motion.div>

        {/* Summary Output Area */}
        <AnimatePresence>
            {(summary || loading) && (
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    ref={summaryRef}
                    className="space-y-6 pb-24"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <Check size={16} className="text-blue-400" />
                            </div>
                            <h3 className="font-bold text-xl tracking-tight">AI Generated Insight</h3>
                        </div>
                        {summary && (
                            <button
                                onClick={copyText}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-bold"
                            >
                                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={13} />}
                                {copied ? "SUCCESS" : "COPY MARKDOWN"}
                            </button>
                        )}
                    </div>

                    <div className="p-8 sm:p-12 bg-white/[0.02] border border-white/5 rounded-[40px] shadow-inner relative overflow-hidden group">
                        {/* Interactive element */}
                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Layers className="text-white/10 w-32 h-32" />
                        </div>

                        <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-300 prose-p:leading-8 prose-li:text-gray-300 relative z-10">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {summary || "### Engineering Summary...\nOur intelligence model is currently refracting the provided data into optimized knowledge shards. This will result in a structured summary including key takeaways and conceptual frameworks."}
                            </ReactMarkdown>
                        </div>
                        
                        {loading && !summary && (
                             <div className="flex gap-2 mt-8">
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                        className="w-12 h-1 bg-purple-500/50 rounded-full"
                                    />
                                ))}
                             </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </main>

      {/* Custom Styles */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>

    </div>
  );
}