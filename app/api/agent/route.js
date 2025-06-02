import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { history, temperature, top_p } = body;

    const messages = [
      {
        role: "system",
        content: "Tu es OutboundGPT, un expert en marketing et capable d'analyser des images. Si une image est envoyée, analyse-la en contexte avec le texte.",
      },
      ...history
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: temperature ?? 0.3,
      top_p: top_p ?? 0.8,
      max_tokens: 1000,
    });

    const reply = completion.choices?.[0]?.message?.content || "Pas de réponse reçue.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return new Response(JSON.stringify({ error: "Erreur interne" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
