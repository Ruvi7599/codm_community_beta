import { readDB, writeDB } from "@/lib/db";

export async function POST(request) {
  const body = await request.json();
  const { name, email, password, codmName, codmId, rank, level, gender, facebook, tiktok, discord } = body;

  const db = readDB();

  // Check if email already exists
  const existing = db.users.find((u) => u.email === email);
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 400 });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password, // plaintext for simplicity
    codmName,
    codmId,
    rank,
    level,
    gender,
    socialLinks: { facebook: facebook || "", tiktok: tiktok || "", discord: discord || "" },
    avatar: null,
    bio: "",
    savedPosts: [],
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);

  // Return user without password
  const { password: _pw, ...safeUser } = newUser;
  return Response.json({ success: true, user: safeUser }, { status: 201 });
}
