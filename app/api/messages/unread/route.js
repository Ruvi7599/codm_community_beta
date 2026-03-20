import { readDB } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });

  const db = await readDB();
  if (!db.messages) return Response.json([]);

  const unreadMessages = db.messages
    .filter(m => m.receiverId === userId && m.read === false)
    .map(m => {
       const user = db.users.find(u => u.id === m.senderId);
       return { ...m, senderName: user ? user.codmName : "Someone" };
    });
  return Response.json(unreadMessages);
}
