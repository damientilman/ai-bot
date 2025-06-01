import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Tu es un agent utile, drôle et synthétique.' },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 800,
    });

    const reply = completion.choices?.[0]?.message?.content || 'Erreur de réponse du modèle';

    return new Response(
      JSON.stringify({ reply }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erreur serveur :', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
