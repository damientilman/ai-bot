"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Mic, Send, Image as ImageIcon, X } from "lucide-react";

export default function PageContent() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [temperature] = useState(0.7);
  const [topP] = useState(0.95);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [displayedText, setDisplayedText] = useState("");
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

  // Typewriter effect for the last assistant message
  useEffect(() => {
    // Find last assistant message
    const lastAssistantIndex = history.map((msg) => msg.role).lastIndexOf("assistant");
    if (lastAssistantIndex === -1) {
      setDisplayedText("");
      return;
    }
    const lastAssistantMessage = history[lastAssistantIndex];
    if (!lastAssistantMessage) return;

    // Compose full text from content array or string
    let fullText = "";
    if (Array.isArray(lastAssistantMessage.content)) {
      fullText = lastAssistantMessage.content
        .map((block: any) => (block.type === "text" ? block.text : ""))
        .join("\n");
    } else if (typeof lastAssistantMessage.content === "string") {
      fullText = lastAssistantMessage.content;
    } else {
      fullText = "";
    }

    let currentIndex = 0;
    setDisplayedText("");

    if (fullText.length === 0) return;

    const interval = setInterval(() => {
      currentIndex++;
      setDisplayedText(fullText.slice(0, currentIndex));
      if (currentIndex === fullText.length) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [history]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-purple-700 to-red-600">
      <style>{`
        .bubble-user {
          background-color: #34D399;
          color: white;
          border-radius: 1rem;
          padding: 5px 10px;
          margin: 6px 0;
          align-self: flex-end;
          max-width: 70%;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.35;
        }
        .bubble-assistant {
          background-color: #3B82F6;
          color: white;
          border-radius: 1rem;
          padding: 5px 10px;
          margin: 6px 0;
          align-self: flex-start;
          max-width: 70%;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.35;
        }
      `}</style>
      <div className="w-full max-w-7xl h-[85vh] bg-zinc-900 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col">
        <header className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Outbound GPT</h1>
          <span className="text-xs bg-zinc-700 px-3 py-1 rounded-full">Latest : June 04</span>
        </header>

        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-8 py-6 space-y-3 flex flex-col"
        >
          {history.length === 0 && !loading && (
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-4">Outbound GPT</h2>
              <button
                onClick={() => {
                  setMessage("Démarrons une campagne");
                  sendMessage();
                }}
                className="bg-zinc-800 text-white px-6 py-3 rounded-xl hover:bg-zinc-700 transition"
              >
                Démarrons une campagne
              </button>
            </div>
          )}
          {history.map((msg, i) => {
            const isLastAssistantMessage =
              msg.role === "assistant" &&
              i === history.map((m) => m.role).lastIndexOf("assistant");

            return (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`${
                    msg.role === "user" ? "bubble-user" : "bubble-assistant"
                  }`}
                  style={{ margin: "6px 0" }}
                >
                  <div className="prose prose-sm prose-invert max-w-none leading-tight">
                    {msg.role === "assistant" && isLastAssistantMessage ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {displayedText}
                      </ReactMarkdown>
                    ) : msg.role === "assistant" ? (
                      Array.isArray(msg.content)
                        ? msg.content
                            .map((block: any) =>
                              block.type === "text" ? block.text : ""
                            )
                            .join("\n")
                        : msg.content
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {Array.isArray(msg.content)
                          ? msg.content
                              .map((block: any) =>
                                block.type === "text" ? block.text : ""
                              )
                              .join("\n")
                          : msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="text-center text-sm text-zinc-400 animate-pulse">
              OutboundGPT est en train d'écrire...
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-zinc-800 bg-zinc-900">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <textarea
              className="flex-1 bg-zinc-800 rounded-xl px-4 py-2 text-sm placeholder-zinc-400 focus:outline-none"
              placeholder="Écris ta question ici…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ height: "80px", overflow: "auto" }}
              disabled={loading}
              rows={1}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
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