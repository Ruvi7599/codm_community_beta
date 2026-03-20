"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropUtils";

const RANKS = ["Rookie", "Veteran", "Elite", "Pro", "Master", "Grandmaster", "Legendary"];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("profile"); // profile | password
  const [form, setForm] = useState({ name: "", codmName: "", codmId: "", rank: "Rookie", level: "", gender: "Male", bio: "", socialLinks: { facebook: "", whatsapp: "", youtube: "", discord: "", instagram: "", tiktok: "" } });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  // Password
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("codm_user");
    if (!u) { router.push("/"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    setForm({
      name: parsed.name || "",
      codmName: parsed.codmName || "",
      codmId: parsed.codmId || "",
      rank: parsed.rank || "Rookie",
      level: parsed.level || "",
      gender: parsed.gender || "Male",
      bio: parsed.bio || "",
      socialLinks: { facebook: "", whatsapp: "", youtube: "", discord: "", instagram: "", tiktok: "", ...(parsed.socialLinks || {}) }
    });
    setAvatarPreview(parsed.avatar || null);
  }, []);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setMsg({ type: "error", text: "Image too large (max 3MB)" }); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTempImage(ev.target.result);
      setShowCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const applyCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
      setAvatarPreview(croppedImage);
      setShowCropper(false);
      setTempImage(null);
    } catch (e) {
      console.error(e);
      setMsg({ type: "error", text: "Failed to crop image" });
      setShowCropper(false);
    }
  };

  async function saveProfile(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`/api/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, avatar: avatarPreview }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...user, ...data.user };
        localStorage.setItem("codm_user", JSON.stringify(updated));
        setUser(updated);
        setMsg({ type: "success", text: "Profile saved!" });
      } else {
        setMsg({ type: "error", text: data.error || "Failed" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (!user) return;
    if (pwForm.newPassword !== pwForm.confirm) { setPwMsg({ type: "error", text: "Passwords don't match" }); return; }
    if (pwForm.newPassword.length < 6) { setPwMsg({ type: "error", text: "Password too short (min 6 chars)" }); return; }
    setSaving(true); setPwMsg(null);
    try {
      const res = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPwMsg({ type: "success", text: "Password changed!" });
        setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      } else {
        setPwMsg({ type: "error", text: data.error || "Failed" });
      }
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <>
      {showCropper && tempImage && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", flexDirection: "column"
        }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Cropper
              image={tempImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div style={{ padding: "1rem", background: "var(--bg-deep)", display: "flex", gap: "1rem", justifyContent: "center", borderTop: "1px solid var(--border)" }}>
            <button type="button" className="btn-ghost" onClick={() => setShowCropper(false)}>Cancel</button>
            <button type="button" className="btn-ember" onClick={applyCrop}>Apply Crop</button>
          </div>
        </div>
      )}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
        <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.75rem", fontWeight: 700, marginBottom: "1.5rem" }}>
          ⚙️ Settings
        </h1>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
          <button className={`settings-tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>Profile</button>
          <button className={`settings-tab ${tab === "password" ? "active" : ""}`} onClick={() => setTab("password")}>Password</button>
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <form onSubmit={saveProfile}>
            <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "1.5rem" }}>
                <label className="avatar-upload-wrap" style={{ cursor: "pointer" }}>
                  <div className="avatar-circle" style={{ width: 80, height: 80, fontSize: "2rem" }}>
                    {avatarPreview
                      ? <img src={avatarPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : (user.codmName?.[0]?.toUpperCase())
                    }
                  </div>
                  <div className="avatar-upload-overlay">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4" fill="none" stroke="white" strokeWidth="2"/>
                    </svg>
                  </div>
                  <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                </label>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-main)" }}>{user.codmName}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Click photo to change</p>
                  {avatarPreview && (
                    <button type="button" onClick={() => setAvatarPreview(null)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer", marginTop: 4 }}>
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              {/* Basic fields */}
              <div style={{ display: "grid", gap: "1rem" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>NAME</span>
                    <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>CODM Name</span>
                    <input className="input-field" value={form.codmName} onChange={e => setForm(f => ({ ...f, codmName: e.target.value }))} />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>CODM ID</span>
                    <input className="input-field" value={form.codmId} onChange={e => setForm(f => ({ ...f, codmId: e.target.value }))} />
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>LEVEL</span>
                    <input className="input-field" type="number" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>RANK</span>
                    <select className="input-field" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))}>
                      {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>GENDER</span>
                    <select className="input-field" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </label>
                </div>
                <label style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>BIO</span>
                  <textarea className="input-field" rows={2} maxLength={150} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell the squad about yourself..." />
                </label>
              </div>
            </div>

            {/* Social Links */}
            <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
              <h3 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--ember)" }}>Social Links</h3>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {[
                  { key: "facebook", label: "Facebook", placeholder: "URL or username" },
                  { key: "whatsapp", label: "WhatsApp", placeholder: "+94XXXXXXXXX" },
                  { key: "youtube", label: "YouTube", placeholder: "@channel or URL" },
                  { key: "discord", label: "Discord", placeholder: "username#0000" },
                  { key: "instagram", label: "Instagram", placeholder: "@username" },
                  { key: "tiktok", label: "TikTok", placeholder: "@username" },
                ].map(({ key, label, placeholder }) => (
                  <label key={key} style={{ display: "grid", gridTemplateColumns: "100px 1fr", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                    <input className="input-field" placeholder={placeholder} value={form.socialLinks[key]} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [key]: e.target.value } }))} />
                  </label>
                ))}
              </div>
            </div>

            {msg && (
              <p style={{ color: msg.type === "success" ? "#4ade80" : "#f87171", marginBottom: "0.75rem", fontSize: "0.9rem" }}>{msg.text}</p>
            )}
            <button type="submit" className="btn-ember" disabled={saving} style={{ width: "100%" }}>
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {tab === "password" && (
          <form onSubmit={savePassword}>
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gap: "1rem" }}>
                {[
                  { key: "currentPassword", label: "Current Password" },
                  { key: "newPassword", label: "New Password" },
                  { key: "confirm", label: "Confirm New Password" },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: "grid", gap: 4 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>{label.toUpperCase()}</span>
                    <input className="input-field" type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
                  </label>
                ))}
              </div>
              {pwMsg && (
                <p style={{ color: pwMsg.type === "success" ? "#4ade80" : "#f87171", marginTop: "0.75rem", fontSize: "0.9rem" }}>{pwMsg.text}</p>
              )}
              <button type="submit" className="btn-ember" disabled={saving} style={{ width: "100%", marginTop: "1rem" }}>
                {saving ? "Changing…" : "Change Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
