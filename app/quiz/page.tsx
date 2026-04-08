"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

  // ⏳ TIMER
  useEffect(() => {
    if (!quiz.length || finished) return;

    if (timer === 0) {
      nextQuestion();
      return;
    }

    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, quiz, finished]);

  // 🚀 GENERATE QUIZ
  const generateQuiz = async () => {
    if (!topic.trim()) return;

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

      const data = await res.json();

      const parsed = JSON.parse(data.quiz);
      setQuiz(parsed);
    } catch (err) {
      alert("Failed to load quiz");
      console.error(err);
    }

    setLoading(false);
    setTimer(15);
  };

  // ➡️ NEXT QUESTION
  const nextQuestion = () => {
    setSelected(null);
    setTimer(15);

    if (current + 1 < quiz.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  // ✅ HANDLE ANSWER CLICK
  const handleAnswer = (opt: string) => {
    if (selected) return;

    setSelected(opt);

    if (opt === quiz[current].answer) {
      setScore((prev) => prev + 1);
    }

    setTimeout(nextQuestion, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white p-6">

      <div className="max-w-2xl mx-auto">

        {/* TITLE */}
        <h1 className="text-3xl font-bold mb-6 text-center">
           AI Quiz Generator
        </h1>

        {/* INPUT */}
        {!quiz.length && (
          <div className="flex gap-3">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g. DBMS, Physics)"
              className="flex-1 p-3 bg-[#111] rounded-lg border border-white/10"
            />

            <button
              onClick={generateQuiz}
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"
            >
              Generate
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <p className="mt-6 text-center text-gray-400 animate-pulse">
            Generating quiz...
          </p>
        )}

        {/* QUIZ */}
        {quiz.length > 0 && !finished && (
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/5 p-6 rounded-2xl border border-white/10"
          >
            {/* QUESTION */}
            <h2 className="text-xl font-semibold mb-4">
              Q{current + 1}. {quiz[current].question}
            </h2>

            {/* TIMER */}
            <div className="mb-4 text-sm text-gray-400">
              ⏳ Time left: {timer}s
            </div>

            {/* OPTIONS */}
            <div className="space-y-3">
              {quiz[current].options.map((opt, i) => {
                const isCorrect = opt === quiz[current].answer;
                const isSelected = selected === opt;

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full text-left p-3 rounded-lg border transition
                      ${
                        selected
                          ? isCorrect
                            ? "bg-green-600/40 border-green-500"
                            : isSelected
                            ? "bg-red-600/40 border-red-500"
                            : "bg-white/5"
                          : "bg-white/5 hover:bg-white/10"
                      }
                    `}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {finished && (
          <div className="mt-10 text-center">
            <h2 className="text-2xl font-bold mb-3">
              🎉 Quiz Completed!
            </h2>

            <p className="text-lg text-gray-300">
              Score: {score} / {quiz.length}
            </p>

            <button
              onClick={() => {
                setQuiz([]);
                setTopic("");
              }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}