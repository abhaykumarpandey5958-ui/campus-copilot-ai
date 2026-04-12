"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Trash,
  Plus,
  Edit,
  Check,
  ChevronLeft,
  Calendar,
  Clock,
  Zap,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Reminder = {
  id: number;
  text: string;
  datetime: string;
};

export default function ReminderPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [text, setText] = useState("");
  const [datetime, setDatetime] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const router = useRouter();

  // Load reminders
  useEffect(() => {
    const saved = localStorage.getItem("reminders");
    if (saved) {
      queueMicrotask(() => setReminders(JSON.parse(saved)));
    }
    
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Save reminders
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  // Check reminders loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();

      reminders.forEach((r) => {
        const target = new Date(r.datetime).getTime();

        if (target <= now && target + 1000 > now) {
          // System Notification
          new Notification("⏰ Campus Copilot Reminder", {
            body: r.text,
            icon: "/favicon.ico"
          });

          // Voice Notification
          if (voiceOn) {
            speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(`Reminder: ${r.text}`);
            speechSynthesis.speak(utter);
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders, voiceOn]);

  const handleSave = () => {
    if (!text || !datetime) return;

    if (editId) {
      setReminders(
        reminders.map((r) =>
          r.id === editId ? { ...r, text, datetime } : r
        )
      );
      setEditId(null);
    } else {
      setReminders([
        {
          id: Date.now(),
          text,
          datetime,
        },
        ...reminders,
      ]);
    }

    setText("");
    setDatetime("");
  };

  const handleEdit = (r: Reminder) => {
    setEditId(r.id);
    setText(r.text);
    setDatetime(r.datetime);
  };

  const getTimeLeft = (dt: string) => {
    const diff = new Date(dt).getTime() - new Date().getTime();
    if (diff <= 0) return "Reached";

    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days > 0) return `${days}d left`;
    if (hrs > 0) return `${hrs}h ${mins % 60}m left`;
    return `${mins}m left`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-amber-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[600px] h-[600px] bg-orange-600/10 blur-[130px] rounded-full" />
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
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Bell size={18} className="text-amber-400" />
            </div>
            <h1 className="font-bold tracking-tight text-lg">Reminder AI</h1>
          </div>
        </div>

        <button
          onClick={() => setVoiceOn(!voiceOn)}
          className={`p-2.5 rounded-xl border transition-all ${
            voiceOn 
            ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
            : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
          }`}
          title={voiceOn ? "Voice alerts active" : "Enable voice alerts"}
        >
          <Volume2 size={18} />
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">

        {/* Hero Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-4">
              <Zap size={12} />
              <span>Time Management</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Never miss a <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 text-transparent bg-clip-text">
                critical deadline.
            </span>
          </h2>
        </motion.div>

        {/* Input Form */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] mb-12 shadow-2xl relative overflow-hidden"
        >
            <div className="flex flex-col gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Event Description</label>
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Submission for Project X..."
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/40 transition-all outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Remind Me On</label>
                    <input
                        type="datetime-local"
                        value={datetime}
                        onChange={(e) => setDatetime(e.target.value)}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/40 transition-all outline-none [color-scheme:dark]"
                    />
                </div>

                <button
                    onClick={handleSave}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-amber-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                    {editId ? <Check size={20} /> : <Plus size={20} />}
                    {editId ? "Save Changes" : "Create Reminder"}
                </button>
            </div>
        </motion.div>

        {/* List Section */}
        <div className="space-y-6 pb-20">
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                <Clock size={16} /> Active Schedules
            </h3>
            
            <AnimatePresence mode="popLayout">
                {reminders.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-white/[0.01] border border-dashed border-white/10 rounded-[32px]"
                    >
                        <Bell className="mx-auto mb-4 text-gray-600" size={40} />
                        <p className="text-gray-500 font-medium italic">Your schedule is currently clear.</p>
                    </motion.div>
                )}

                {reminders.map((r) => (
                    <motion.div
                        layout
                        key={r.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group bg-white/[0.02] border border-white/5 hover:border-white/10 p-6 rounded-[28px] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden"
                    >
                        {/* Status bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-orange-500" />
                        
                        <div className="space-y-1">
                            <h4 className="text-xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">{r.text}</h4>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                                <span className="flex items-center gap-1.5 text-gray-400">
                                    <Calendar size={12} /> {new Date(r.datetime).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-400">
                                    <Clock size={12} /> {new Date(r.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    {getTimeLeft(r.datetime)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 self-end sm:self-center">
                            <button 
                                onClick={() => handleEdit(r)}
                                className="p-3 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                title="Edit"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => { if(confirm("Delete this reminder?")) setReminders(reminders.filter(it => it.id !== r.id)) }}
                                className="p-3 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Delete"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                        
                        {/* Subtle Glow */}
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                            <Zap className="text-amber-500 w-24 h-24" />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

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