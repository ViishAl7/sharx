"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "../../lib/auth-session";
import {
  Avatar,
  SendIcon,
  BackIcon,
  RichText,
  SearchIcon,
  MailIcon,
  CheckIcon,
  CheckDoubleIcon,
  LoginIcon,
} from "./ui";
import { DM_MAX, clockTime, timeAgo, same } from "./api";

export default function DmPanel({
  socket,
  userId,
  isAuthenticated,
  onlineIds,
  peerRequest, // { id, name, username, ts } — open this peer (e.g. from "Message" on a post)
  onLogin,
  onRead, // tell the page to refresh the unread badge
  showToast,
}) {
  const [convos, setConvos] = useState([]);
  const [convosLoading, setConvosLoading] = useState(true);
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const peerRef = useRef(null);
  const typingTimer = useRef(null);
  const lastTypingEmit = useRef(0);
  const bottomRef = useRef(null);
  peerRef.current = peer;

  const loadConvos = useCallback(async () => {
    try {
      const data = await authFetch("/community/dm/conversations");
      setConvos(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      showToast(err.message || "Could not load messages.", "error");
    } finally {
      setConvosLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isAuthenticated) void loadConvos();
    else setConvosLoading(false);
  }, [isAuthenticated, loadConvos]);

  const openPeer = useCallback(
    async (p) => {
      setPeer(p);
      setSearch("");
      setResults([]);
      setPeerTyping(false);
      setMessages([]);
      setMsgLoading(true);
      try {
        const data = await authFetch(
          `/community/dm/${encodeURIComponent(p.id)}/messages?limit=50`
        );
        setMessages(Array.isArray(data.items) ? data.items : []);
        socket?.emit("dm:read", { withUserId: p.id });
        setConvos((prev) =>
          prev.map((c) => (same(c.peer.id, p.id) ? { ...c, unread: 0 } : c))
        );
        onRead?.();
      } catch (err) {
        showToast(err.message || "Could not open the chat.", "error");
      } finally {
        setMsgLoading(false);
      }
    },
    [socket, onRead, showToast]
  );

  // opened from outside (post menu → "Message")
  useEffect(() => {
    if (peerRequest?.id && isAuthenticated) void openPeer(peerRequest);
  }, [peerRequest, isAuthenticated, openPeer]);

  // user search (debounced)
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2 || !isAuthenticated) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const data = await authFetch(
          `/community/users/search?q=${encodeURIComponent(q)}`
        );
        setResults(Array.isArray(data.items) ? data.items : []);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [search, isAuthenticated]);

  // realtime
  useEffect(() => {
    if (!socket) return;

    const onMessage = (payload) => {
      const m = payload?.message;
      if (!m?.id) return;
      const mine = same(m.senderId, userId);
      const peerId = mine ? m.toUserId : m.senderId;
      const active = peerRef.current && same(peerRef.current.id, peerId);

      if (active) {
        setMessages((prev) => {
          if (prev.some((x) => same(x.id, m.id))) return prev;
          if (m.clientId && prev.some((x) => x.clientId === m.clientId))
            return prev.map((x) => (x.clientId === m.clientId ? m : x));
          return [...prev, m];
        });
        if (!mine) {
          socket.emit("dm:read", { withUserId: peerId });
          setPeerTyping(false);
        }
      }

      setConvos((prev) => {
        const known = prev.find((c) => same(c.peer.id, peerId));
        if (!known) {
          void loadConvos(); // brand new conversation: fetch the peer details
          return prev;
        }
        const updated = {
          ...known,
          lastMessage: {
            id: m.id,
            content: m.content,
            createdAt: m.createdAt,
            senderId: m.senderId,
          },
          unread: !mine && !active ? (known.unread || 0) + 1 : known.unread,
        };
        return [updated, ...prev.filter((c) => c !== known)];
      });
    };

    const onTyping = (p) => {
      if (!peerRef.current || !same(peerRef.current.id, p?.userId)) return;
      setPeerTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setPeerTyping(false), 3000);
    };

    const onSeen = (p) => {
      if (!peerRef.current || !same(peerRef.current.id, p?.byUserId)) return;
      setMessages((prev) =>
        prev.map((m) =>
          same(m.senderId, userId) && !m.readAt ? { ...m, readAt: p.at } : m
        )
      );
    };

    socket.on("dm:message", onMessage);
    socket.on("dm:typing", onTyping);
    socket.on("dm:read", onSeen);
    return () => {
      socket.off("dm:message", onMessage);
      socket.off("dm:typing", onTyping);
      socket.off("dm:read", onSeen);
      clearTimeout(typingTimer.current);
    };
  }, [socket, userId, loadConvos]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, peerTyping]);

  function send(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !peer) return;
    if (!socket) return showToast("Not connected yet.", "error");

    const clientId = `d_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setMessages((prev) => [
      ...prev,
      {
        id: clientId,
        clientId,
        senderId: userId,
        toUserId: peer.id,
        content: text,
        createdAt: new Date().toISOString(),
        readAt: null,
        pending: true,
      },
    ]);
    setDraft("");

    socket.timeout(8000).emit(
      "dm:send",
      { toUserId: peer.id, content: text, clientId },
      (err, res) => {
        if (err || res?.error) {
          setMessages((prev) => prev.filter((m) => m.clientId !== clientId));
          showToast(res?.error || "Message failed to send.", "error");
        }
      }
    );
  }

  function emitTyping() {
    const now = Date.now();
    if (!peer || now - lastTypingEmit.current < 1500) return;
    lastTypingEmit.current = now;
    socket?.emit("dm:typing", { toUserId: peer.id });
  }

  if (!isAuthenticated) {
    return (
      <div className="community-empty">
        <span className="empty-ico">
          <MailIcon />
        </span>
        <h3>Private messages</h3>
        <p>Log in to chat one-on-one with other players.</p>
        <button type="button" className="community-login-button" onClick={onLogin}>
          <LoginIcon /> Log in
        </button>
      </div>
    );
  }

  const lastOwnIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--)
      if (same(messages[i].senderId, userId)) return i;
    return -1;
  })();

  return (
    <div className={`community-dm ${peer ? "has-active" : ""}`}>
      {/* ── left: conversations + search ── */}
      <aside className="community-dm-list">
        <div className="community-dm-search-wrap">
          <SearchIcon />
          <input
            type="search"
            className="community-dm-search"
            placeholder="Find a player..."
            aria-label="Find a player"
            value={search}
            maxLength={30}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {results.length > 0 && (
          <div className="community-dm-results">
            {results.map((u) => (
              <button key={u.id} type="button" onClick={() => openPeer(u)}>
                <Avatar name={u.name} online={onlineIds.has(Number(u.id))} />
                <div>
                  <strong>{u.name}</strong>
                  <span>@{u.username}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="community-dm-convos">
          {convosLoading ? (
            <p className="community-muted center">Loading...</p>
          ) : convos.length === 0 ? (
            <p className="community-muted center">
              No chats yet. Search for a player to start one.
            </p>
          ) : (
            convos.map((c) => (
              <button
                key={c.peer.id}
                type="button"
                className={`community-dm-item ${
                  peer && same(peer.id, c.peer.id) ? "is-active" : ""
                }`}
                onClick={() => openPeer(c.peer)}
              >
                <Avatar name={c.peer.name} online={onlineIds.has(Number(c.peer.id))} />
                <div className="community-dm-item-text">
                  <strong>{c.peer.name}</strong>
                  <span>{c.lastMessage?.content}</span>
                </div>
                <div className="community-dm-item-meta">
                  <span>{timeAgo(c.lastMessage?.createdAt)}</span>
                  {c.unread > 0 && (
                    <i className="community-badge static">{c.unread > 9 ? "9+" : c.unread}</i>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── right: thread ── */}
      <section className="community-dm-thread">
        {!peer ? (
          <div className="community-dm-placeholder">
            <span className="ph-icon">
              <MailIcon />
            </span>
            <h3>Your messages</h3>
            <p>Pick a chat or search for a player.</p>
          </div>
        ) : (
          <>
            <header className="community-dm-head">
              <button
                type="button"
                className="community-icon-btn community-dm-back"
                onClick={() => setPeer(null)}
                aria-label="Back to chats"
              >
                <BackIcon />
              </button>
              <Avatar name={peer.name} online={onlineIds.has(Number(peer.id))} />
              <div>
                <strong>{peer.name}</strong>
                <span>
                  {onlineIds.has(Number(peer.id)) ? "Online" : "Offline"}
                  {peer.username ? ` · @${peer.username}` : ""}
                </span>
              </div>
            </header>

            <div className="community-chat-list" role="log" aria-live="polite">
              {msgLoading ? (
                <div className="community-state">
                  <div className="community-loader" />
                </div>
              ) : messages.length === 0 ? (
                <p className="community-muted center">Say hi 👋</p>
              ) : (
                messages.map((m, i) => {
                  const mine = same(m.senderId, userId);
                  return (
                    <div
                      key={m.id}
                      className={`community-bubble-row ${mine ? "is-mine" : ""} ${
                        m.pending ? "is-pending" : ""
                      }`}
                    >
                      <div className="community-bubble">
                        <RichText text={m.content} />
                        <span>
                          {m.pending ? "sending..." : clockTime(m.createdAt)}
                          {mine && !m.pending && i === lastOwnIndex && (
                            <em className="community-seen">
                              {m.readAt ? (
                                <>
                                  <CheckDoubleIcon /> Seen
                                </>
                              ) : (
                                <>
                                  <CheckIcon /> Sent
                                </>
                              )}
                            </em>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {peerTyping && (
                <div className="community-typing">
                  <span className="dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  {peer.name} is typing
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form className="community-chat-form" onSubmit={send}>
              <input
                type="text"
                value={draft}
                maxLength={DM_MAX}
                placeholder={`Message ${peer.name}...`}
                aria-label="Direct message"
                onChange={(e) => {
                  setDraft(e.target.value);
                  emitTyping();
                }}
              />
              <button type="submit" disabled={!draft.trim()} aria-label="Send message">
                <SendIcon />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
