import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  const { role, content, session_id } = await req.json();

  try {
    await sql`
      INSERT INTO messages (role, content, session_id)
      VALUES (${role}, ${content}, ${session_id})
    `;

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erreur Neon:", err);
    return new Response(JSON.stringify({ error: "DB insert failed" }), {
      status: 500,
    });
  }
}
