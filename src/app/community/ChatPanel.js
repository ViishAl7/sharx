"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, SendIcon, RichText, ChatIcon } from "./ui";
import { CHAT_MAX, CHAT_COOLDOWN_MS, clockTime, same } from "./api";

export default function ChatPanel({
  messages,
  loading,
  userId,
  isAuthenticated,
  isAdmin,
  connected,
  typingNames,
  onlineIds,
  onSend,
  onTyping,
  onDeleteMessage,
  onLogin,
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);
  const lastSent = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typingNames.length]);

  function submit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (!isAuthenticated) return onLogin();
    const now = Date.now();
    if (now - lastSent.current < CHAT_COOLDOWN_MS) return;
    lastSent.current = now;
    onSend(text);
    setDraft("");
  }

  return (
    <div className="community-chat">
      <div className="community-chat-status">
        <span className={`dot ${connected ? "on" : ""}`} />
        {connected ? "Live · everyone in the player zone can see this" : "Reconnecting..."}
      </div>

      <div className="community-chat-list" role="log" aria-live="polite">
        {loading ? (
          <div className="community-state">
            <div className="community-loader" />
          </div>
        ) : messages.length === 0 ? (
          <div className="community-empty" style={{ border: 0, background: "transparent" }}>
            <span className="empty-ico">
              <ChatIcon />
            </span>
            <h3>No messages yet</h3>
            <p>Say hi and get the party started 👋</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine =
              userId != null && m.author?.id != null && same(userId, m.author.id);
            const canDelete = (mine || isAdmin) && !m.pending;
            return (
              <div
                key={m.id}
                className={`community-bubble-row ${mine ? "is-mine" : ""} ${
                  m.pending ? "is-pending" : ""
                }`}
              >
                {!mine && (
                  <Avatar
                    name={m.author?.name}
                    online={onlineIds ? onlineIds.has(Number(m.author?.id)) : undefined}
                  />
                )}
                <div className="community-bubble">
                  {!mine && <strong>{m.author?.name || "SHARX Player"}</strong>}
                  <RichText text={m.content} />
                  <span>
                    {m.pending ? "sending..." : clockTime(m.createdAt)}
                    {canDelete && (
                      <button
                        type="button"
                        className="community-bubble-del"
                        onClick={() => onDeleteMessage(m)}
                        aria-label="Delete message"
                      >
                        {mine ? "delete" : "remove"}
                      </button>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {typingNames.length > 0 && (
          <div className="community-typing">
            <span className="dots">
              <i />
              <i />
              <i />
            </span>
            {typingNames.slice(0, 2).join(", ")}
            {typingNames.length > 2 ? " & others" : ""} typing
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="community-chat-form" onSubmit={submit}>
        <input
          type="text"
          value={draft}
          maxLength={CHAT_MAX}
          placeholder={isAuthenticated ? "Message the player zone..." : "Log in to chat"}
          aria-label="Chat message"
          onChange={(e) => {
            setDraft(e.target.value);
            if (isAuthenticated) onTyping();
          }}
        />
        <button type="submit" disabled={!draft.trim() || !isAuthenticated} aria-label="Send message">
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
