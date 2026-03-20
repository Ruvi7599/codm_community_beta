import { readDB, writeDB } from "@/lib/db";

export async function POST(request) {
  const { postId, userId } = await request.json();

  if (!postId || !userId) {
    return Response.json({ error: "postId and userId required" }, { status: 400 });
  }

  const db = readDB();
  const post = db.posts.find((p) => p.id === postId);
  if (!post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Toggle like
  const idx = post.likedBy.findIndex((l) => l.userId === userId);
  let liked = false;

  if (idx === -1) {
    // Add like
    post.likedBy.push({
      userId,
      codmName: user.codmName,
      avatar: user.avatar || null,
    });
    liked = true;
  } else {
    // Remove like
    post.likedBy.splice(idx, 1);
    liked = false;
  }

  post.fires = post.likedBy.length;
  writeDB(db);

  return Response.json({
    success: true,
    liked,
    fires: post.fires,
    likedBy: post.likedBy,
  });
}
