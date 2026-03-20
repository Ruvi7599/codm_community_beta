import { readDB, writeDB } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const otherUserId = searchParams.get("otherUserId");

  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });

  const db = readDB();
  if (!db.messages) db.messages = [];
  
  if (otherUserId) {
    let changed = false;
    db.messages.forEach(m => {
      if (m.senderId === otherUserId && m.receiverId === userId && m.read === false) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) writeDB(db);

    const chat = db.messages.filter(m => 
      (m.senderId === userId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === userId)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return Response.json(chat);
  }

  const allUserMsgs = db.messages.filter(m => m.senderId === userId || m.receiverId === userId);
  return Response.json(allUserMsgs);
}

export async function POST(request) {
  const body = await request.json();
  const { senderId, receiverId, text } = body;

  if (!senderId || !receiverId || !text) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = readDB();
  if (!db.messages) db.messages = [];

  const newMessage = {
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    senderId,
    receiverId,
    text,
    createdAt: new Date().toISOString(),
    read: false
  };

  db.messages.push(newMessage);
  writeDB(db);

  return Response.json(newMessage, { status: 201 });
}

export async function DELETE(request) {
  const body = await request.json();
  const { userId, otherUserId } = body;

  if (!userId || !otherUserId) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = readDB();
  if (!db.messages) db.messages = [];

  const filtered = db.messages.filter(m => 
    !((m.senderId === userId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === userId))
  );

  db.messages = filtered;
  writeDB(db);

  return Response.json({ success: true });
}
