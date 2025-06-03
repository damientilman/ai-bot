import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get("session_id");

  if (!session_id) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const result = await sql`
      SELECT role, content FROM messages
      WHERE session_id = ${session_id}
      ORDER BY created_at ASC;
    `;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération messages :", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
