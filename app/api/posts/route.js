import { readDB, writeDB } from "@/lib/db";

export async function GET() {
  const db = await readDB();

  const postsWithUser = db.posts
    .map((post) => {
      const user = db.users.find((u) => u.id === post.userId);
      return {
        ...post,
        userName: user?.name || "Unknown",
        codmName: user?.codmName || "Unknown",
        userRank: user?.rank || "",
        userAvatar: user?.avatar || null,
        userGender: user?.gender || null,
        userLastActive: user?.lastActive || null,
        likedBy: post.likedBy || [],
        fires: post.fires || 0,
        comments: post.comments || [],
        edited: post.edited || false,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return Response.json(postsWithUser);
}

export async function POST(request) {
  const body = await request.json();
  const { userId, content, imageUrl } = body;

  if (!userId || !content) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = await readDB();

  const newPost = {
    id: Date.now().toString(),
    userId,
    content,
    imageUrl: imageUrl || null,
    fires: 0,
    likedBy: [],
    comments: [],
    edited: false,
    createdAt: new Date().toISOString(),
  };

  db.posts.unshift(newPost);
  await writeDB(db);

  return Response.json(newPost, { status: 201 });
}
