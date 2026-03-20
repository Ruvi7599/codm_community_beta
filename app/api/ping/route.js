import { readDB, writeDB } from "@/lib/db";

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });

    const db = await readDB();
    const userIndex = db.users.findIndex((u) => u.id === userId);
    
    if (userIndex !== -1) {
      db.users[userIndex].lastActive = Date.now();
      await writeDB(db);
    }
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
