"use client";
import { usePathname } from "next/navigation";

export default function GlobalFooter() {
  const pathname = usePathname();
  
  // Hide footer on full-height screens or custom footer screens
  if (pathname === "/" || pathname === "/register" || pathname.startsWith("/messages")) {
    return null;
  }

  return (
    <footer style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)", fontSize: "0.9rem", borderTop: "1px solid var(--border)", marginTop: "auto", fontFamily: "'Rajdhani', sans-serif" }}>
      Designed and developed by <span className="gradient-text" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>Rocky Codm</span>
    </footer>
  );
}
