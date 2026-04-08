"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Volume2, Copy } from "lucide-react";

export default function NotesPage() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);

  // 🔊 CLEAN SPEAK (no #, symbols)
  const speak = (raw: string) => {
    if (!voiceOn) return;

    speechSynthesis.cancel();

    const clean = raw
      .replace(/[#*_`>-]/g, "")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ");

    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 1;
    utter.pitch = 1;

    speechSynthesis.speak(utter);
  };

  const handleSummarize = async () => {
    if (!text.trim()) return;

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

      const data = await res.json();

      setSummary(data.answer || "No response");
      speak(data.answer);
    } catch {
      setSummary("❌ Error generating summary");
    }

    setLoading(false);
  };

  const copyText = () => {
    navigator.clipboard.writeText(summary);
    alert("Copied!");
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-semibold">
          📄 Notes AI
        </h1>

        <button
          onClick={() => setVoiceOn(!voiceOn)}
          className={`px-3 py-2 rounded-lg ${
            voiceOn ? "bg-green-600" : "bg-white/10"
          }`}
        >
          <Volume2 size={18} />
        </button>
      </div>

      {/* INPUT BOX */}
      <div className="max-w-5xl mx-auto">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your notes here..."
          className="w-full h-60 p-5 bg-[#111] border border-white/10 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
        />

        {/* BUTTON */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSummarize}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-xl hover:scale-105 transition"
          >
            <Sparkles size={18} />
            Generate Summary
          </button>

          {summary && (
            <button
              onClick={copyText}
              className="bg-white/10 px-4 py-3 rounded-xl hover:bg-white/20"
            >
              <Copy size={18} />
            </button>
          )}
        </div>
      </div>

      {/* OUTPUT */}
      <div className="max-w-5xl mx-auto mt-10">

        {loading && (
          <div className="text-gray-400 text-sm">
            ✨ Generating smart summary...
          </div>
        )}

        {summary && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mt-4">

            <div className="prose prose-invert max-w-none leading-relaxed space-y-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary}
              </ReactMarkdown>
            </div>

            {/* divider */}
            <div className="border-t border-white/10 mt-6"></div>

          </div>
        )}
      </div>

    </div>
  );
}