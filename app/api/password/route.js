import { readDB, writeDB } from "@/lib/db";

// Change password
export async function POST(request) {
  const { userId, currentPassword, newPassword } = await request.json();

  if (!userId || !currentPassword || !newPassword) {
    return Response.json({ error: "All fields required" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return Response.json({ error: "New password must be at least 6 characters" }, { status: 400 });
  }

  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  if (user.password !== currentPassword) {
    return Response.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  user.password = newPassword;
  writeDB(db);

  return Response.json({ success: true });
}
