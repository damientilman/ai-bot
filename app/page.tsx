"use client";

import React, { useState, useRef, useEffect } from "react";

export default function Page() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([{ role: 'assistant', content: "Bienvenue chez Outbound Brain. Quelle est la thématique de votre campagne aujourd’hui ?" }]);
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatedResponse, setAnimatedResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setHistory((prev) => [...prev, { role: 'user', content: message }]);
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
      setHistory((prev) => [...prev, { role: 'assistant', content: fullReply }]);
    } catch (err) {
      console.error("Erreur frontend :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  }, [history, animatedResponse]);

  return (
    <div className="flex h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 space-y-4">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded text-sm">+ Nouvelle conversation</button>
        {/* Historique placeholder */}
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="truncate cursor-pointer hover:text-emerald-600">Campagne probiotiques</li>
          <li className="truncate cursor-pointer hover:text-emerald-600">Relance Black Friday</li>
        </ul>
      </aside>

      {/* Main chat panel */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="p-6 text-center border-b border-gray-200 dark:border-gray-800 font-bold text-2xl tracking-tight">
          Outbound Brain
        </header>

        {/* Chat feed */}
        <main ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-xl px-4 py-3 text-sm max-w-[75%] whitespace-pre-wrap shadow ${
                msg.role === 'user'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-3 text-sm max-w-[75%] bg-gray-200 dark:bg-gray-700 text-black dark:text-white shadow">
                {animatedResponse || "OutboundGPT est en train de rédiger..."}
              </div>
            </div>
          )}
        </main>

        {/* Input panel */}
        <footer className="border-t border-gray-200 dark:border-gray-800 p-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-4xl mx-auto">
            <div className="flex gap-2 items-center">
              <textarea
                rows={1}
                className="flex-1 resize-none rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Écris un message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="bg-black dark:bg-white text-white dark:text-black rounded-full px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                Envoyer
              </button>
            </div>
            {/* Controls */}
            <div className="flex justify-between gap-6 text-xs text-gray-500 dark:text-gray-400">
              <label className="flex items-center gap-2">
                Température : {temperature}
                <input type="range" min="0" max="1" step="0.01" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} />
              </label>
              <label className="flex items-center gap-2">
                Top-P : {topP}
                <input type="range" min="0" max="1" step="0.01" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} />
              </label>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
}
