import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(req: Request) {
  try {
    const { role, content, session_id } = await req.json();

    if (!role || !content || !session_id) {
      return NextResponse.json({ error: "Missing role, content or session_id" }, { status: 400 });
    }

    // 1. Créer la session si elle n'existe pas
    await sql`
      INSERT INTO sessions (session_id, title)
      VALUES (${session_id}, ${content.slice(0, 30)})
      ON CONFLICT (session_id) DO NOTHING;
    `;

    // 2. Enregistrer le message
    await sql`
      INSERT INTO messages (role, content, session_id)
      VALUES (${role}, ${content}, ${session_id});
    `;

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Erreur route save-message:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
