"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function MessagesParamsChild({ initialUserId }) {
  const router = useRouter();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]); 
  const [activeChatId, setActiveChatId] = useState(initialUserId || null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [text, setText] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem("codm_user");
    if (!u) { router.push("/"); return; }
    setCurrentUser(JSON.parse(u));

    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.filter(user => user.id !== JSON.parse(u).id));
        setLoadingUsers(false);
      });
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`/api/messages/unread?userId=${currentUser.id}`);
        const data = await res.json();
        const counts = {};
        if (Array.isArray(data)) {
          data.forEach(m => {
            counts[m.senderId] = (counts[m.senderId] || 0) + 1;
          });
        }
        setUnreadCounts(counts);
        
        // Refresh users to keep lastActive updated globally
        fetch("/api/users")
          .then(res => res.json())
          .then(userData => {
            setUsers(userData.filter(user => user.id !== currentUser.id));
          }).catch(console.error);

      } catch {}
    };
    fetchUnread();
    const iv = setInterval(fetchUnread, 3000);
    return () => clearInterval(iv);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && activeChatId) {
      setLoadingChat(true);

      const fetchActiveChat = async (silent = false) => {
        try {
          const res = await fetch(`/api/messages?userId=${currentUser.id}&otherUserId=${activeChatId}`);
          const data = await res.json();
          setMessages(prev => {
            if (prev.length !== data.length && silent) {
              setTimeout(scrollToBottom, 100);
            }
            return data;
          });
          if (!silent) setLoadingChat(false);

          // Fetch typing status
          const tRes = await fetch(`/api/typing?userId=${currentUser.id}&otherUserId=${activeChatId}`);
          const tData = await tRes.json();
          setOtherUserTyping(tData.typing);
        } catch {}
      };

      fetchActiveChat(false);
      const iv = setInterval(() => fetchActiveChat(true), 3000);
      return () => clearInterval(iv);

    } else {
      setMessages([]);
    }
  }, [currentUser, activeChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  useEffect(() => {
    if (!activeChatId || !currentUser) return;
    const sendTyping = async () => {
      if (text.trim().length > 0) {
        fetch("/api/typing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderId: currentUser.id, receiverId: activeChatId })
        }).catch(console.error);
      }
    };
    sendTyping();
  }, [text, activeChatId, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChatId || !currentUser) return;

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: currentUser.id, receiverId: activeChatId, text: text.trim() })
    });
    const newMsg = await res.json();
    setMessages(prev => [...prev, newMsg]);
    setText("");
  };

  const handleClearChat = async () => {
    setShowClearConfirm(false);
    await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, otherUserId: activeChatId })
    });
    setMessages([]);
  };

  const activeUser = users.find(u => u.id === activeChatId);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)", display: "flex", flexDirection: "column" }}>
      <div className="messages-container" style={{ flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", gap: "1rem", height: "calc(100vh - 64px)" }}>
        
        {/* Sidebar */}
        <div className={`glass-card messages-sidebar ${activeChatId ? 'hidden-on-mobile' : ''}`} style={{ width: 300, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
            <h2 style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, margin: 0 }}>Messages</h2>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
            {loadingUsers ? <div style={{ padding: "1rem", color: "var(--text-muted)", textAlign: "center" }}>Loading contacts...</div> : null}
            {!loadingUsers && users.map(u => (
              <div 
                key={u.id}
                onClick={() => setActiveChatId(u.id)}
                style={{ 
                  display: "flex", alignItems: "center", gap: "0.75rem", padding: "10px", 
                  borderRadius: "8px", cursor: "pointer",
                  background: activeChatId === u.id ? "var(--bg-surface)" : "transparent",
                  border: activeChatId === u.id ? "1px solid var(--ember)" : "1px solid transparent",
                  transition: "background 0.2s",
                  marginBottom: "4px"
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div className="avatar-circle-sm" style={{ width: 40, height: 40, fontSize: "1rem" }}>
                    {u.avatar ? <img src={u.avatar} alt={u.codmName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : u.codmName?.[0]?.toUpperCase()}
                  </div>
                  {u.lastActive && (Date.now() - u.lastActive < 300000) && (
                    <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, background: "#22c55e", borderRadius: "50%", border: "2px solid var(--bg-card)" }} />
                  )}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.codmName}</div>
                  <div style={{ fontSize: "0.72rem", color: u.lastActive && (Date.now() - u.lastActive < 300000) ? "#22c55e" : "var(--text-muted)" }}>
                    {u.lastActive && (Date.now() - u.lastActive < 300000)
                      ? "Active now"
                      : u.lastActive
                        ? `Last seen ${Math.floor((Date.now() - u.lastActive) / 60000)}m ago`
                        : u.rank
                    }
                  </div>
                </div>
                {unreadCounts[u.id] > 0 && (
                  <div style={{ background: "#ef4444", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: "10px" }}>
                    {unreadCounts[u.id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`glass-card messages-chat-area ${!activeChatId ? 'hidden-on-mobile' : ''}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          {activeUser ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button onClick={() => setActiveChatId(null)} className="btn-ghost mobile-back-btn" style={{ padding: "0.4rem", marginRight: "0.2rem" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <div className="avatar-circle-sm" style={{ width: 40, height: 40, fontSize: "1rem" }}>
                    {activeUser.avatar ? <img src={activeUser.avatar} alt={activeUser.codmName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : activeUser.codmName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-main)", lineHeight: 1.2 }}>{activeUser.codmName}</div>
                      {activeUser.lastActive && (Date.now() - activeUser.lastActive < 300000) && (
                        <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", title: "Active now" }} />
                      )}
                    </div>
                    {otherUserTyping ? (
                      <em style={{ fontSize: "0.8rem", color: "var(--ember)" }}>typing...</em>
                    ) : (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {activeUser.lastActive && (Date.now() - activeUser.lastActive >= 300000) 
                          ? `Last seen ${Math.floor((Date.now() - activeUser.lastActive)/60000)} mins ago` 
                          : <Link href={`/profile/${activeUser.id}`} style={{ color: "var(--ember)", textDecoration: "none" }}>View Profile</Link>
                        }
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowClearConfirm(true)} className="btn-ghost" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", color: "#ef4444", borderColor: "#ef444450" }}>
                  🗑️ Clear Chat
                </button>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--bg-deep)" }}>
                {loadingChat ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "auto", marginBottom: "auto" }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "auto", marginBottom: "auto" }}>
                    No messages yet. Say hi to {activeUser.codmName}!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderId === currentUser.id;
                    return (
                      <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                        <div style={{ 
                          background: isMine ? "linear-gradient(135deg, var(--ember), var(--ember-dark))" : "var(--bg-surface)",
                          color: isMine ? "#fff" : "var(--text-main)",
                          padding: "0.75rem 1rem", borderRadius: "16px",
                          borderBottomRightRadius: isMine ? "4px" : "16px",
                          borderBottomLeftRadius: isMine ? "16px" : "4px",
                          maxWidth: "70%", wordBreak: "break-word",
                          border: isMine ? "none" : "1px solid var(--border)"
                        }}>
                          {msg.text}
                          <div style={{ fontSize: "0.65rem", color: isMine ? "rgba(255,255,255,0.7)" : "var(--text-muted)", marginTop: "4px", textAlign: "right" }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {otherUserTyping && (
                  <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "4px" }}>
                    <div style={{ 
                      background: "var(--bg-surface)", color: "var(--text-muted)",
                      padding: "0.5rem 1rem", borderRadius: "16px",
                      borderBottomLeftRadius: "4px", fontSize: "0.85rem", fontStyle: "italic",
                      border: "1px solid var(--border)", animation: "pulse 1.5s infinite"
                    }}>
                      typing<span style={{letterSpacing: "2px"}}>...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
                <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem" }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Type a message..." 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    style={{ flex: 1, borderRadius: "24px", padding: "0.75rem 1.25rem" }}
                  />
                  <button type="submit" className="btn-ember" style={{ borderRadius: "24px", padding: "0 1.5rem" }} disabled={!text.trim()}>
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontSize: "3rem" }}>💬</div>
              <h2>Select a conversation</h2>
              <p>Choose a contact from the sidebar to start chatting.</p>
            </div>
          )}
        </div>

        {/* Custom Confirmation Modal */}
        {showClearConfirm && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div className="glass-card" style={{ background: "var(--bg-surface)", padding: "2rem", borderRadius: "16px", maxWidth: "400px", width: "90%", textAlign: "center", border: "1px solid var(--border)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--text-main)", fontSize: "1.2rem" }}>Clear Conversation?</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>
                Are you absolutely sure you want to delete this entire chat history? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <button onClick={() => setShowClearConfirm(false)} className="btn-ghost" style={{ padding: "0.6rem 1.5rem" }}>
                  Cancel
                </button>
                <button onClick={handleClearChat} className="btn-ember" style={{ padding: "0.6rem 1.5rem", background: "linear-gradient(135deg, #ef4444, #991b1b)" }}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("u");
  return <MessagesParamsChild initialUserId={initialUserId} />;
}

export default function Messages() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
