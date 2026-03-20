"use client";
import { useState, useRef, useEffect } from "react";

// Sniper Target SVG icon
function TargetIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <circle cx="12" cy="12" r="1" fill={color} strokeWidth="0" />
    </svg>
  );
}

// Fire/muzzle flash SVG
function MuzzleFlash() {
  return (
    <svg className="fire-flash" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="10" cy="10" rx="8" ry="5" fill="#fbbf24" opacity="0.8"/>
      <ellipse cx="10" cy="10" rx="4" ry="2.5" fill="white"/>
      <path d="M16 7 L20 5 L17 10 L20 15 L16 13" fill="#f97316"/>
      <path d="M16 8 L18 6 L16.5 10 L18 14 L16 12" fill="#fbbf24"/>
    </svg>
  );
}

function playSniperSound() {
  try {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    const audioCtx = new AudioCtor();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    const bufferSize = audioCtx.sampleRate * 0.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    noiseSource.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
    noiseSource.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio playback failed:", e);
  }
}

export default function LikeButton({ postId, initialFires = 0, initialLikedBy = [], currentUserId }) {
  const [fires, setFires] = useState(initialFires);
  const [likedBy, setLikedBy] = useState(initialLikedBy);
  const [liked, setLiked] = useState(
    currentUserId ? initialLikedBy.some((l) => l.userId === currentUserId) : false
  );
  const [firing, setFiring] = useState(false);
  const [showWhoLiked, setShowWhoLiked] = useState(false);
  const popupRef = useRef(null);

  const isLiked = currentUserId ? likedBy.some((l) => l.userId === currentUserId) : liked;

  useEffect(() => {
    function handleClick(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowWhoLiked(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLike() {
    if (!currentUserId) return;
    
    // Check if we are LIKING (not unliking) to play the sound
    if (!isLiked) {
      playSniperSound();
    }
    
    setFiring(true);
    setTimeout(() => setFiring(false), 800);

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: currentUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setFires(data.fires);
        setLikedBy(data.likedBy);
        setLiked(data.liked);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4 }}>
      <div className="bullet-trail" />
      <button
        id={`like-btn-${postId}`}
        className={`gun-btn ${isLiked ? "liked" : ""} ${firing ? "firing" : ""}`}
        onClick={handleLike}
        title={currentUserId ? (isLiked ? "Unlike" : "Fire!") : "Login to like"}
      >
        <span className="gun-icon">
          <TargetIcon size={16} color={isLiked ? "var(--ember)" : "currentColor"} />
        </span>
        <span>{fires}</span>
        <MuzzleFlash />
      </button>

      {fires > 0 && (
        <button
          onClick={() => setShowWhoLiked((v) => !v)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: "0.75rem", padding: "0 4px",
            textDecoration: "underline dotted"
          }}
          title="See who fired"
        >
          {fires === 1 ? "1 fire" : `${fires} fires`}
        </button>
      )}

      {showWhoLiked && likedBy.length > 0 && (
        <div className="who-liked-popup" ref={popupRef}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>
            🔥 Fired by
          </p>
          {likedBy.map((l) => (
            <div key={l.userId} className="who-liked-item">
              <div className="who-liked-avatar">
                {l.avatar
                  ? <img src={l.avatar} alt={l.codmName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : l.codmName?.[0]?.toUpperCase()
                }
              </div>
              <span style={{ color: "var(--text-main)", fontSize: "0.8rem", fontWeight: 600 }}>{l.codmName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
