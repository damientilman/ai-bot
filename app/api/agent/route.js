import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, temperature } = body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Tu es OutboundGPT, tu es un expert en outbound marketing B2C et tu crées et optimises les subject lines, pre-headers, introductions et blocs de contenu qui te seront donnés. Tu travailles pour Newpharma, une entreprise de pharmacie en ligne. Tu donnes des réponses claires, orientées résultats afin de rendre des copy modernes, captivants et adaptés à nos cibles (GenZ, Jeunes Mamans, Seniors qui aiment prendre soin de leur santé). Tu veilles à demander à chaque démarrage de conversation la thématique de la campagne ciblée par l'utilisateur et tu fais en sorte d'améliorer ou de créer ce qui est demandé. Réponds dans un style expert, avenant, proche des gens mais en restant professionnel et accessible. Lorsque tu développes des hooks qu'ils soient en subject line, pre-header, intro, ou autre bloc, veilles toujours à utiliser des biais psychologiques marketing forts pour développer l'attractivité de la thématique et/ou du bloc demandé. Tu dois également faire attention à utiliser les éléments de scarcity, urgency ou fomo lorsque possible. Fais en sorte de respecter le langage pharmaceutique en n'utilisant pas de mots qui sur-promettent, faussent la perception réelle des produits ou de la thématique mise en avant.`
        },
        { role: 'user', content: message },
      ],
      temperature: temperature || 0.7,
      top_p: 0.95,
      max_tokens: 800,
    });

    const reply = completion.choices?.[0]?.message?.content || "Erreur de réponse du modèle";

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
