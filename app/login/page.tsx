"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (!username.trim()) return;

    localStorage.setItem("user", username);
    router.push("/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black relative overflow-hidden">

      {/* 🌈 BACKGROUND GLOW */}
      <div className="absolute w-[600px] h-[600px] bg-blue-600 opacity-20 blur-[150px] rounded-full top-[-150px] left-[-100px] animate-pulse"></div>
      <div className="absolute w-[600px] h-[600px] bg-purple-600 opacity-20 blur-[150px] rounded-full bottom-[-150px] right-[-100px] animate-pulse"></div>

      {/* 🔥 LOGIN CARD */}
      <div className="relative z-10 w-[90%] max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Campus Copilot AI
        </h1>

        <p className="text-gray-400 text-center mb-6 text-sm">
          Smart AI for Students 🚀
        </p>

        {/* INPUT */}
        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full mt-5 bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-xl font-medium hover:scale-105 transition shadow-lg"
        >
          Continue →
        </button>

        {/* EXTRA */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Secure • Fast • AI Powered
        </div>

      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 text-gray-500 text-xs">
        Built by <span className="text-white">Abhay Kumar Pandey R</span> 🚀
      </div>

    </div>
  );
}