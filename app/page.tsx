"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/login";
    } else {
      setUser(storedUser);
    }
  }, []);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome, {user} 👋
        </h1>

        <a
          href="/dashboard"
          className="bg-blue-600 px-6 py-3 rounded-lg"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}