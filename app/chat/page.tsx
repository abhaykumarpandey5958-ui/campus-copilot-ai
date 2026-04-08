"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Menu,
  Trash,
  Pencil,
  Mic,
  Volume2,
  Sun,
  Moon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "ai";
  content: string;
};

type Chat = {
  id: number;
  title: string;
  messages: Message[];
};

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [voiceOn, setVoiceOn] = useState(false);
  const [dark, setDark] = useState(true);

  const chatRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(c => c.id === currentId);

  // 🔥 Check scroll position
  const isNearBottom = () => {
    if (!chatRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem("chat-ultra");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      setCurrentId(parsed[0]?.id);
    } else {
      createChat();
    }
  }, []);

  // SAVE
  useEffect(() => {
    localStorage.setItem("chat-ultra", JSON.stringify(chats));
  }, [chats]);

  // 🔥 FIXED SCROLL
  useEffect(() => {
    if (chatRef.current && isNearBottom()) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chats]);

  const createChat = () => {
    const chat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };
    setChats(prev => [chat, ...prev]);
    setCurrentId(chat.id);
  };

  const deleteChat = (id: number) => {
    const updated = chats.filter(c => c.id !== id);
    setChats(updated);
    setCurrentId(updated[0]?.id || null);
  };

  const renameChat = (id: number) => {
    const name = prompt("Rename chat");
    if (!name) return;

    setChats(prev =>
      prev.map(c => (c.id === id ? { ...c, title: name } : c))
    );
  };

  // 🎤 Voice
  const startVoice = () => {
    const SR = (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.start();
    rec.onresult = (e: any) =>
      setInput(e.results[0][0].transcript);
  };

  // 🔊 Speak
  const speak = (text: string) => {
    if (!voiceOn) return;
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  // 🚀 SEND MESSAGE (UPDATED)
  const sendMessage = async () => {
    if (!input.trim() || !currentChat) return;

    const question = input;

    const userMsg = { role: "user", content: question };
    const updatedMessages = [...currentChat.messages, userMsg];

    // Auto title
    if (currentChat.title === "New Chat") {
      const title = question.slice(0, 20);
      setChats(prev =>
        prev.map(c =>
          c.id === currentChat.id ? { ...c, title } : c
        )
      );
    }

    // Update UI with user msg
    setChats(prev =>
      prev.map(c =>
        c.id === currentChat.id
          ? { ...c, messages: updatedMessages }
          : c
      )
    );

    setInput("");
    setLoading(true);

    try {
      // 🔥 SEND FULL HISTORY
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          history: currentChat.messages,
        }),
      });

      const data = await res.json();
      const full = data.answer || "No response";

      let text = "";

      // 🔥 SMOOTH STREAM
      for (let i = 0; i < full.length; i++) {
        text += full[i];

        setChats(prev =>
          prev.map(c =>
            c.id === currentChat.id
              ? {
                  ...c,
                  messages: [
                    ...updatedMessages,
                    { role: "ai", content: text },
                  ],
                }
              : c
          )
        );

        await new Promise(r => setTimeout(r, 5));
      }

      speak(full);

    } catch {
      setChats(prev =>
        prev.map(c =>
          c.id === currentChat.id
            ? {
                ...c,
                messages: [
                  ...updatedMessages,
                  { role: "ai", content: "Error occurred" },
                ],
              }
            : c
        )
      );
    }

    setLoading(false);
  };

  return (
    <div className={dark ? "bg-[#0b0b0f] text-white" : "bg-white text-black"}>
      <div className="flex h-screen">

        {/* SIDEBAR */}
        {sidebar && (
          <div className="w-64 p-4 border-r border-white/10 bg-white/5">
            <button
              onClick={createChat}
              className="mb-4 w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600"
            >
              + New Chat
            </button>

            {chats.map(chat => (
              <div key={chat.id} className="flex justify-between p-2 hover:bg-white/10 rounded">
                <span onClick={() => setCurrentId(chat.id)} className="cursor-pointer">
                  {chat.title}
                </span>
                <div className="flex gap-2">
                  <Pencil size={14} onClick={() => renameChat(chat.id)} />
                  <Trash size={14} onClick={() => deleteChat(chat.id)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MAIN */}
        <div className="flex-1 flex flex-col">

          {/* HEADER */}
          <div className="flex justify-between p-4 border-b border-white/10 bg-white/5">
            <Menu onClick={() => setSidebar(!sidebar)} />
            <h1>Ultra Chat AI</h1>
            <div className="flex gap-3">
              <button onClick={() => setDark(!dark)}>
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={() => setVoiceOn(!voiceOn)}>
                <Volume2 size={16} />
              </button>
            </div>
          </div>

          {/* CHAT */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full"
          >
            {currentChat?.messages.map((msg, i) => (
              <div key={i}>
                {msg.role === "user" ? (
                  <div className="bg-blue-600 ml-auto p-4 rounded-2xl max-w-[70%]">
                    {msg.content}
                  </div>
                ) : (
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-1 text-gray-400">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce delay-100">•</span>
                <span className="animate-bounce delay-200">•</span>
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="p-4 flex gap-3 border-t border-white/10 bg-white/5">
            <button onClick={startVoice}>
              <Mic />
            </button>

            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              className="flex-1 p-3 rounded-xl bg-white/10 outline-none"
              placeholder="Ask anything..."
            />

            <button onClick={sendMessage}>
              <Send />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}