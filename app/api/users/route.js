import { readDB } from "@/lib/db";

export async function GET() {
  const db = await readDB();

  const users = db.users.map((u) => ({
    id: u.id,
    codmName: u.codmName,
    rank: u.rank,
    avatar: u.avatar,
    lastActive: u.lastActive || null,
  }));

  // Sort active users first
  users.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));

  return Response.json(users);
}
