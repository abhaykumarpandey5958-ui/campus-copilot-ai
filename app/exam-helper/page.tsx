"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  ChevronLeft, 
  BookOpen, 
  Zap, 
  Check, 
  Award,
  BookOpenCheck
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ExamHelper() {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("5");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultRef.current && answer) {
        resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [answer]);

  const generateAnswer = async () => {
    if (!question.trim() || loading) return;

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, type }),
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
                setAnswer(fullContent);
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      setAnswer("❌ Erro: Unable to generate exam answer. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full" />
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
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <BookOpen size={20} />
            <span className="tracking-tight">Exam Pro AI</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest text-blue-400">
            <Award size={12} />
            <span>Academic Excellence</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        
        {/* Hero Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
        >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                Ace your exams with <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text">
                    structured precision.
                </span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto leading-relaxed text-lg font-medium">
                Our AI analyzes your syllabus to provide standard 2, 5, or 16-mark answers tailored for high scores.
            </p>
        </motion.div>

        {/* Input Card */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group"
        >
            <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Paste your exam question here..."
                className="w-full h-48 bg-transparent border-none resize-none focus:outline-none text-xl leading-relaxed placeholder-gray-600 font-medium"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                    {["2", "5", "16"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                type === t
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {t} Mark
                        </button>
                    ))}
                </div>

                <button
                    onClick={generateAnswer}
                    disabled={!question.trim() || loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-br from-blue-600 to-indigo-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Structuring...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={18} />
                            <span>Generate Answer</span>
                        </>
                    )}
                </button>
            </div>
            
            <Zap className="absolute top-[-20px] right-[-20px] w-32 h-32 text-white/[0.02] group-hover:text-white/[0.04] transition-colors -rotate-12 pointer-events-none" />
        </motion.div>

        {/* Answer Output Area */}
        <AnimatePresence>
            {(answer || loading) && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    ref={resultRef}
                    className="mt-16 space-y-8 pb-32"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                            <BookOpenCheck size={20} className="text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl tracking-tight">Structured Content</h3>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{type} Marks Allocated</p>
                        </div>
                    </div>

                    <div className="p-8 sm:p-14 bg-[#0a0a0f] border border-white/5 rounded-[48px] shadow-2xl relative overflow-hidden">
                        <div className="prose prose-invert max-w-none prose-h2:text-blue-400 prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-gray-300 prose-p:leading-8 prose-li:text-gray-300 prose-strong:text-white relative z-10">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {answer || "### Formatting structured answer...\n\nour architecture is optimizing the content for logical flow including Definition, Core Functionality, and Comparative analysis."}
                            </ReactMarkdown>
                        </div>
                        
                        {/* Subtle background numbers or lines */}
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none font-mono text-[300px] leading-none flex items-center justify-center">
                            {type}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </main>

      {/* Global CSS for scroll hiding */}
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