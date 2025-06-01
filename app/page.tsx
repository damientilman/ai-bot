"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Page() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([
    {
      role: "assistant",
      content:
        "**Bienvenue dans l'Outbound Brain.** Quelle est la *thématique* de votre campagne aujourd’hui ? 🎯",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatedResponse, setAnimatedResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setHistory((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");
    setLoading(true);
    setAnimatedResponse("");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, temperature, top_p: topP }),
      });

      const data = await res.json();
      const fullReply = data.reply || "Pas de réponse reçue.";
      let current = "";
      for (let i = 0; i < fullReply.length; i++) {
        await new Promise((r) => setTimeout(r, 10));
        current += fullReply[i];
        setAnimatedResponse(current);
      }
      setHistory((prev) => [...prev, { role: "assistant", content: fullReply }]);
    } catch (err) {
      console.error("Erreur frontend :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history, animatedResponse]);

  return (
    <div className="flex flex-col h-dvh bg-white dark:bg-black text-black dark:text-white overflow-hidden">
      <header className="p-4 text-center border-b border-gray-200 dark:border-gray-800 font-bold text-lg sm:text-2xl tracking-tight">
        Outbound Brain
      </header>

      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-6 w-full max-w-3xl mx-auto"
      >
        {history.map((msg, i) => (
          <div
            key={i}
            className={`flex justify-center transition-opacity duration-500 animate-fade-in px-2`}
          >
            <div
              className={`rounded-2xl px-4 py-3 text-sm w-full sm:w-auto shadow-md whitespace-pre-wrap leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-500 text-white self-end text-right"
                  : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-center">
            <div className="rounded-2xl px-4 py-3 text-sm w-full sm:w-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white animate-pulse">
              <ReactMarkdown>
                {animatedResponse || "OutboundGPT est en train de rédiger..."}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 p-4 w-full max-w-3xl mx-auto pb-10 sm:pb-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <textarea
              rows={1}
              className="flex-1 resize-none rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Écris un message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="bg-black dark:bg-white text-white dark:text-black rounded-full px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 w-full sm:w-auto"
            >
              Envoyer
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
            <label className="flex items-center gap-2 w-full">
              Température : {temperature}
              <input
                className="flex-1"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
            </label>
            <label className="flex items-center gap-2 w-full">
              Top-P : {topP}
              <input
                className="flex-1"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
              />
            </label>
          </div>
        </form>
      </footer>
    </div>
  );
}
