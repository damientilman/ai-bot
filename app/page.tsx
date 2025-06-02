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
  }, [history, loading]);

  return (
    <div className="flex flex-col h-screen bg-[#343541] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-[#202123] bg-[#202123]">
        <h1 className="text-xl font-semibold tracking-tight">Outbound Brain</h1>
        <span className="text-xs bg-[#444654] px-3 py-1 rounded-full">GPT 4o</span>
      </header>

      {/* Chat area */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-0 py-0 bg-[#343541] flex flex-col"
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto py-6 space-y-2">
          {greeting && (
            <div className="w-full flex flex-col items-center mt-10">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6ee7b7] to-[#a7f3d0]">Bienvenue sur Outbound Brain</h2>
              <div className="mt-4 flex justify-center gap-3">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMessage(s);
                      sendMessage();
                    }}
                    className="bg-[#444654] px-4 py-2 rounded-full text-sm hover:bg-[#565869] text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((msg, i) => (
            <div
              key={i}
              className={`w-full flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-2xl px-5 py-4 rounded-xl text-base leading-relaxed shadow-md whitespace-pre-wrap break-words ${
                  msg.role === "user"
                    ? "bg-[#2a2b32] text-white self-end"
                    : "bg-[#444654] text-white"
                }`}
                style={{
                  borderRadius: msg.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  margin: "8px 0"
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="w-full flex justify-start">
              <div className="max-w-2xl px-5 py-4 rounded-xl bg-[#444654] text-white text-base animate-pulse">
                OutboundGPT rédige…
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#202123] px-0 py-6 bg-[#343541]">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex flex-col gap-3"
        >
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

          <div className="flex items-center gap-2 bg-[#40414f] rounded-xl px-4 py-3 shadow-md">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-[#565869] rounded-full p-1"
            >
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
              className="flex-1 bg-transparent text-white placeholder-[#8e8ea0] text-base focus:outline-none px-2"
              placeholder="Envoyer un message à Outbound Brain…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              autoFocus
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className={`ml-2 rounded-full p-2 transition-colors ${
                loading || !message.trim()
                  ? "bg-[#565869] cursor-not-allowed"
                  : "bg-[#19c37d] hover:bg-[#15a06b]"
              }`}
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </form>
        <div className="text-center text-xs text-[#8e8ea0] mt-4">
          Outbound Brain propulsé par GPT-4o — Inspiré de ChatGPT
        </div>
      </footer>
    </div>
  );
}