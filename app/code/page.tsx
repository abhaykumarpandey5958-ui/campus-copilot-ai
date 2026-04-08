"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Code2, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function CodeAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

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
          question: `You are an expert programmer.

Rules:
- Give short explanation
- Then give clean code in proper code block with language
- No extra text

User request:
${input}`,
        }),
      });

      const data = await res.json();

      setMessages([
        ...updated,
        { role: "ai", content: data.answer || "No response" },
      ]);
    } catch {
      setMessages([
        ...updated,
        { role: "ai", content: "❌ Error occurred" },
      ]);
    }

    setLoading(false);
  };

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0b0f] text-white">

      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <Code2 />
        <h1 className="text-lg font-semibold">Code AI</h1>
      </div>

      {/* CHAT */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full"
      >
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "user" && (
              <div className="bg-blue-600 ml-auto max-w-[70%] p-4 rounded-2xl">
                {msg.content}
              </div>
            )}

            {msg.role === "ai" && (
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl max-w-[85%]">

                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      const code = String(children).replace(/\n$/, "");

                      if (!inline) {
                        return (
                          <div className="relative">

                            {/* COPY BUTTON */}
                            <button
                              onClick={() => copyCode(code, i)}
                              className="absolute top-2 right-2 bg-black/40 px-2 py-1 rounded text-xs flex items-center gap-1"
                            >
                              {copiedIndex === i ? (
                                <>
                                  <Check size={14} /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={14} /> Copy
                                </>
                              )}
                            </button>

                            <SyntaxHighlighter
                              style={oneDark}
                              language={match?.[1] || "javascript"}
                              PreTag="div"
                            >
                              {code}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }

                      return (
                        <code className="bg-black/40 px-1 rounded">
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>

              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="text-gray-400 animate-pulse">
            Generating code...
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-white/10 flex gap-3 max-w-4xl mx-auto w-full">

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for code..."
          className="flex-1 p-4 bg-[#111] border border-white/10 rounded-xl resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 rounded-xl"
        >
          <Send size={18} />
        </button>

      </div>
    </div>
  );
}