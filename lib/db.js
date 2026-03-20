import { kv } from "@vercel/kv";

const defaultDB = {
  users: [],
  posts: [],
  comments: [],
  messages: [],
  typing: []
};

export async function readDB() {
  const data = await kv.get("codm_db");
  return data || defaultDB;
}

export async function writeDB(data) {
  await kv.set("codm_db", data);
}
