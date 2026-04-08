"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Trash,
  Plus,
  Edit,
  Check,
} from "lucide-react";

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

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem("reminders");
    if (saved) setReminders(JSON.parse(saved));
  }, []);

  // SAVE
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  // 🔔 PERMISSION
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // ⏰ CHECK REMINDERS
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();

      reminders.forEach((r) => {
        const target = new Date(r.datetime).getTime();

        if (target <= now && target + 1000 > now) {
          new Notification("⏰ Reminder", {
            body: r.text,
          });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders]);

  // ADD / UPDATE
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
    setText(r.text);
    setDatetime(r.datetime);
    setEditId(r.id);
  };

  const handleDelete = (id: number) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  // ⏳ TIME LEFT
  const getTimeLeft = (dt: string) => {
    const diff = new Date(dt).getTime() - new Date().getTime();

    if (diff <= 0) return "⏰ Time reached";

    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);

    if (hrs > 0) return `${hrs}h ${mins % 60}m left`;
    return `${mins} min left`;
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center gap-3">
        <Bell />
        <h1 className="text-3xl font-semibold">
          Reminder AI
        </h1>
      </div>

      {/* INPUT CARD */}
      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 p-5 rounded-2xl mb-6">

        <div className="flex flex-col gap-3">

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you want to remember?"
            className="p-3 bg-[#111] border border-white/10 rounded-xl"
          />

          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="p-3 bg-[#111] border border-white/10 rounded-xl"
          />

          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-xl"
          >
            {editId ? <Check size={18} /> : <Plus size={18} />}
            {editId ? "Update Reminder" : "Add Reminder"}
          </button>

        </div>
      </div>

      {/* LIST */}
      <div className="max-w-4xl mx-auto space-y-4">

        {reminders.length === 0 && (
          <p className="text-gray-400 text-sm">
            No reminders yet
          </p>
        )}

        {reminders.map((r) => (
          <div
            key={r.id}
            className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center"
          >
            <div>
              <p className="text-sm">{r.text}</p>

              <p className="text-xs text-gray-400 mt-1">
                {new Date(r.datetime).toLocaleString()}
              </p>

              <p className="text-xs text-blue-400 mt-1">
                {getTimeLeft(r.datetime)}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleEdit(r)}>
                <Edit size={16} />
              </button>

              <button onClick={() => handleDelete(r.id)}>
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}