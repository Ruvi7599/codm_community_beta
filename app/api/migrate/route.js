import fs from "fs";
import path from "path";
import { writeDB } from "@/lib/db";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "db.json");
    if (!fs.existsSync(filePath)) {
      return Response.json({ message: "db.json not found. Migration may have already occurred or you are running in production." });
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    await writeDB(data);
    return Response.json({ success: true, message: "Migration to Vercel KV complete! You can now delete data/db.json." });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
