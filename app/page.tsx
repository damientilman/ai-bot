"use client";

import React, { useState } from "react";

export default function Page() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [history, setHistory] = useState<{ role: string; content: string; timestamp: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user', content: message, timestamp: now };
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, temperature }),
      });

      const text = await res.text();
      const data = JSON.parse(text);
      const botReply = { role: 'assistant', content: data.reply || "Pas de réponse reçue.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setHistory((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Erreur frontend :", err);
      const errorReply = { role: 'assistant', content: "Erreur côté client : réponse invalide.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setHistory((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = () => {
    setHistory([]);
    setMessage("");
    setReply("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-200 dark:from-slate-900 dark:to-slate-700 text-black dark:text-white flex flex-col items-center p-4">
      <div className="bg-black/5 dark:bg-white/10 backdrop-blur-lg p-6 rounded-2xl w-full max-w-2xl shadow-xl flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-center">OutboundGPT</h1>
          <button onClick={resetConversation} className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md">Réinitialiser</button>
        </div>

        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto px-2">
          {history.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-4 py-3 rounded-xl max-w-[80%] whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/20 text-white border border-white/10'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-xs text-gray-400 mt-1">{msg.timestamp}</span>
            </div>
          ))}
          {loading && (
            <div className="self-start px-4 py-3 rounded-xl bg-white/20 text-white border border-white/10">
              OutboundGPT est en train de rédiger...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <textarea
            className="w-full p-4 rounded-md bg-white/40 dark:bg-white/20 border border-black/10 dark:border-white/30 text-black dark:text-white placeholder-black dark:placeholder-white focus:outline-none focus:ring focus:ring-emerald-400"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Pose ta question ou donne une instruction à OutboundGPT..."
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="temp" className="text-sm font-medium">Température : {temperature}</label>
            <input
              id="temp"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 transition font-semibold py-2 px-4 rounded-md text-white disabled:opacity-50"
          >
            {loading ? "Chargement..." : "Envoyer"}
          </button>
        </form>
      </div>
    </main>
  );
}
