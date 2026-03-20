"use client";
import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export default function GlobalNav() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/register") return null;
  return <NavBar />;
}
