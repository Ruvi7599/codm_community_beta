import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "db.json");

export function readDB() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export function writeDB(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
