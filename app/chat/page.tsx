"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Menu,
  Trash,
  Pencil,
  Mic,
  Volume2,
  Sun,
  Moon,
  Paperclip,
  X,
  ImageIcon
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";

type Message = {
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [streamingAIContent, setStreamingAIContent] = useState<string | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const router = useRouter();

  const currentChat = chats.find(c => c.id === currentId);

  // Initialize Speech Recognition
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => setIsListening(true);
      rec.onend = () => {
        setIsListening(false);
        // Auto-restart if in Voice Mode and not currently generating/speaking
        if (isVoiceMode && !loading && !speechSynthesis.speaking) {
          try { rec.start(); } catch { /* ignore */ }
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (e: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transcript = Array.from(e.results)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((result: any) => result[0])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((result: any) => result.transcript)
          .join("");

        setInput(transcript);

        if (e.results[0].isFinal && isVoiceMode) {
          // Auto-send in voice mode
          setTimeout(() => {
            sendMessage(transcript);
          }, 500);
        }
      };

      recognitionRef.current = rec;
    }
  }, [isVoiceMode, loading]);

  useEffect(() => {
    const saved = localStorage.getItem("chat-ultra");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        setChats(parsed);
        setCurrentId(parsed[0]?.id);
      } else {
        createChat();
      }
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
    const chat: Chat = {
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
    if (currentId === id) {
      setCurrentId(updated[0]?.id || null);
    }
  };

  const renameChat = (id: number) => {
    const name = prompt("Rename chat");
    if (!name) return;

    setChats(prev =>
      prev.map(c => (c.id === id ? { ...c, title: name } : c))
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleVoiceMode = () => {
    if (!isVoiceMode) {
      setIsVoiceMode(true);
      setVoiceOn(true);
      recognitionRef.current?.start();
    } else {
      setIsVoiceMode(false);
      recognitionRef.current?.stop();
    }
  };

  const startVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const speak = (raw: string) => {
    if (!voiceOn) return;
    speechSynthesis.cancel();
    const cleanText = raw.replace(/[#*_`>-]/g, "").replace(/\n/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onend = () => {
      // Resume listening if in voice mode
      if (isVoiceMode) {
        try { recognitionRef.current?.start(); } catch { /* ignore */ }
      }
    };

    speechSynthesis.speak(utterance);
  };

  const sendMessage = useCallback(async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if ((!textToSend.trim() && !imagePreview) || !currentChat) return;

    const question = textToSend.trim();
    const uploadedImage = imagePreview;

    const userMsg: Message = { role: "user", content: question, imageUrl: uploadedImage || undefined };
    const updated = [...currentChat.messages, userMsg];

    if (currentChat.title === "New Chat" && question) {
      const title = question.slice(0, 20) + "...";
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
    setImagePreview(null);
    setLoading(true);

    try {
      if (isVoiceMode) recognitionRef.current?.stop();

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, image: uploadedImage }),
      });

      if (!res.ok) {
        throw new Error("HTTP Error " + res.status);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder("utf-8");
      let fullAIContent = "";
      let buffer = "";

      // Initialize the AI message first (empty placeholder for order, but we stream into separate state)
      setStreamingAIContent("");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let eolIndex;
        while ((eolIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, eolIndex).trim();
          buffer = buffer.slice(eolIndex + 1);
          
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content || "";
              if (delta) {
                fullAIContent += delta;
                setStreamingAIContent(fullAIContent);
              }
            } catch {
              // partial or broken packet, ignore it safely
            }
          }
        }
      }

      // Finalize the chat history with the full content
      setChats(prev =>
        prev.map(c =>
          c.id === currentChat.id
            ? {
                ...c,
                messages: [...updated, { role: "ai", content: fullAIContent }],
              }
            : c
        )
      );
      setStreamingAIContent(null);
      speak(fullAIContent);
    } catch {
      setChats(prev =>
        prev.map(c =>
          c.id === currentChat.id
            ? {
                ...c,
                messages: [...updated, { role: "ai", content: "Error: Failed to reach AI API." }],
              }
            : c
        )
      );
    }

    setLoading(false);
  }, [input, imagePreview, currentChat, isVoiceMode, speak]);

  return (
    <div className={`h-screen relative overflow-hidden transition-colors duration-500 flex ${dark ? "bg-[#050505] text-white" : "bg-[#f5f8fa] text-gray-900"}`}>
      
      {/* Dynamic Background Glow */}
      {dark && (
        <>
          <div className="absolute w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full top-[-200px] left-[-200px] pointer-events-none"></div>
          <div className="absolute w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full bottom-[-100px] right-[-100px] pointer-events-none"></div>
        </>
      )}

      {/* Voice Mode Overlay */}
      <AnimatePresence>
        {isVoiceMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              animate={{
                scale: isListening ? [1, 1.2, 1] : 1,
                opacity: isListening ? [0.5, 1, 0.5] : 0.7
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] mb-12"
            >
              <Mic size={64} className="text-white" />
            </motion.div>

            <h2 className="text-3xl font-black mb-4 tracking-tighter">
              What&apos;s on your mind?
            </h2>
            <p className="text-gray-400 max-w-sm mb-12 text-lg italic">
              &quot;{input || "Speak now..."}&quot;
            </p>

            <button
              onClick={toggleVoiceMode}
              className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all font-bold text-lg"
            >
              Exit Voice Mode
            </button>

            {/* Pulsating Visualizer */}
            <div className="absolute bottom-20 flex gap-1 h-12 items-end">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isListening ? [10, Math.random() * 40 + 10, 10] : 10
                  }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                  className="w-1.5 bg-blue-500 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Animated */}
      <AnimatePresence>
        {sidebar && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 28 }}
            className={`w-64 flex flex-col h-full border-r z-20 shrink-0 ${
              dark ? "bg-white/5 border-white/10 backdrop-blur-2xl" : "bg-white/80 border-gray-200 backdrop-blur-2xl"
            }`}
          >
            <div className="p-4">
              <button
                onClick={() => { router.push("/dashboard") }}
                className="mb-4 w-full flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={createChat}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-blue-500/25"
              >
                <span className="text-lg">+</span> New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-4 scrollbar-hide">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    currentId === chat.id
                      ? dark ? "bg-white/10 shadow-inner" : "bg-blue-50 text-blue-700 shadow-inner"
                      : dark ? "hover:bg-white/5" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setCurrentId(chat.id)}
                >
                  <span className="truncate text-sm font-medium w-40">
                    {chat.title}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500 transition-colors" onClick={(e) => { e.stopPropagation(); renameChat(chat.id); }} />
                    <Trash className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 w-full min-w-0">
        
        {/* Header */}
        <header className={`flex items-center justify-between p-4 border-b backdrop-blur-xl ${dark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white/50"}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebar(!sidebar)} className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-white/10" : "hover:bg-gray-200/60"}`}>
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-lg tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Campus Copilot Vision
            </h1>
            <p className="hidden sm:block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-l border-white/10 pl-4 ml-2">
              By Abhay Kumar Pandey R
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleVoiceMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 font-medium hover:bg-blue-500/20 transition-all`}
            >
              <Mic size={16} className="animate-pulse" />
              <span className="text-sm">Voice Mode</span>
            </button>

            <button
              onClick={() => setDark(!dark)}
              className={`p-2 rounded-full transition-colors ${dark ? "hover:bg-white/10" : "hover:bg-gray-200/60"}`}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setVoiceOn(!voiceOn)}
              className={`p-2 rounded-full transition-colors ${voiceOn ? "text-blue-500 bg-blue-500/10" : dark ? "hover:bg-white/10" : "hover:bg-gray-200/60"}`}
              title={voiceOn ? "Voice responses ON" : "Voice responses OFF"}
            >
              <Volume2 size={18} />
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full scroll-smooth"
        >
          {currentChat?.messages.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
              <div className={`p-4 rounded-full ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                <ImageIcon size={48} className="opacity-70 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">How can I assist you today?</h2>
              <p className="max-w-md text-sm sm:text-base opacity-80">Upload an image, speak your mind, or ask any question. I&apos;m ready to help!</p>
            </motion.div>
          )}

          {currentChat?.messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} dark={dark} />
          ))}

          {streamingAIContent !== null && (
            <MessageBubble msg={{ role: "ai", content: streamingAIContent }} dark={dark} isStreaming />
          )}

          {loading && streamingAIContent === null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
               <div className={`p-5 rounded-3xl rounded-tl-sm border flex gap-2.5 items-center shadow-sm ${dark ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-[bounce_1s_infinite_-0.3s]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-[bounce_1s_infinite_-0.15s]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-[bounce_1s_infinite]"></span>
               </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 sm:px-6 sm:pb-6 max-w-4xl mx-auto w-full relative z-20">
          <div className={`relative p-2 rounded-3xl border backdrop-blur-2xl flex flex-col transition-all shadow-xl ${
            dark ? "bg-white/10 border-white/20 focus-within:border-white/40 focus-within:bg-white/15" : "bg-white/90 border-gray-200 focus-within:border-blue-300 focus-within:bg-white"
          }`}>
            
            {/* Image Preview Area */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pt-4 pb-2"
                >
                  <div className="relative inline-block group">
                    <img src={imagePreview} alt="Preview" className="h-24 sm:h-32 rounded-xl object-cover border-2 border-blue-500/50 shadow-md" />
                    <button
                      onClick={() => setImagePreview(null)}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 active:scale-95 transition opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Controls */}
            <div className="flex items-end gap-2 p-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-3.5 rounded-2xl transition-all ${dark ? "hover:bg-white/10 text-gray-300" : "hover:bg-gray-100 text-gray-500 hover:text-blue-600"}`}
                title="Upload image"
              >
                <Paperclip size={20} />
              </button>
              
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />

              <button
                onClick={startVoice}
                className={`p-3.5 rounded-2xl transition-all ${isListening ? "bg-blue-500 text-white animate-pulse" : dark ? "hover:bg-white/10 text-gray-300" : "hover:bg-gray-100 text-gray-500 hover:text-blue-600"}`}
                title="Start Voice Dictation"
              >
                <Mic size={20} />
              </button>

              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className={`flex-1 max-h-40 min-h-[52px] bg-transparent outline-none resize-none py-3.5 px-3 leading-relaxed font-medium ${dark ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}`}
                placeholder="Ask anything, or scan an image..."
                rows={1}
              />

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() && !imagePreview}
                className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:from-gray-500 disabled:to-gray-500 disabled:opacity-50 text-white rounded-2xl transition-all shadow-md active:scale-95 m-1 flex items-center justify-center"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          </div>
          <div className="text-center text-xs mt-4 text-gray-500 font-medium tracking-wide">
            Powered by Campus Copilot AI
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoized Message Bubble for Performance
const MessageBubble = React.memo(({ msg, dark, isStreaming = false }: { msg: Message, dark: boolean, isStreaming?: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} will-change-transform`}
    >
      {msg.role === "user" ? (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-3xl rounded-tr-sm max-w-[85%] sm:max-w-[75%] shadow-lg">
          {msg.imageUrl && (
            <img src={msg.imageUrl} alt="Uploaded" className="rounded-xl mb-3 max-h-64 object-contain bg-black/20 w-full" />
          )}
          {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
        </div>
      ) : (
        <div className={`p-5 rounded-3xl rounded-tl-sm border max-w-[95%] sm:max-w-[85%] shadow-sm ${dark ? "bg-white/5 border-white/10 text-gray-100" : "bg-white border-gray-100 text-gray-800"}`}>
          <div className={`prose max-w-none prose-p:leading-relaxed prose-pre:bg-black/80 prose-pre:backdrop-blur-md prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl ${dark ? "prose-invert" : ""}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </div>
          {isStreaming && (
            <motion.span 
              animate={{ opacity: [0, 1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-blue-500 ml-1 translate-y-1"
            />
          )}
        </div>
      )}
    </motion.div>
  );
});

MessageBubble.displayName = "MessageBubble";