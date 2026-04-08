"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ExamHelper() {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("5");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚀 AI FUNCTION
  const generateAnswer = async () => {
    if (!question.trim()) return;

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

      const data = await res.json();

      if (data.answer) {
        setAnswer(data.answer);
      } else {
        setAnswer("❌ No response from AI");
      }
    } catch (error) {
      console.error(error);
      setAnswer("❌ Error connecting to AI");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white p-6 relative overflow-hidden">

      {/* 🌈 PREMIUM GLOW */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600 opacity-20 blur-[160px] rounded-full"></div>

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="text-purple-400" />
          Exam Helper AI
        </h1>
        <p className="text-gray-400 mt-2">
          Get structured, exam-ready answers instantly
        </p>
      </div>

      {/* INPUT CARD */}
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">

        <textarea
          placeholder="Ask your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full h-40 p-4 bg-[#111] border border-white/10 rounded-xl outline-none mb-6 resize-none"
        />

        {/* MARK TYPE */}
        <div className="flex gap-4 mb-6 justify-center">
          {["2", "5", "16"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-6 py-2 rounded-xl transition ${
                type === t
                  ? "bg-gradient-to-r from-blue-500 to-purple-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {t} Mark
            </button>
          ))}
        </div>

        {/* BUTTON */}
        <button
          onClick={generateAnswer}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-xl hover:scale-105 transition disabled:opacity-50"
        >
          <Send size={18} />
          {loading ? "Generating..." : "Generate Answer"}
        </button>
      </div>

      {/* LOADING UI */}
      {loading && (
        <div className="max-w-4xl mx-auto mt-10 bg-white/5 p-6 rounded-2xl border border-white/10 animate-pulse">
          <p className="text-gray-400">Thinking deeply...</p>
        </div>
      )}

      {/* OUTPUT */}
      {answer && !loading && (
        <div className="max-w-4xl mx-auto mt-10 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">

          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {answer}
            </ReactMarkdown>
          </div>

        </div>
      )}
    </div>
  );
}