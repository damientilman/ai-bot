k"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Mic, Send, Plus } from "lucide-react";

export default function Page() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const [greeting, setGreeting] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Sauve-moi du temps",
    "Dis-moi ce que tu peux faire",
    "Aide-moi à planifier",
    "Recherche une idée de campagne"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setHistory((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");
    setLoading(true);
    setGreeting(false);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, temperature, top_p: topP })
      });
      const data = await res.json();
      setHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  return (
    <div className="flex flex-col h-dvh bg-black text-white">
      <header className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
        <div className="font-semibold text-lg">Outbound Brain</div>
        <span className="text-xs bg-neutral-800 px-2 py-1 rounded-full">GPT 4o</span>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {greeting && (
          <div className="text-center mt-12">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
              Hello, Damien
            </h1>
            <div className="flex flex-wrap justify-center mt-6 gap-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(s)}
                  className="bg-neutral-800 px-4 py-2 rounded-full text-sm hover:bg-neutral-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className="flex justify-center">
            <div
              className={`w-full max-w-2xl px-4 py-3 rounded-xl text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-500 text-white text-right self-end"
                  : "bg-neutral-800 text-white"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center text-sm text-gray-400 animate-pulse">OutboundGPT est en train de rédiger...</div>
        )}
      </main>

      <footer className="border-t border-neutral-800 p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-neutral-900 rounded-full px-4 py-2">
            <Plus size={18} />
            <input
              type="text"
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
              placeholder="Ask Outbound Brain..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Mic size={18} className="text-gray-400" />
            <button type="submit">
              <Send size={18} className="text-white" />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
