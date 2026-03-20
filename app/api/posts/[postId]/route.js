import { readDB, writeDB } from "@/lib/db";

// PUT: edit post
export async function PUT(request, { params }) {
  const { postId } = await params;
  const { userId, content, imageUrl } = await request.json();

  if (!content?.trim()) {
    return Response.json({ error: "Content required" }, { status: 400 });
  }

  const db = await readDB();
  const post = db.posts.find((p) => p.id.toString() === postId);
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  if (post.userId !== userId) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  post.content = content.trim();
  if (imageUrl !== undefined) {
    post.imageUrl = imageUrl;
  }
  post.edited = true;
  await writeDB(db);

  return Response.json({ success: true, post });
}

// DELETE: delete post
export async function DELETE(request, { params }) {
  const { postId } = await params;
  const { userId } = await request.json();

  const db = await readDB();
  const postIdx = db.posts.findIndex((p) => p.id.toString() === postId);
  if (postIdx === -1) return Response.json({ error: "Post not found" }, { status: 404 });

  if (db.posts[postIdx].userId !== userId) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  db.posts.splice(postIdx, 1);

  // Remove from all users' savedPosts
  db.users = db.users.map((u) => ({
    ...u,
    savedPosts: (u.savedPosts || []).filter((id) => id !== postId),
  }));

  await writeDB(db);
  return Response.json({ success: true });
}
