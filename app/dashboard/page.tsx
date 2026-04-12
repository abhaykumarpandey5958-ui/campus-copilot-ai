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
  Sparkles,
  Zap,
  LogOut,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

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
      <div className="h-screen flex items-center justify-center bg-[#050505] text-white">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
        />
      </div>
    );
  }

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans">

      {/* 🌈 DYNAMIC ANIMATED BACKGROUND GLOWS */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 50, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-200px] left-1/4 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600 blur-[180px] rounded-full pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.2, 0.15],
          y: [0, -50, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-100px] right-1/4 w-[700px] h-[700px] bg-purple-600 blur-[180px] rounded-full pointer-events-none"
      />

      {/* ================= NAVBAR ================= */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-between items-center px-6 py-4 border-b border-white/5 backdrop-blur-2xl bg-white/[0.02] sticky top-0 z-40"
      >
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-gray-300"
          >
            <Menu size={20} />
          </motion.button>
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-500 w-5 h-5" />
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 text-transparent bg-clip-text">
              Campus Copilot
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-300">
              {user}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* ================= SIDEBAR ================= */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 250, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-72 bg-[#0a0a0f] border-r border-white/10 shadow-2xl flex flex-col relative"
            >
              {/* Sidebar Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-white/10">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="font-bold text-lg">Menu</h2>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-2 p-4 text-sm font-medium overflow-y-auto w-full">
                {[
                  { name: "Chat AI", icon: MessageSquare, link: "/chat", active: false },
                  { name: "Notes", icon: FileText, link: "/notes", active: false },
                  { name: "Code AI", icon: Code, link: "/code", active: false },
                  { name: "Reminders", icon: Bell, link: "/reminder", active: false },
                  { name: "Exam Helper", icon: BookOpen, link: "/exam-helper", active: false },
                  { name: "Quiz Mode", icon: Lightbulb, link: "/quiz", active: false },
                ].map((item, idx) => (
                  <motion.button 
                    key={idx}
                    whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(item.link)} 
                    className="flex items-center justify-between p-3 rounded-xl transition-colors w-full text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">
                        <item.icon size={18} />
                      </div>
                      <span className="text-gray-300 group-hover:text-white transition-colors">{item.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-300 transition-colors" />
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-auto p-6 text-xs text-gray-500 border-t border-white/5 space-y-1">
                <p>Designed & Developed by</p>
                <p className="text-gray-300 font-semibold tracking-wide">Abhay Kumar Pandey R</p>
                <p className="mt-2">Version 1.0.0 Pro</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= HERO SECTION ================= */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center text-center px-6 pt-24 pb-12 relative z-10"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <Zap size={16} className="text-yellow-400" />
          <span>Supercharged for Students</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight max-w-4xl">
          Study Smarter with <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text relative inline-block">
            Campus Copilot
            <motion.span 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-20 -z-10 rounded-full"
            />
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-gray-400 text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
          Welcome back, <span className="text-white font-semibold">Abhay</span>. The ultimate premium AI toolkit by <span className="text-blue-400 font-medium">Abhay Kumar Pandey R</span>. Instant answers, vision-scanning, beautiful notes, and smart code assistance—all in one place.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10 flex gap-4 flex-col sm:flex-row justify-center w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/chat")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg text-lg border border-blue-400/20"
          >
            Launch Vision AI <ChevronRight size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/code")}
            className="flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md bg-white/[0.02] px-8 py-4 rounded-2xl font-bold hover:border-white/30 transition-all text-lg"
          >
            <Code size={20} className="text-purple-400" /> Open Code AI
          </motion.button>
        </motion.div>
      </motion.section>

      {/* ================= FEATURES GRID ================= */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="mt-12 px-6 pb-24 relative z-10"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { name: "Vision AI Chat", desc: "Upload images, scan documents, and get real-time human-like tutoring.", link: "/chat", icon: MessageSquare, color: "text-blue-400", bg: "from-blue-500/10 to-transparent" },
            { name: "Smart Notes", desc: "Organize your study material into beautiful, easily accessible documents.", link: "/notes", icon: FileText, color: "text-emerald-400", bg: "from-emerald-500/10 to-transparent" },
            { name: "Code Assistant", desc: "Your personal pair-programmer. Debug and write complete applications.", link: "/code", icon: Code, color: "text-purple-400", bg: "from-purple-500/10 to-transparent" },
            { name: "Reminders", desc: "Never miss an assignment. Simple, elegant, and powerfully integrated.", link: "/reminder", icon: Bell, color: "text-amber-400", bg: "from-amber-500/10 to-transparent" },
            { name: "Exam Helper", desc: "Generate custom study guides and crash courses based on your topics.", link: "/exam-helper", icon: BookOpen, color: "text-rose-400", bg: "from-rose-500/10 to-transparent" },
            { name: "Quiz Generator", desc: "Test your knowledge with AI-driven quizzes designed just for you.", link: "/quiz", icon: Lightbulb, color: "text-yellow-400", bg: "from-yellow-500/10 to-transparent" },
          ].map((item, i) => (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              key={i}
              onClick={() => router.push(item.link)}
              className="group relative bg-white/[0.03] backdrop-blur-2xl p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            >
              {/* Background gradient hover effect */}
              <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${item.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className={`mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl w-max ${item.color} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={26} strokeWidth={2} />
                </div>

                <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-white text-gray-100 transition-colors">
                  {item.name}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow group-hover:text-gray-300 transition-colors">
                  {item.desc}
                </p>

                <div className="flex items-center gap-2 text-sm font-semibold text-white/50 group-hover:text-white transition-colors mt-auto">
                  <span>Explore Module</span>
                  <motion.div
                    className="relative"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                  >
                    <ChevronRight size={16} />
                  </motion.div>
                </div>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_forwards] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/5 pt-10 pb-12 flex flex-col items-center justify-center relative z-10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4 opacity-50">
          <Sparkles size={16} /> <span className="font-semibold tracking-wide">Campus Copilot</span>
        </div>
        <p className="text-gray-500 text-sm max-w-xs text-center leading-relaxed">
          Engineered for excellence. Designed to help you achieve your academic best.
        </p>
        <p className="text-xs text-gray-600 mt-6 font-medium">
          Built by <span className="text-gray-400">Abhay Kumar Pandey R</span> • © 2026
        </p>
      </footer>
      
      {/* Global Style for shimmer animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}