import { readDB } from "@/lib/db";

export async function POST(request) {
  const { email, password } = await request.json();
  const db = await readDB();

  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const { password: _pw, ...safeUser } = user;
  return Response.json({ success: true, user: safeUser });
}
