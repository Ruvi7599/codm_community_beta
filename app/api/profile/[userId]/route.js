import { readDB, writeDB } from "@/lib/db";

export async function GET(request, { params }) {
  const { userId } = await params;
  const db = readDB();

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const { password: _pw, ...safeUser } = user;
  const userPosts = db.posts
    .filter((p) => p.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return Response.json({ user: safeUser, posts: userPosts });
}

export async function PUT(request, { params }) {
  const { userId } = await params;
  const body = await request.json();

  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  // Update allowed fields
  const allowed = ["name", "codmName", "codmId", "rank", "level", "gender", "bio", "avatar", "socialLinks"];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === "socialLinks" && typeof body[key] === "object") {
        user.socialLinks = { ...user.socialLinks, ...body[key] };
      } else {
        user[key] = body[key];
      }
    }
  }

  writeDB(db);

  const { password: _pw, ...safeUser } = user;
  return Response.json({ success: true, user: safeUser });
}

export async function DELETE(request, { params }) {
  const { userId } = await params;
  const db = readDB();

  // 1. Remove User
  db.users = db.users.filter((u) => u.id !== userId);

  // 2. Remove Posts created by the user
  db.posts = db.posts.filter((p) => p.userId !== userId);

  // 3. Remove User's interactions (comments, likes) from ALL remaining posts
  db.posts = db.posts.map(post => {
    if (post.likedBy) post.likedBy = post.likedBy.filter(id => id !== userId);
    if (post.comments) post.comments = post.comments.filter(c => c.userId !== userId);
    return post;
  });

  // 4. Remove all Messages involving this user
  db.messages = db.messages.filter(m => m.from !== userId && m.to !== userId);

  writeDB(db);
  return Response.json({ success: true });
}
