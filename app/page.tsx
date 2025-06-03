"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Image as ImageIcon, X } from "lucide-react";

export default function Page() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [temperature] = useState(0.7);
  const [topP] = useState(0.95);
  const [greeting, setGreeting] = useState(true);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [sessions, setSessions] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);


  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadSession = async (sessionId: string) => {
  try {
    const res = await fetch(`/api/messages?session_id=${sessionId}`);
    const data = await res.json();
    setHistory(data);
    setGreeting(false);
  } catch (error) {
    console.error("Erreur chargement session :", error);
  }
};

  const suggestions = ["Aide moi à créer une campagne"];

  const saveMessage = async (role: string, content: string) => {
  try {
    const res = await fetch("/api/save-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content, session_id: "session-1234" }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Erreur backend :", data.error || res.statusText);
    } else {
      console.log(`✅ Message ${role} enregistré :`, content);
    }
  } catch (err) {
    console.error("Erreur de sauvegarde message:", err);
  }
};

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

    await saveMessage("user", message);

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
      await saveMessage("assistant", data.reply);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) handleSubmit(e as any);
    }
  };

  useEffect(() => {
  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error("Erreur chargement sessions :", error);
    }
  };

  fetchSessions();
}, []);
  
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, loading]);

  return (
    <div className="flex flex-col h-screen bg-[#343541] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-[#202123] bg-[#202123]">
  <div className="flex items-center gap-4">
    <button onClick={() => setShowSidebar(true)} className="hover:bg-[#444654] p-1 rounded">
      <Menu size={20} />
    </button>
    <button
  onClick={() => {
    setHistory([]);
    setGreeting(true);
    setMessage("");
  }}
  className="text-xl font-semibold tracking-tight focus:outline-none hover:opacity-80"
>
  Outbound Brain
</button>

  </div>
  <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full">
  Up to date
</span>

</header>


      {/* Chat area */}

    {showSidebar && (
  <aside className="fixed top-0 left-0 h-full w-64 bg-[#202123] text-white border-r border-[#2a2b32] overflow-y-auto z-20">
    <div className="p-4 border-b border-[#2a2b32] flex justify-between items-center">
      <h2 className="text-lg font-semibold">Conversations</h2>
      <button onClick={() => setShowSidebar(false)} className="text-sm">✕</button>
    </div>
    <ul className="p-4 space-y-2 text-sm">
      {Array.isArray(sessions) && sessions.length > 0 ? (
  sessions.map((s, idx) => (
    <li key={idx} className="truncate">
      <button
        onClick={() => loadSession(s.session_id)}
        className="w-full text-left hover:underline"
      >
        {s.session_id}
      </button>
    </li>
  ))
) : (
  <li className="text-gray-400 italic">Aucune session trouvée</li>
)}
    </ul>
  </aside>
)}

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

          <div className="flex items-end gap-2 bg-[#40414f] rounded-xl px-4 py-3 shadow-md">
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

            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent text-white placeholder-[#8e8ea0] text-base focus:outline-none px-2 resize-none max-h-40 min-h-[40px] overflow-y-auto"
              placeholder="Envoyer un message à Outbound Brain…"
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleTextareaKeyDown}
              disabled={loading}
              autoFocus
              rows={1}
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
          Outbound Brain — propulsé pour Newpharma.
        </div>
      </footer>
    </div>
  );
}