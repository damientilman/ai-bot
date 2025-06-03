import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    const result = await sql`SELECT session_id, created_at FROM sessions ORDER BY created_at DESC;`;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération sessions :", error);
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}
