import { readDB, writeDB } from "@/lib/db";

// GET comments for a post
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) return Response.json({ error: "postId required" }, { status: 400 });

  const db = readDB();
  const post = db.posts.find((p) => p.id === postId);
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  return Response.json({ comments: post.comments || [] });
}

// POST add comment
export async function POST(request) {
  const { postId, userId, text } = await request.json();

  if (!postId || !userId || !text?.trim()) {
    return Response.json({ error: "postId, userId, text required" }, { status: 400 });
  }

  const db = readDB();
  const post = db.posts.find((p) => p.id === postId);
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  const user = db.users.find((u) => u.id === userId);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  if (!post.comments) post.comments = [];

  const comment = {
    id: Date.now().toString(),
    userId,
    codmName: user.codmName,
    avatar: user.avatar || null,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  post.comments.push(comment);
  writeDB(db);

  return Response.json({ success: true, comment });
}
