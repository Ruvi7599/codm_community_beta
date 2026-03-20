"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImgBase64 } from "@/lib/cropImage";
import { useRouter } from "next/navigation";

const MAX_CHARS = 500;

export default function CreatePostPage() {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const fileRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("codm_user");
    if (!stored) { router.push("/"); return; }
    setUser(JSON.parse(stored));
  }, []);

  function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Image must be under 3MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  async function applyCrop() {
    try {
      const croppedBase64 = await getCroppedImgBase64(imagePreview, croppedAreaPixels);
      setImageBase64(croppedBase64);
      setImagePreview(croppedBase64); // Replace preview with cropped image
      setShowCropper(false);
    } catch (err) {
      console.error(err);
      setError("Failed to crop image.");
      setShowCropper(false);
    }
  }

  function removeImage() {
    setImageBase64(null);
    setImagePreview(null);
    setShowCropper(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) { setError("Post content cannot be empty"); return; }
    setError(""); setLoading(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        content: content.trim(),
        imageUrl: imageBase64 || null,
      }),
    });

    setLoading(false);
    if (!res.ok) { setError("Failed to post"); return; }
    router.push("/feed");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)", position: showCropper ? "fixed" : "static", width: "100%" }}>

      {showCropper && imagePreview && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "#0a0c10", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "relative", flex: 1, background: "#000" }}>
            <Cropper
              image={imagePreview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div style={{ padding: "1.5rem", background: "var(--bg-card)", display: "flex", gap: "1rem", borderTop: "1px solid var(--border)" }}>
            <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={removeImage}>Cancel</button>
            <button type="button" className="btn-ember" style={{ flex: 1 }} onClick={applyCrop}>Apply Crop</button>
          </div>
        </div>
      )}

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "1.75rem 1.25rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: "1.6rem",
              background: "linear-gradient(135deg, #f97316, #fbbf24)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Create Post
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.825rem", marginTop: "0.25rem" }}>
            Share your CODM moments with the Sri Lanka community
          </p>
        </div>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          {error && (
            <div
              style={{
                background: "#7f1d1d30", border: "1px solid #ef444450",
                borderRadius: "8px", padding: "0.625rem 0.875rem",
                color: "#fca5a5", fontSize: "0.875rem", marginBottom: "1.25rem",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* User preview */}
            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div
                  style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #f97316, #fbbf24)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.875rem", fontWeight: 700, color: "#0a0c10",
                    fontFamily: "'Rajdhani', sans-serif", flexShrink: 0,
                  }}
                >
                  {user.codmName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>
                    {user.codmName}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{user.rank}</div>
                </div>
              </div>
            )}

            {/* Content */}
            <div>
              <textarea
                className="input-field"
                placeholder="What's happening in CODM? Share your gameplay, squad highlights, tips..."
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                rows={5}
                style={{ resize: "vertical", minHeight: "120px", paddingTop: "0.75rem" }}
                id="post-content"
              />
              <div
                style={{
                  textAlign: "right", fontSize: "0.72rem", marginTop: "0.25rem",
                  color: content.length >= MAX_CHARS * 0.9 ? "#f97316" : "var(--text-muted)",
                }}
              >
                {content.length}/{MAX_CHARS}
              </div>
            </div>

            {/* Image upload */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => fileRef.current?.click()}
                  style={{ fontSize: "0.825rem" }}
                >
                  📷 Add Image
                </button>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>max 3MB</span>
              </div>
              <input
                ref={fileRef} type="file" accept="image/*"
                style={{ display: "none" }}
                onChange={handleImage}
                id="post-image"
              />

              {imagePreview && (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={imagePreview} alt="Preview"
                    style={{
                      maxWidth: "100%", maxHeight: "280px", objectFit: "cover",
                      borderRadius: "8px", border: "1px solid var(--border)", display: "block",
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{
                      position: "absolute", top: "6px", right: "6px",
                      background: "#0a0c10cc", border: "1px solid #3a3d4a",
                      borderRadius: "50%", width: "26px", height: "26px",
                      color: "#e2e8f0", cursor: "pointer", fontSize: "0.75rem",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => router.push("/feed")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-ember"
                disabled={loading}
                style={{ flex: 1, justifyContent: "center" }}
                id="post-submit"
              >
                {loading ? "Posting..." : "Post 🔥"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
