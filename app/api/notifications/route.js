import { readDB } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const since = searchParams.get("since"); // ISO timestamp

  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });

  const db = await readDB();
  const sinceTime = since ? new Date(since).getTime() : 0;
  const notifications = [];

  // 1. New posts from other users
  if (db.posts) {
    db.posts
      .filter(p => p.userId !== userId && new Date(p.createdAt).getTime() > sinceTime)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 15)
      .forEach(p => {
        const poster = db.users?.find(u => u.id === p.userId);
        notifications.push({
          id: `post_${p.id}`,
          type: "post",
          text: `${poster?.codmName || "Someone"} shared a new post`,
          link: "/feed",
          createdAt: p.createdAt,
        });
      });
  }

  // 2. New comments on the current user's posts
  if (db.posts) {
    db.posts
      .filter(p => p.userId === userId && p.comments?.length > 0)
      .forEach(p => {
        p.comments
          .filter(c => c.userId !== userId && new Date(c.createdAt).getTime() > sinceTime)
          .forEach(c => {
            notifications.push({
              id: `comment_${c.id}`,
              type: "comment",
              text: `${c.codmName || "Someone"} commented on your post`,
              link: "/feed",
              createdAt: c.createdAt,
            });
          });
      });
  }

  // 3. New unread messages
  if (db.messages) {
    db.messages
      .filter(m => m.receiverId === userId && m.read === false)
      .forEach(m => {
        const sender = db.users?.find(u => u.id === m.senderId);
        notifications.push({
          id: `msg_${m.id}`,
          type: "message",
          text: `${sender?.codmName || "Someone"} sent you a message`,
          link: `/messages?u=${m.senderId}`,
          createdAt: m.createdAt,
        });
      });
  }

  // Sort newest first
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return Response.json(notifications);
}
