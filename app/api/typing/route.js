import { readDB, writeDB } from "@/lib/db";

// GET typing status
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId"); // person who receives the message
  const otherUserId = searchParams.get("otherUserId"); // person who might be typing

  if (!userId || !otherUserId) return Response.json({ typing: false });

  const db = await readDB();
  const typingEvents = db.typing || [];

  // Find if otherUser is typing to User and if it's within the last 5 seconds
  const isTyping = typingEvents.some(
    (t) => t.senderId === otherUserId && t.receiverId === userId && Date.now() - t.timestamp < 5000
  );

  return Response.json({ typing: isTyping });
}

// POST set typing status
export async function POST(request) {
  try {
    const { senderId, receiverId } = await request.json();
    if (!senderId || !receiverId) return Response.json({ error: "Missing ids" }, { status: 400 });

    const db = await readDB();
    if (!db.typing) db.typing = [];

    // Filter out old expired typing events (older than 10 seconds to keep DB clean)
    const now = Date.now();
    db.typing = db.typing.filter(t => now - t.timestamp < 10000);

    // Add or update current typing event
    const existingIndex = db.typing.findIndex(t => t.senderId === senderId && t.receiverId === receiverId);
    if (existingIndex !== -1) {
      db.typing[existingIndex].timestamp = now;
    } else {
      db.typing.push({ senderId, receiverId, timestamp: now });
    }

    await writeDB(db);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
