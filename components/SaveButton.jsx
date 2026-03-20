"use client";
import { useState } from "react";

export default function SaveButton({ postId, currentUserId, savedPostIds = [] }) {
  const [saved, setSaved] = useState(savedPostIds.includes(postId));

  async function handleSave() {
    if (!currentUserId) return;
    const prev = saved;
    setSaved(!prev);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, postId }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(data.saved);
        // Update local storage so other components see the change
        const uStr = localStorage.getItem("codm_user");
        if (uStr) {
          const u = JSON.parse(uStr);
          if (!u.savedPosts) u.savedPosts = [];
          if (data.saved && !u.savedPosts.includes(postId)) u.savedPosts.push(postId);
          else if (!data.saved) u.savedPosts = u.savedPosts.filter(id => id !== postId);
          localStorage.setItem("codm_user", JSON.stringify(u));
        }
      }
      else setSaved(prev);
    } catch {
      setSaved(prev);
    }
  }

  return (
    <button
      className={`save-btn ${saved ? "saved" : ""}`}
      onClick={handleSave}
      title={saved ? "Unsave" : "Save post"}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
