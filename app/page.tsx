"use client";

import React, { useState, useRef, useEffect } from "react";

export default function Page() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<{ role: string; content: string; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatedResponse, setAnimatedResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user', content: message, timestamp: now };
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);
    setAnimatedResponse("");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, temperature, top_p: topP }),
      });

      const text = await res.text();
      const data = JSON.parse(text);
      const fullReply = data.reply || "Pas de réponse reçue.";
      let current = "";

      for (let i = 0; i < fullReply.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 15));
        current += fullReply[i];
        setAnimatedResponse(current);
      }

      const botReply = {
        role: 'assistant',
        content: fullReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setHistory((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Erreur frontend :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  }, [history, loading, animatedResponse]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans">
      <header className="sticky top-0 z-10 bg-gradient-to-b from-white/90 to-transparent dark:from-black/90 backdrop-blur-sm py-24 text-center text-6xl font-bold tracking-tight opacity-90 transition-all duration-1000 ease-out">
        <div className="animate-fade-out-scroll">Outbound Brain</div>
      </header>

      <main ref={containerRef} className="flex-1 overflow-y-auto px-4 pb-40">
        <div className="max-w-2xl mx-auto space-y-4">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-xl px-4 py-3 text-sm max-w-[75%] whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white'
                  : 'bg-gray-100 dark:bg-neutral-900 text-black dark:text-white border border-neutral-300 dark:border-neutral-700'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-3 text-sm max-w-[75%] bg-gray-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white whitespace-pre-wrap">
                {animatedResponse || "OutboundGPT est en train de rédiger..."}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
          <textarea
            rows={1}
            className="flex-1 resize-none rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            placeholder="Écris un message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="bg-black dark:bg-white text-white dark:text-black rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            Envoyer
          </button>
        </form>
      </footer>
    </div>
  );
}
