import { readDB } from "@/lib/db";

// GET saved posts for a user
export async function GET(request, { params }) {
  const { userId } = await params;

  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const savedIds = user.savedPosts || [];
  const savedPosts = db.posts
    .filter((p) => savedIds.includes(p.id.toString()))
    .map((post) => {
      const author = db.users.find((u) => u.id === post.userId);
      return {
        ...post,
        authorName: author?.codmName || "Unknown",
        authorRank: author?.rank || "",
        authorAvatar: author?.avatar || null,
      };
    })
    .sort((a, b) => savedIds.indexOf(b.id.toString()) - savedIds.indexOf(a.id.toString()));

  return Response.json({ savedPosts });
}
