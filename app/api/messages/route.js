import { readDB, writeDB } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const otherUserId = searchParams.get("otherUserId");

  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });

  const db = await readDB();
  if (!db.messages) db.messages = [];
  
  if (otherUserId) {
    let changed = false;
    db.messages.forEach(m => {
      if (m.senderId === otherUserId && m.receiverId === userId && m.read === false) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) await writeDB(db);

    let chat = db.messages.filter(m => 
      (m.senderId === userId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === userId)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const before = searchParams.get("before");
    const after = searchParams.get("after");
    const initial = searchParams.get("initial");

    if (after) {
      const afterMsgs = chat.filter(m => new Date(m.createdAt) > new Date(after));
      return Response.json({ messages: afterMsgs, hasMore: false });
    }

    if (before) {
      chat = chat.filter(m => new Date(m.createdAt) < new Date(before));
    }

    if (initial === "true" || before) {
      const limit = 20;
      const start = Math.max(0, chat.length - limit);
      const paginated = chat.slice(start);
      return Response.json({
        messages: paginated,
        hasMore: start > 0
      });
    }

    return Response.json(chat);
  }

  const allUserMsgs = db.messages.filter(m => m.senderId === userId || m.receiverId === userId);
  return Response.json(allUserMsgs);
}

export async function POST(request) {
  const body = await request.json();
  const { senderId, receiverId, text, replyTo } = body;

  if (!senderId || !receiverId || !text) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await readDB();
  if (!db.messages) db.messages = [];

  const newMessage = {
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    senderId,
    receiverId,
    text,
    replyTo: replyTo || null,
    createdAt: new Date().toISOString(),
    read: false
  };

  db.messages.push(newMessage);
  await writeDB(db);

  return Response.json(newMessage, { status: 201 });
}

export async function DELETE(request) {
  const body = await request.json();
  const { userId, otherUserId } = body;

  if (!userId || !otherUserId) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await readDB();
  if (!db.messages) db.messages = [];

  const filtered = db.messages.filter(m => 
    !((m.senderId === userId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === userId))
  );

  db.messages = filtered;
  await writeDB(db);

  return Response.json({ success: true });
}
