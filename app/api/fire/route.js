import { readDB, writeDB } from "@/lib/db";

export async function POST(request) {
  const { postId } = await request.json();

  if (!postId) {
    return Response.json({ error: "postId is required" }, { status: 400 });
  }

  const db = readDB();
  const post = db.posts.find((p) => p.id === postId);

  if (!post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  post.fires = (post.fires || 0) + 1;
  writeDB(db);

  return Response.json({ success: true, fires: post.fires });
}
