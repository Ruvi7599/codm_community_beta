import { readDB, writeDB } from "@/lib/db";

// GET comments for a post
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) return Response.json({ error: "postId required" }, { status: 400 });

  const db = await readDB();
  const post = db.posts.find((p) => p.id === postId);
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  return Response.json({ comments: post.comments || [] });
}

// POST add comment
export async function POST(request) {
  const { postId, userId, text, replyTo } = await request.json();

  if (!postId || !userId || !text?.trim()) {
    return Response.json({ error: "postId, userId, text required" }, { status: 400 });
  }

  const db = await readDB();
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
    replyTo: replyTo || null,
    createdAt: new Date().toISOString(),
  };

  post.comments.push(comment);
  await writeDB(db);

  return Response.json({ success: true, comment });
}

// PUT edit comment
export async function PUT(request) {
  const { postId, commentId, userId, text } = await request.json();
  if (!postId || !commentId || !userId || !text?.trim()) {
    return Response.json({ error: "postId, commentId, userId, text required" }, { status: 400 });
  }

  const db = await readDB();
  const post = db.posts.find((p) => p.id === postId);
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  const comment = post.comments?.find((c) => c.id === commentId);
  if (!comment) return Response.json({ error: "Comment not found" }, { status: 404 });

  if (comment.userId !== userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  comment.text = text.trim();
  await writeDB(db);

  return Response.json({ success: true, comment });
}

// DELETE comment
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  const commentId = searchParams.get("commentId");
  const userId = searchParams.get("userId");

  if (!postId || !commentId || !userId) {
    return Response.json({ error: "postId, commentId, userId required" }, { status: 400 });
  }

  const db = await readDB();
  const post = db.posts.find((p) => p.id === postId);
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  const commentIndex = post.comments?.findIndex((c) => c.id === commentId);
  if (commentIndex === -1 || commentIndex === undefined) return Response.json({ error: "Comment not found" }, { status: 404 });

  if (post.comments[commentIndex].userId !== userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  post.comments.splice(commentIndex, 1);
  await writeDB(db);

  return Response.json({ success: true });
}
