import OpenAI from "openai";

// Variables d'environnement (à configurer)
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Erreur: API Key OpenAI non définie. Veuillez définir la variable d'environnement OPENAI_API_KEY.");
  process.exit(1);
}

export async function POST(req) {
  try {
    // Lecture et validation du body
    const body = await req.json();
    const { history, temperature, top_p } = body;

    // Validation des données d'entrée
    if (!history || !Array.isArray(history) || history.length === 0) {
      return Response.json(
        { error: "L'historique de conversation (history) est requis." },
        { status: 400 }
      );
    }

    // System Prompt simplifié
    const systemPrompt = `
    Vous êtes un rédacteur de contenu expert pour une entreprise pharmaceutique. Votre objectif est de créer des textes persuasifs et engageants pour des campagnes marketing.

    **Contraintes strictes :**
    * Interdiction absolue des mots : stimuler, activer, booster, renforcer, améliorer, équilibrer, garder en équilibre, contribuer à..., être nécessaire, important à, être favorable, bénéfique, avoir un effet bénéfique, avoir un effet positif sur, faire en sorte 
que, à utiliser pour, à utiliser en cas de, votre allié pour, restaurer, corriger, modifier, guérir
    * Respecter scrupuleusement les limites de longueur (objet, pre-header, copy).

    **Instructions :**
    * Réponds toujours dans la langue demandée par l’utilisateur.
    * Privilégie la clarté et la concision.
    `;

    // Appel à l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // ou un autre modèle disponible
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      temperature: typeof temperature === "number" ? temperature : 0.7,
      top_p: typeof top_p === "number" ? top_p : 0.95,
      max_tokens: 800,
    });

    const reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      return Response.json(
        { error: "Aucune réponse générée par OpenAI." },
        { status: 502 }
      );
    }

    return Response.json({ reply });

  } catch (error) {
    console.error("Erreur dans /api/agent/route.js :", error);
    // Log détaillé pour le débogage
    console.error("Stack trace:", error?.stack);
    return Response.json(
      { error: error?.message || "Erreur interne serveur." },
      { status: 500 }
    );
  }
}
