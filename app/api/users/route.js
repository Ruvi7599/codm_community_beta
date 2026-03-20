import { readDB } from "@/lib/db";

export async function GET() {
  const db = await readDB();

  // Return limited info
  const users = db.users.map((u) => ({
    id: u.id,
    codmName: u.codmName,
    rank: u.rank,
    avatar: u.avatar,
    // Add logic for mock "active" maybe random?
    isActive: Math.random() > 0.4
  }));

  // Sort active first maybe? Or just return as is
  users.sort((a, b) => b.isActive - a.isActive);

  return Response.json(users);
}
