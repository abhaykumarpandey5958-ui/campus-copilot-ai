"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Copy, 
  Check, 
  ChevronLeft, 
  Terminal,
  Cpu,
  Trash2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function CodeAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const router = useRouter();

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    const updated = [...messages, userMsg];

    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: `You are an expert programmer AI. 
          
Rules:
- Give a very brief technical explanation
- Provide high-quality, clean code blocks
- Use appropriate language headers for syntax highlighting

User request: ${input}`,
        }),
      });

      if (!res.ok) throw new Error("API Error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder("utf-8");
      let fullContent = "";
      let buffer = "";

      // Initialize streaming state
      setStreamingContent("");

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
                fullContent += delta;
                setStreamingContent(fullContent);
              }
            } catch {
              // Ignore partial JSON
            }
          }
        }
      }
      
      // Finalize history
      setMessages([...updated, { role: "ai", content: fullContent }]);
      setStreamingContent(null);
    } catch {
      setMessages([...updated, { role: "ai", content: "❌ Error: Failed to generate code. Please check your connection." }]);
    }

    setLoading(false);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = () => {
    if (confirm("Clear code history?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-2xl bg-white/[0.02] z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Terminal size={18} className="text-blue-400" />
            </div>
            <h1 className="font-bold tracking-tight">Code AI Pro</h1>
          </div>
        </div>

        <button 
          onClick={clearChat}
          className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-gray-500 hover:text-red-400"
          title="Clear Chat"
        >
          <Trash2 size={18} />
        </button>
      </header>

      {/* CHAT AREA */}
      <main 
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 z-10 scroll-smooth"
      >
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40"
            >
              <div className="p-6 bg-white/5 rounded-full border border-white/10">
                <Cpu size={48} className="text-blue-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Intelligent Pair Programmer</h2>
                <p className="max-w-xs text-sm">Ask for algorithms, component logic, or debugging help. I support 50+ languages.</p>
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <MessageItem key={i} msg={msg} copyCode={copyCode} copiedIndex={copiedIndex} i={i} />
          ))}

          {streamingContent !== null && (
            <MessageItem 
              msg={{ role: "ai", content: streamingContent }} 
              copyCode={copyCode} 
              copiedIndex={copiedIndex} 
              i={-1} 
              isStreaming 
            />
          )}
        </AnimatePresence>

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center text-gray-500 text-sm font-medium ml-2"
          >
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.1s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.2s]" />
            </div>
            <span>Processing syntax...</span>
          </motion.div>
        )}
      </main>

      {/* INPUT AREA */}
      <footer className="p-4 sm:p-8 max-w-5xl mx-auto w-full z-20">
        <div className="relative group p-2 rounded-3xl border border-white/10 bg-white/[0.03] focus-within:bg-white/[0.06] focus-within:border-white/20 transition-all backdrop-blur-2xl shadow-2xl flex items-end gap-2">
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the functionality you need..."
            rows={1}
            className="flex-1 max-h-48 min-h-[52px] bg-transparent outline-none resize-none py-3.5 px-4 leading-relaxed font-medium placeholder-gray-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center m-1"
          >
            <Send size={18} className={loading ? "animate-pulse" : ""} />
          </button>
        </div>
        <div className="mt-4 flex justify-center gap-6 text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
          <span>Optimized Output</span>
          <span>•</span>
          <span>Secure Sandbox</span>
          <span>•</span>
          <span>AI Refactoring</span>
        </div>
      </footer>

      {/* Global CSS for scroll hiding and custom scrollbar */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

const MessageItem = React.memo(({ msg, copyCode, copiedIndex, i, isStreaming = false }: { 
  msg: Message, 
  copyCode: (code: string, id: string) => void, 
  copiedIndex: string | null, 
  i: number, 
  isStreaming?: boolean 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} will-change-transform`}
    >
      <div className={`max-w-[95%] sm:max-w-[85%] ${msg.role === "user" ? "bg-blue-600 px-5 py-3 rounded-2xl rounded-tr-sm shadow-lg border border-blue-400/20" : ""}`}>
        {msg.role === "user" ? (
          <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
        ) : (
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl rounded-tl-sm shadow-2xl backdrop-blur-md">
            <div className="prose prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const code = String(children).replace(/\n$/, "");
                    const codeId = `code-${i}-${match?.[1] || 'text'}`;

                    if (!inline) {
                      return (
                        <div className="relative group my-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d0d0d]">
                          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                            <span className="text-xs font-mono text-gray-400 tracking-wider uppercase">{match?.[1] || "code"}</span>
                            <button
                              onClick={() => copyCode(code, codeId)}
                              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                            >
                              {copiedIndex === codeId ? (
                                <><Check size={14} className="text-green-400" /> Copied</>
                              ) : (
                                <><Copy size={13} /> Copy</>
                              )}
                            </button>
                          </div>
                          <SyntaxHighlighter
                            {...props}
                            style={oneDark}
                            language={match?.[1] || "javascript"}
                            customStyle={{ margin: 0, padding: '1.25rem', fontSize: '0.9rem', background: 'transparent' }}
                            PreTag="div"
                            showLineNumbers={true}
                          >
                            {code}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }

                    return (
                      <code className="bg-white/10 px-1.5 py-0.5 rounded-md text-blue-300 font-mono text-sm">
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
            {isStreaming && (
              <motion.span 
                animate={{ opacity: [0.1, 1, 0.1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="inline-block w-2.5 h-5 bg-blue-500 ml-2 translate-y-1.5"
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

MessageItem.displayName = "MessageItem";