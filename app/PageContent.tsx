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
  const [introFramework, setIntroFramework] = useState("");
  const lastRequestRef = useRef<any>(null);
  const [urls, setUrls] = useState(Array(18).fill(""));

  const [expandedBlocks, setExpandedBlocks] = useState(Array(6).fill(true));

  const [displayedText, setDisplayedText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formVisible, setFormVisible] = useState(false);

  const resetConversation = () => {
    setHistory([]);
    lastRequestRef.current = null;
  };

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

    // Préparer la requête pour stockage/réutilisation
    const reqBody = {
      history: updatedHistory,
      temperature,
      top_p: topP,
      introFramework,
      theme: message,
      urls,
    };
    lastRequestRef.current = reqBody;

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
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

  // Nouvelle fonction handleRefresh selon la demande
  const handleRefresh = async () => {
    const lastReq = lastRequestRef.current;
    if (!lastReq) return;

    // Supprimer le dernier message de l'assistant dans une copie propre
    const cleanedHistory = [...lastReq.history];
    const lastAssistantIndex = cleanedHistory.map((msg) => msg.role).lastIndexOf("assistant");
    if (lastAssistantIndex !== -1) {
      cleanedHistory.splice(lastAssistantIndex, 1);
    }

    const refreshedReq = {
      ...lastReq,
      history: cleanedHistory,
    };

    lastRequestRef.current = refreshedReq; // mettre à jour la référence pour les futurs refresh
    setHistory(cleanedHistory); // mettre à jour le state visible
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(refreshedReq),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur côté API (refresh) :", errorText);
        throw new Error("Erreur côté agent : " + res.status);
      }

      const data = await res.json();
      setHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error("Erreur dans handleRefresh :", err);
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
    const el = scrollRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [displayedText]);

  // Le useEffect pour l'effet machine à écrire est supprimé pour désactiver l'effet

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-purple-700 to-red-600">
      <style>{`
        .bubble-user {
          background-color: #e5e7eb;
          color: black;
          border-radius: 1rem;
          padding: 15px;
          margin: 20px 0;
          align-self: flex-end;
          max-width: 900px;
          width: fit-content;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.35;
        }
        .bubble-assistant {
          background-color: #1f2937;
          color: white;
          border-radius: 1rem;
          padding: 30px;
          margin: 20px 0;
          align-self: flex-start;
          max-width: 80vw;
          width: fit-content;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.35;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        /* Fade-in/fade-out pour le menu */
        .fade-enter {
          opacity: 0;
          transform: translateY(20px);
        }
        .fade-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .fade-exit {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-exit-active {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
      `}</style>
      <div className="w-full overflow-hidden text-white flex flex-col">

        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-8 py-6 pb-10 space-y-3 flex flex-col items-center"
        >
          {history.length === 0 && !loading && (
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">OutboundGPT</h2>
            </div>
          )}
          {history.map((msg, i) => {
            const isLastAssistantMessage =
              msg.role === "assistant" &&
              i === history.map((m) => m.role).lastIndexOf("assistant");

            return (
              <div
                key={i}
                className={`w-full flex justify-center animate-fade-in`}
              >
                <div
                  className={`${
                    msg.role === "user" ? "bubble-user" : "bubble-assistant"
                  }`}
                  style={{ margin: "6px 0" }}
                >
                  <div className="prose prose-sm prose-invert max-w-none leading-tight">
                    {msg.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {Array.isArray(msg.content)
                          ? msg.content
                              .map((block: any) =>
                                block.type === "text" ? block.text : ""
                              )
                              .join("\n")
                          : msg.content}
                      </ReactMarkdown>
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

        {/* Floating Toggle Button: Always visible */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            className="bg-zinc-800 text-white rounded-full p-4 shadow-lg hover:bg-zinc-700 transition text-xl"
            onClick={() => setFormVisible((prev) => !prev)}
          >
            <span className={formVisible ? "text-green-400" : ""}>
              {formVisible ? "✖️" : "💬"}
            </span>
          </button>
        </div>

        {/* Footer menu: always mounted, fade in/out */}
        <footer
          className={`fixed top-0 right-0 h-full w-[800px] backdrop-blur-lg rounded-l-3xl p-6 shadow-xl z-40 text-black transition-all duration-500 ${
            formVisible
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-full pointer-events-none"
          } bg-zinc-900`}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">

            <div>
              <label className="block mb-1 font-semibold text-white">Thématique de la campagne</label>
              <input
                type="text"
                className="w-full bg-zinc-800 text-white rounded-xl px-4 py-2 placeholder-zinc-400 focus:outline-none"
                placeholder="Ex. : Promotion d'été pour les solaires"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
              />
            </div>

            <h3 className="text-lg font-semibold text-white mt-2">Produits</h3>
            {Array.from({ length: 6 }).map((_, blockIdx) => (
              <div key={blockIdx} className="border border-zinc-700 rounded-xl mb-4 overflow-hidden">
                <button
                  type="button"
                  className="w-full flex justify-between items-center px-4 py-3 bg-zinc-800 text-white font-semibold hover:bg-zinc-700"
                  onClick={() =>
                    setExpandedBlocks((prev) =>
                      prev.map((val, i) => (i === blockIdx ? !val : val))
                    )
                  }
                >
                  <span>Bloc {blockIdx + 1}</span>
                  <span>{expandedBlocks[blockIdx] ? "▲" : "▼"}</span>
                </button>
                {expandedBlocks[blockIdx] && (
                  <div className="flex flex-col gap-4 p-4">
                    {Array.from({ length: 3 }).map((_, i) => {
                      const globalIdx = blockIdx * 3 + i;
                      return (
                        <div key={globalIdx}>
                          <label className="block mb-1 font-semibold text-white">URL</label>
                          <input
                            type="url"
                            value={urls[globalIdx]}
                            onChange={(e) => {
                              const updated = [...urls];
                              updated[globalIdx] = e.target.value;
                              setUrls(updated);
                            }}
                            placeholder="https://newpharma.be/..."
                            className="w-full bg-zinc-800 text-white rounded-xl px-4 py-2 placeholder-zinc-400 focus:outline-none"
                            disabled={loading}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-center gap-4 mt-6">
              <button
                type="button"
                className="bg-zinc-300 hover:bg-zinc-200 text-black rounded-full px-6 py-2 text-sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                Actualiser
              </button>
              <button
                type="submit"
                className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-full px-6 py-2 text-sm"
                disabled={loading}
              >
                Générer
              </button>
              <button
                type="button"
                className="bg-zinc-300 hover:bg-zinc-200 text-black rounded-full px-6 py-2 text-sm"
                onClick={resetConversation}
              >
                Réinitialisation
              </button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
}