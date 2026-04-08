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

  useEffect(() => {
    localStorage.setItem("chat-ultra", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (chatRef.current) {
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

  const startVoice = () => {
    const SR = (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.start();
    rec.onresult = (e: any) =>
      setInput(e.results[0][0].transcript);
  };

  const speak = (text: string) => {
    if (!voiceOn) return;
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentChat) return;

    const question = input;

    const userMsg: Message = { role: "user", content: question };
    const updated = [...currentChat.messages, userMsg];

    if (currentChat.title === "New Chat") {
      const title = question.slice(0, 20);
      setChats(prev =>
        prev.map(c =>
          c.id === currentChat.id ? { ...c, title } : c
        )
      );
    }

    setChats(prev =>
      prev.map(c =>
        c.id === currentChat.id ? { ...c, messages: updated } : c
      )
    );

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      const full = data.answer || "No response";

      let text = "";

      for (let i = 0; i < full.length; i++) {
        text += full[i];

        setChats(prev =>
          prev.map(c =>
            c.id === currentChat.id
              ? {
                  ...c,
                  messages: [...updated, { role: "ai", content: text }],
                }
              : c
          )
        );

        await new Promise(r => setTimeout(r, 3));
      }

      speak(full);
    } catch {
      setChats(prev =>
        prev.map(c =>
          c.id === currentChat.id
            ? {
                ...c,
                messages: [...updated, { role: "ai", content: "Error" }],
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

        <div className="flex-1 flex flex-col">
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

            {loading && <div className="text-gray-400">...</div>}
          </div>

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