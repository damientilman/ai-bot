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
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: updatedHistory, temperature, top_p: topP }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur côté API :", errorText);
        throw new Error("Erreur côté agent : " + res.status);
      }

      const data = await res.json();
      setHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error("Erreur dans sendMessage :", err);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-purple-700 to-red-600">
      <div className="w-full max-w-6xl bg-zinc-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden text-white">
        <header className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Outbound GPT</h1>
          <span className="text-xs bg-zinc-700 px-3 py-1 rounded-full">Latest : June 04</span>
        </header>

        <main ref={scrollRef} className="h-[60vh] overflow-y-auto p-6 space-y-4">
          {history.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-md p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-emerald-500 text-white"
                    : "bg-blue-600 text-white"
                }`}
                style={{ margin: "4px" }}
              >
                {Array.isArray(msg.content)
                  ? msg.content.map((block: any, idx: number) =>
                      block.type === "text" ? (
                        <ReactMarkdown key={idx} remarkPlugins={[remarkGfm]}>
                          {block.text}
                        </ReactMarkdown>
                      ) : (
                        <img
                          key={idx}
                          src={block.image_url.url}
                          alt="envoyée"
                          className="mt-2 rounded"
                        />
                      )
                    )
                  : (
                    <div className="prose prose-sm prose-invert text-white max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-center text-sm text-zinc-400 animate-pulse">
              OutboundGPT est en train d'écrire...
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-zinc-800 bg-zinc-900">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              className="flex-1 bg-zinc-800 rounded-full px-4 py-2 text-sm placeholder-zinc-400 focus:outline-none"
              placeholder="Écris ta question ici…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4 py-2 text-sm"
              disabled={loading}
            >
              Envoyer
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}