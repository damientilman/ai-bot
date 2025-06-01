'use client';

import React, { useState } from 'react';

export default function Page() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReply('');

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const text = await res.text();
      console.log('Réponse brute :', text);
      const data = JSON.parse(text);
      setReply(data.reply || 'Pas de réponse reçue.');
    } catch (err) {
      console.error('Erreur frontend :', err);
      setReply("Erreur côté client : réponse invalide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: 600, margin: 'auto' }}>
      <h1>🤖 Ton agent GPT personnalisé</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{ width: '100%', marginBottom: '1rem' }}
          placeholder="Pose ta question ici..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Chargement...' : 'Envoyer'}
        </button>
      </form>
      {reply && (
        <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>
          <strong>Réponse :</strong><br />{reply}
        </div>
      )}
    </main>
  );
}
