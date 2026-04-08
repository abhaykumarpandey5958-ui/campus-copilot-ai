"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  FileText,
  Bell,
  BookOpen,
  Lightbulb,
  Code,
  Menu,
  X,
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(storedUser);
    }
  }, [router]);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* 🌈 BACKGROUND */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600 opacity-20 blur-[180px] rounded-full"></div>
      <div className="absolute bottom-[-200px] right-1/3 w-[700px] h-[700px] bg-purple-600 opacity-20 blur-[180px] rounded-full"></div>

      {/* ================= NAVBAR ================= */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-xl bg-black/40 sticky top-0 z-50">

        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu />
          </button>
          <h1 className="text-lg font-semibold">Campus Copilot AI</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block">
            {user}
          </span>

          <button
            onClick={() => {
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="bg-red-500/80 px-3 py-1 rounded text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ================= SIDEBAR ================= */}
      {sidebarOpen && (
        <div className="fixed top-0 left-0 h-full w-64 bg-[#0f0f14] border-r border-white/10 p-5 z-50">

          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold">Menu</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X />
            </button>
          </div>

          <div className="flex flex-col gap-4 text-sm">

            <button onClick={() => router.push("/chat")} className="flex items-center gap-2 hover:text-blue-400">
              <MessageSquare size={18} /> Chat AI
            </button>

            <button onClick={() => router.push("/notes")} className="flex items-center gap-2 hover:text-blue-400">
              <FileText size={18} /> Notes
            </button>

            <button onClick={() => router.push("/code")} className="flex items-center gap-2 hover:text-blue-400">
              <Code size={18} /> Code AI
            </button>

            <button onClick={() => router.push("/reminder")} className="flex items-center gap-2 hover:text-blue-400">
              <Bell size={18} /> Reminders
            </button>

            <button onClick={() => router.push("/exam-helper")} className="flex items-center gap-2 hover:text-blue-400">
              <BookOpen size={18} /> Exam Helper
            </button>

            <button onClick={() => router.push("/quiz")} className="flex items-center gap-2 hover:text-blue-400">
              <Lightbulb size={18} /> Quiz
            </button>

          </div>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="flex flex-col items-center text-center px-6 mt-20 relative z-10">

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Study Smarter with <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-pulse">
            Campus Copilot AI
          </span>
        </h1>

        <p className="text-gray-400 mt-6 max-w-2xl">
          Get instant answers, smart notes, reminders and AI tools in one place.
        </p>

        <div className="mt-10 flex gap-4 flex-wrap justify-center">

          <button
            onClick={() => router.push("/chat")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-xl hover:scale-105 transition"
          >
            Start Chat
          </button>

          <button
            onClick={() => router.push("/code")}
            className="border border-white/20 px-8 py-3 rounded-xl hover:bg-white/10 transition"
          >
            Code AI
          </button>

        </div>

        <p className="text-xs text-gray-500 mt-5">
          Built by <span className="text-white">Abhay Kumar Pandey R</span> • © 2026
        </p>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="mt-24 px-6 relative z-10">

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

          {[
            { name: "Chat AI", link: "/chat", icon: <MessageSquare size={24} /> },
            { name: "Notes", link: "/notes", icon: <FileText size={24} /> },
            { name: "Code AI", link: "/code", icon: <Code size={24} /> },
            { name: "Reminders", link: "/reminder", icon: <Bell size={24} /> },
            { name: "Exam Helper", link: "/exam-helper", icon: <BookOpen size={24} /> },
            { name: "Quiz", link: "/quiz", icon: <Lightbulb size={24} /> },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => router.push(item.link)}
              className="group bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 transition cursor-pointer"
            >
              <div className="mb-3 text-blue-400">{item.icon}</div>

              <h3 className="text-lg font-semibold group-hover:text-blue-400 transition">
                {item.name}
              </h3>

              <p className="text-gray-400 text-sm mt-2">
                AI-powered feature to boost productivity.
              </p>

              <div className="mt-4 text-blue-500 text-sm opacity-0 group-hover:opacity-100 transition">
                Open →
              </div>
            </div>
          ))}

        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="mt-24 border-t border-white/10 py-6 text-center text-gray-500 text-sm">
        © 2026 Campus Copilot AI • Built by Abhay Kumar Pandey R
      </footer>

    </div>
  );
}