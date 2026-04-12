"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";
import { 
  Trophy, 
  Timer, 
  ChevronLeft, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb
} from "lucide-react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  options: string[];
  answer: string;
};

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);
  const [finished, setFinished] = useState(false);
  const router = useRouter();

  const nextQuestion = useCallback(() => {
    setSelected(null);
    setTimer(15);

    if (current + 1 < quiz.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  }, [current, quiz.length]);

  // ⏳ TIMER LOGIC
  useEffect(() => {
    if (!quiz.length || finished || loading) return;

    if (timer === 0) {
      nextQuestion();
      return;
    }

    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, quiz, finished, loading, nextQuestion]);

  // 🚀 GENERATE QUIZ
  const generateQuiz = async () => {
    if (!topic.trim() || loading) return;

    setLoading(true);
    setFinished(false);
    setScore(0);
    setCurrent(0);
    setSelected(null);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) throw new Error("API Failure");

      const data = await res.json();
      const parsed = JSON.parse(data.quiz);
      setQuiz(parsed);
      setTimer(15);
    } catch (err) {
      alert("⚠️ Failed to generate quiz. Please try a different topic.");
      console.error(err);
    }

    setLoading(false);
  };



  const handleAnswer = (opt: string) => {
    if (selected || finished) return;

    setSelected(opt);

    if (opt === quiz[current].answer) {
      setScore((prev) => prev + 1);
    }

    setTimeout(nextQuestion, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-indigo-600/10 blur-[130px] rounded-full opacity-50" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 blur-[130px] rounded-full opacity-50" />
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
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Lightbulb size={18} className="text-indigo-400" />
            </div>
            <h1 className="font-bold tracking-tight text-lg">Quiz Master AI</h1>
          </div>
        </div>

        {quiz.length > 0 && !finished && (
          <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
            <Timer size={14} className={timer <= 5 ? "text-red-400 animate-pulse" : "text-gray-400"} />
            <span className={`text-sm font-mono font-bold ${timer <= 5 ? "text-red-400" : "text-gray-200"}`}>
                {timer}s
            </span>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 relative z-10">

        {/* INITIAL STATE */}
        {!quiz.length && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                <HelpCircle size={12} />
                <span>Test your limits</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-8 tracing-tight">
                Master any topic with <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-transparent bg-clip-text">
                    automated testing.
                </span>
            </h1>

            <div className="relative group max-w-lg mx-auto mt-12">
                <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter subject (e.g. Quantum Physics, DBMS)"
                    className="w-full p-6 pr-40 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-indigo-500/40 focus:bg-white/10 transition-all text-lg"
                    onKeyDown={(e) => e.key === "Enter" && generateQuiz()}
                />
                <button
                    onClick={generateQuiz}
                    className="absolute right-2 top-2 bottom-2 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg"
                >
                    Generate <ArrowRight size={18} />
                </button>
            </div>
          </motion.div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="pt-40 flex flex-col items-center justify-center space-y-8">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
            />
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold animate-pulse">Synthesizing Dataset...</h3>
                <p className="text-gray-500 font-medium tracking-wide italic">Generating questions based on &quot;{topic}&quot;</p>
            </div>
          </div>
        )}

        {/* QUIZ ACTIVE STATE */}
        <AnimatePresence mode="wait">
            {quiz.length > 0 && !finished && !loading && (
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                >
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: `${(current / quiz.length) * 100}%` }}
                            animate={{ width: `${((current + 1) / quiz.length) * 100}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        />
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                        <span>Question {current + 1} / {quiz.length}</span>
                        <span>Score: {score}</span>
                    </div>

                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 sm:p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-10 tracking-tight">
                            {quiz[current].question}
                        </h2>

                        <div className="grid gap-4">
                            {quiz[current].options.map((opt, i) => {
                                const isCorrect = opt === quiz[current].answer;
                                const isSelected = selected === opt;
                                
                                let btnStyle = "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20";
                                if (selected) {
                                    if (isCorrect) btnStyle = "bg-green-500/20 border-green-500/50 text-green-300 ring-2 ring-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]";
                                    else if (isSelected) btnStyle = "bg-red-500/20 border-red-500/50 text-red-300 ring-2 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]";
                                    else btnStyle = "bg-white/[0.02] border-white/5 opacity-40";
                                }

                                return (
                                    <motion.button
                                        key={i}
                                        whileHover={!selected ? { x: 8 } : {}}
                                        whileTap={!selected ? { scale: 0.98 } : {}}
                                        onClick={() => handleAnswer(opt)}
                                        className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group ${btnStyle}`}
                                    >
                                        <span className="text-lg font-medium">{opt}</span>
                                        {selected && (
                                            isCorrect ? <CheckCircle2 size={24} className="text-green-400" /> : 
                                            isSelected ? <XCircle size={24} className="text-red-400" /> : null
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* RESULTS PAGE */}
        {finished && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center pt-10"
            >
                <div className="relative inline-block mb-10">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20 -z-10"
                    />
                    <Trophy size={100} className="text-indigo-400 drop-shadow-[0_0_30px_rgba(129,140,248,0.5)]" />
                </div>

                <h2 className="text-5xl font-black mb-4 tracking-tight">Performance Audit</h2>
                <div className="flex flex-col items-center gap-2 mb-12">
                    <p className="text-7xl font-black bg-gradient-to-b from-white to-gray-500 text-transparent bg-clip-text">
                        {Math.round((score / quiz.length) * 100)}%
                    </p>
                    <p className="text-gray-400 font-bold uppercase tracking-widest">
                        {score} correct out of {quiz.length} items
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={generateQuiz}
                        className="flex items-center justify-center gap-3 bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
                    >
                        <RotateCcw size={18} /> Retake Quiz
                    </button>
                    <button
                        onClick={() => { setQuiz([]); setTopic(""); }}
                        className="flex items-center justify-center gap-3 bg-white/10 border border-white/10 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
                    >
                        New Subject
                    </button>
                </div>
            </motion.div>
        )}

      </main>

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