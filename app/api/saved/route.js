import { readDB, writeDB } from "@/lib/db";

// Toggle save/unsave post
export async function POST(request) {
  const { userId, postId } = await request.json();

  if (!userId || !postId) {
    return Response.json({ error: "userId and postId required" }, { status: 400 });
  }

  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  if (!user.savedPosts) user.savedPosts = [];

  const idx = user.savedPosts.indexOf(postId);
  let saved = false;

  if (idx === -1) {
    user.savedPosts.push(postId);
    saved = true;
  } else {
    user.savedPosts.splice(idx, 1);
    saved = false;
  }

  writeDB(db);
  return Response.json({ success: true, saved });
}
