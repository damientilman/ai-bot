"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mic, Send, Image as ImageIcon, X } from "lucide-react";

export default function Page() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [temperature] = useState(0.7);
  const [topP] = useState(0.95);
  const [greeting, setGreeting] = useState(true);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestions = ["Aide moi à créer une campagne"];

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    const updatedHistory = [...history, userMessage];
    setHistory(updatedHistory);
    setMessage("");
    setAttachedFile(null);
    setImagePreview(null);
    setLoading(true);
    setGreeting(false);

    try {
      const res = await fetch("/api/agent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    history: updatedHistory,
    temperature,
    top_p: topP,
  }),
});

if (!res.ok) {
  const errorText = await res.text();
  console.error("Erreur côté API :", errorText);
  throw new Error("Erreur côté agent : " + res.status);
}

const data = await res.json();
setHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      <header className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold tracking-tight">Outbound Brain</h1>
        <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full">GPT 4o</span>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {greeting && (
          <div className="text-center mt-10">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Bienvenue sur Outbound Brain</h2>
            <div className="mt-4 flex justify-center gap-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMessage(s);
                    sendMessage();
                  }}
                  className="bg-zinc-800 px-4 py-2 rounded-full text-sm hover:bg-zinc-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className={`flex justify-center animate-fade-in`}>
            <div
              className={`w-full max-w-2xl px-5 py-4 rounded-xl text-sm leading-relaxed shadow-md whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white self-end"
                  : "bg-zinc-800 text-white"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && <div className="text-center text-sm text-zinc-500 animate-pulse">OutboundGPT rédige…</div>}
      </main>

      <footer className="border-t border-zinc-800 px-4 py-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-3">
          {imagePreview && (
            <div className="flex items-center gap-2 text-sm text-white mb-2">
              <img src={imagePreview} alt="Aperçu" className="w-16 h-16 rounded object-cover" />
              <button
                type="button"
                className="text-red-400 hover:text-red-600 flex items-center gap-1"
                onClick={() => {
                  setAttachedFile(null);
                  setImagePreview(null);
                }}
              >
                <X size={16} /> Supprimer l’image
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-zinc-900 rounded-full px-4 py-3 shadow-md">
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon size={18} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <input
              type="text"
              className="flex-1 bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
              placeholder="Pose ta question à Outbound Brain..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              <Send size={18} className="text-white" />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}