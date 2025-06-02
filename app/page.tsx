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

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendMessage = async () => {
    if (!message.trim() && !attachedFile) return;

    const content: any[] = [];
    if (message.trim()) content.push({ type: "text", text: message });
    if (attachedFile) {
      const base64 = await getBase64(attachedFile);
      content.push({ type: "image_url", image_url: { url: base64 } });
    }

    const userMessage = { role: "user", content };

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
          top_p: topP
        }),
      });
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
    <div className="flex flex-col h-dvh bg-black text-white">
      <header className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
        <button
          onClick={() => window.location.reload()}
          className="font-semibold text-lg hover:underline cursor-pointer"
        >
          Outbound Brain
        </button>
        <span className="text-xs bg-neutral-800 px-2 py-1 rounded-full">GPT 4o</span>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {greeting && (
          <div className="text-center mt-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Bienvenue sur Outbound Brain
            </h1>
            <div className="flex flex-wrap justify-center mt-6 gap-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMessage(s);
                    sendMessage();
                  }}
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
              {Array.isArray(msg.content)
                ? msg.content.map((block: any, idx: number) =>
                    block.type === "text" ? (
                      <ReactMarkdown key={idx} remarkPlugins={[remarkGfm]}>
                        {block.text}
                      </ReactMarkdown>
                    ) : (
                      <img key={idx} src={block.image_url.url} alt="envoyée" className="mt-2 rounded" />
                    )
                  )
                : <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center text-sm text-gray-400 animate-pulse">
            OutboundGPT est en train de rédiger...
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-800 p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-3xl mx-auto">
          {imagePreview && (
            <div className="flex items-center gap-2 text-xs text-white mb-1">
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

          <div className="flex items-center gap-2 bg-neutral-900 rounded-full px-4 py-2">
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
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
              placeholder="Ask Outbound Brain..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />

            <Mic size={18} className="text-gray-400" />
            <button type="submit" disabled={loading}>
              <Send size={18} className="text-white" />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
