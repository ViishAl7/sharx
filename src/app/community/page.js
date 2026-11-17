"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { API_BASE } from "../../config";
import { authFetch, currentUserId, readToken } from "../../lib/auth-session";
import { useAuth } from "../../context/AuthContext";
import {
  PAGE_SIZE,
  POST_MAX,
  MEDIA_RULES,
  publicRequest,
  uploadMedia,
  normalizePost,
  withReaction,
  same,
} from "./api";
import {
  Avatar,
  SunIcon,
  MoonIcon,
  MailIcon,
  UserIcon,
  ImageIcon,
  CloseIcon,
  GamepadIcon,
  LoginIcon,
  SendIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  SparkIcon,
  CheckIcon,
  ChatIcon,
  BackIcon,
} from "./ui";
import CommunityPost from "./Post";
import ChatPanel from "./ChatPanel";
import DmPanel from "./DmPanel";
import NotificationBell from "./NotificationBell";
import "./community.css";

const THEME_KEY = "sharx-theme";
// Put your own logo path here (file inside /public)
const LOGO_SRC = "/sharx-logo.webp";

export default function CommunityPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const userId = currentUserId();
  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user?.isAdmin);

  const [theme, setTheme] = useState("light");
  const [tab, setTab] = useState("feed");
  const [toast, setToast] = useState(null);

  /* feed */
  const [posts, setPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [content, setContent] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* media upload */
  const [media, setMedia] = useState(null); // { url, mediaType, preview }
  const [uploadPct, setUploadPct] = useState(null);
  const fileRef = useRef(null);

  /* comments */
  const [openComments, setOpenComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  /* chat + presence */
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineIds, setOnlineIds] = useState(() => new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [socket, setSocket] = useState(null);

  /* notifications + dm badge */
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [dmUnread, setDmUnread] = useState(0);
  const [peerRequest, setPeerRequest] = useState(null);

  const typingTimers = useRef({});
  const lastTypingEmit = useRef(0);
  const toastTimer = useRef(null);
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  /* ───────── theme ───────── */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") setTheme(saved);
      else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches)
        setTheme("dark");
    } catch {}
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }

  /* ───────── toast / login ───────── */

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const login = useCallback(() => router.push("/login?next=%2Fcommunity"), [router]);
  const requireLogin = useCallback(() => {
    if (!isAuthenticated) {
      login();
      return false;
    }
    return true;
  }, [isAuthenticated, login]);

  /* ───────── feed ───────── */

  const loadFeed = useCallback(
    async (cursor = null) => {
      if (cursor) setLoadingMore(true);
      else setLoading(true);
      try {
        const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
        if (cursor) query.set("cursor", cursor);
        const path = `/community/feed?${query.toString()}`;
        const data = isAuthenticated ? await authFetch(path) : await publicRequest(path);
        const incoming = (Array.isArray(data.items) ? data.items : []).map(normalizePost);
        setPosts((prev) => {
          if (!cursor) return incoming;
          const ids = new Set(prev.map((p) => String(p.id)));
          return [...prev, ...incoming.filter((p) => !ids.has(String(p.id)))];
        });
        setNextCursor(data.nextCursor || null);
      } catch (err) {
        showToast(err.message || "Could not load the feed.", "error");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isAuthenticated, showToast]
  );

  useEffect(() => {
    if (authLoading) return;
    void loadFeed();
  }, [loadFeed, authLoading]);

  /* chat history (once, when the tab is first opened) */
  const chatLoaded = useRef(false);
  useEffect(() => {
    if (tab !== "chat" || chatLoaded.current) return;
    chatLoaded.current = true;
    publicRequest("/community/chat?limit=50")
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setChatMessages(items);
      })
      .catch((err) => {
        chatLoaded.current = false;
        showToast(err.message || "Could not load chat.", "error");
      })
      .finally(() => setChatLoading(false));
  }, [tab, showToast]);

  /* notifications + unread DMs (on login) */
  const refreshDmUnread = useCallback(async () => {
    try {
      const d = await authFetch("/community/dm/unread");
      setDmUnread(Number(d.count) || 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifs([]);
      setUnread(0);
      setDmUnread(0);
      return;
    }
    authFetch("/community/notifications")
      .then((d) => {
        setNotifs(Array.isArray(d.items) ? d.items : []);
        setUnread(Number(d.unread) || 0);
      })
      .catch(() => {});
    void refreshDmUnread();
  }, [isAuthenticated, refreshDmUnread]);

  /* ───────── socket ───────── */

  useEffect(() => {
    const s = io(API_BASE, {
      auth: { token: readToken() || undefined },
      transports: ["websocket", "polling"],
      reconnectionDelayMax: 8000,
    });
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
    });
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", () => setConnected(false));

    s.on("community:online", (p) => {
      if (typeof p?.count === "number") setOnlineCount(p.count);
    });
    s.on("presence:list", (p) => {
      if (Array.isArray(p?.ids)) setOnlineIds(new Set(p.ids.map(Number)));
    });
    s.on("presence:update", (p) => {
      if (p?.userId == null) return;
      setOnlineIds((prev) => {
        const next = new Set(prev);
        if (p.online) next.add(Number(p.userId));
        else next.delete(Number(p.userId));
        return next;
      });
    });

    /* posts */
    s.on("community:post_created", (p) => {
      const incoming = p?.post && normalizePost({ ...p.post, myReaction: null });
      if (!incoming?.id) return;
      const mine =
        userIdRef.current != null &&
        incoming.author?.id != null &&
        same(userIdRef.current, incoming.author.id);

      if (mine) {
        setPosts((prev) =>
          prev.some((x) => same(x.id, incoming.id)) ? prev : [incoming, ...prev]
        );
      } else {
        setPendingPosts((prev) =>
          prev.some((x) => same(x.id, incoming.id)) ? prev : [incoming, ...prev]
        );
      }
    });

    s.on("community:post_updated", (p) => {
      const u = p?.post;
      if (!u?.id) return;
      setPosts((prev) =>
        prev.map((x) =>
          same(x.id, u.id)
            ? { ...x, content: u.content, editedAt: u.editedAt || new Date().toISOString() }
            : x
        )
      );
    });

    s.on("community:post_deleted", (p) => {
      if (p?.postId == null) return;
      const id = String(p.postId);
      setPosts((prev) => prev.filter((x) => !same(x.id, id)));
      setPendingPosts((prev) => prev.filter((x) => !same(x.id, id)));
      setOpenComments((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setCommentsByPost((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    });

    // counts come from the server; MY reaction stays whatever I have locally
    s.on("community:reactions_updated", (p) => {
      if (p?.postId == null || !p.reactions) return;
      setPosts((prev) =>
        prev.map((x) =>
          same(x.id, p.postId)
            ? {
                ...x,
                reactions: p.reactions,
                likeCount:
                  typeof p.likeCount === "number"
                    ? p.likeCount
                    : Object.values(p.reactions).reduce((a, b) => a + b, 0),
              }
            : x
        )
      );
    });

    /* comments */
    s.on("community:comment_created", (p) => {
      if (p?.postId == null || !p.comment?.id) return;
      if (typeof p.commentCount === "number") {
        setPosts((prev) =>
          prev.map((x) =>
            same(x.id, p.postId) ? { ...x, commentCount: p.commentCount } : x
          )
        );
      }
      setCommentsByPost((prev) => {
        const key = String(p.postId);
        if (!(key in prev)) return prev;
        if (prev[key].some((c) => same(c.id, p.comment.id))) return prev;
        return { ...prev, [key]: [...prev[key], p.comment] };
      });
    });

    s.on("community:comment_updated", (p) => {
      if (p?.postId == null || !p.comment?.id) return;
      setCommentsByPost((prev) => {
        const key = String(p.postId);
        if (!(key in prev)) return prev;
        return {
          ...prev,
          [key]: prev[key].map((c) =>
            same(c.id, p.comment.id) ? { ...c, ...p.comment } : c
          ),
        };
      });
    });

    s.on("community:comment_deleted", (p) => {
      if (p?.postId == null || p.commentId == null) return;
      if (typeof p.commentCount === "number") {
        setPosts((prev) =>
          prev.map((x) =>
            same(x.id, p.postId) ? { ...x, commentCount: p.commentCount } : x
          )
        );
      }
      setCommentsByPost((prev) => {
        const key = String(p.postId);
        if (!(key in prev)) return prev;
        return { ...prev, [key]: prev[key].filter((c) => !same(c.id, p.commentId)) };
      });
    });

    /* chat */
    s.on("chat:message", (p) => {
      const m = p?.message;
      if (!m?.id) return;
      setChatMessages((prev) => {
        if (prev.some((x) => same(x.id, m.id))) return prev;
        if (m.clientId && prev.some((x) => x.clientId === m.clientId))
          return prev.map((x) => (x.clientId === m.clientId ? m : x));
        return [...prev.slice(-199), m];
      });
    });

    s.on("chat:message_deleted", (p) => {
      if (p?.messageId == null) return;
      setChatMessages((prev) => prev.filter((x) => !same(x.id, p.messageId)));
    });

    s.on("chat:typing", (p) => {
      if (!p?.userId || same(p.userId, userIdRef.current)) return;
      const id = String(p.userId);
      setTypingUsers((prev) => ({ ...prev, [id]: p.name || "Someone" }));
      clearTimeout(typingTimers.current[id]);
      typingTimers.current[id] = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 3000);
    });

    /* notifications + DMs */
    s.on("notification:new", (p) => {
      const n = p?.notification;
      if (!n?.id) return;
      setNotifs((prev) => [n, ...prev.filter((x) => !same(x.id, n.id))].slice(0, 30));
      setUnread((c) => c + 1);
    });

    s.on("dm:message", (p) => {
      const m = p?.message;
      if (!m || same(m.senderId, userIdRef.current)) return;
      if (tabRef.current !== "dm") setDmUnread((c) => c + 1);
    });

    s.on("rate_limited", () => showToast("Slow down a bit, too many actions.", "error"));

    const timers = typingTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [isAuthenticated, showToast]);

  /* ───────── post actions ───────── */

  async function pickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !requireLogin()) return;

    const limit = MEDIA_RULES[file.type];
    if (!limit) return showToast("Only JPG, PNG, WEBP, GIF, MP4 or WEBM files.", "error");
    if (file.size > limit * 1024 * 1024)
      return showToast(`File too large (max ${limit}MB).`, "error");

    const preview = URL.createObjectURL(file);
    setUploadPct(0);
    try {
      const data = await uploadMedia(file, setUploadPct);
      setMedia({ url: data.url, mediaType: data.mediaType, preview });
    } catch (err) {
      URL.revokeObjectURL(preview);
      showToast(err.message || "Upload failed.", "error");
    } finally {
      setUploadPct(null);
    }
  }

  function removeMedia() {
    if (media?.preview) URL.revokeObjectURL(media.preview);
    setMedia(null);
  }

  async function createPost(event) {
    event.preventDefault();
    const text = content.trim();
    if ((!text && !media) || submitting || uploadPct !== null || !requireLogin()) return;

    setSubmitting(true);
    try {
      const data = await authFetch("/community/posts", {
        method: "POST",
        body: JSON.stringify({ content: text, mediaUrl: media?.url || null }),
      });
      if (data.post) {
        const post = normalizePost(data.post);
        setPosts((prev) => [post, ...prev.filter((p) => !same(p.id, post.id))]);
      }
      setContent("");
      removeMedia();
      showToast("Your post is live 🚀");
    } catch (err) {
      showToast(err.message || "Could not publish your post.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function reactToPost(post, emoji) {
    if (!requireLogin() || actionLoading[post.id]) return;

    const removing = post.myReaction === emoji;
    const target = removing ? null : emoji;
    const snapshot = post;

    // optimistic
    setPosts((prev) => prev.map((x) => (same(x.id, post.id) ? withReaction(x, target) : x)));
    setActionLoading((p) => ({ ...p, [post.id]: true }));

    try {
      const data = await authFetch(`/community/posts/${encodeURIComponent(post.id)}/react`, {
        method: "PUT",
        body: JSON.stringify({ emoji: target }),
      });
      setPosts((prev) =>
        prev.map((x) =>
          same(x.id, post.id)
            ? {
                ...x,
                myReaction: data.myReaction ?? null,
                reactions: data.reactions || x.reactions,
                likeCount:
                  typeof data.likeCount === "number" ? data.likeCount : x.likeCount,
              }
            : x
        )
      );
    } catch (err) {
      setPosts((prev) => prev.map((x) => (same(x.id, post.id) ? snapshot : x))); // rollback
      showToast(err.message || "Could not update your reaction.", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [post.id]: false }));
    }
  }

  async function editPost(post, text) {
    try {
      const data = await authFetch(`/community/posts/${encodeURIComponent(post.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ content: text }),
      });
      setPosts((prev) =>
        prev.map((x) =>
          same(x.id, post.id)
            ? {
                ...x,
                content: data.post?.content ?? text,
                editedAt: data.post?.editedAt || new Date().toISOString(),
              }
            : x
        )
      );
      showToast("Post updated.");
    } catch (err) {
      showToast(err.message || "Could not edit the post.", "error");
      throw err;
    }
  }

  async function deletePost(post) {
    if (!requireLogin() || actionLoading[post.id]) return;
    if (!window.confirm("Delete this post? This action cannot be undone.")) return;

    setActionLoading((p) => ({ ...p, [post.id]: true }));
    try {
      await authFetch(`/community/posts/${encodeURIComponent(post.id)}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((x) => !same(x.id, post.id)));
      showToast("Post deleted.");
    } catch (err) {
      showToast(err.message || "Could not delete the post.", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [post.id]: false }));
    }
  }

  async function reportPost(post) {
    if (!requireLogin()) return;
    if (!window.confirm("Report this post to the moderators?")) return;
    try {
      await authFetch(`/community/posts/${encodeURIComponent(post.id)}/report`, {
        method: "POST",
        body: JSON.stringify({ reason: "user_report" }),
      });
      showToast("Thanks, we'll review it.");
    } catch (err) {
      showToast(err.message || "Could not send the report.", "error");
    }
  }

  async function muteUser(author, minutes) {
    if (!window.confirm(`Mute ${author.name} for ${minutes} minutes?`)) return;
    try {
      await authFetch(`/community/admin/users/${encodeURIComponent(author.id)}/mute`, {
        method: "PUT",
        body: JSON.stringify({ minutes }),
      });
      showToast(`${author.name} muted.`);
    } catch (err) {
      showToast(err.message || "Could not mute the user.", "error");
    }
  }

  async function banUser(author) {
    if (!window.confirm(`Ban ${author.name} permanently? They will be disconnected.`)) return;
    try {
      await authFetch(`/community/admin/users/${encodeURIComponent(author.id)}/ban`, {
        method: "PUT",
        body: JSON.stringify({ minutes: null }),
      });
      showToast(`${author.name} banned.`);
    } catch (err) {
      showToast(err.message || "Could not ban the user.", "error");
    }
  }

  function showPending() {
    setPosts((prev) => {
      const ids = new Set(prev.map((p) => String(p.id)));
      return [...pendingPosts.filter((p) => !ids.has(String(p.id))), ...prev];
    });
    setPendingPosts([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ───────── comment actions ───────── */

  async function toggleComments(post) {
    const id = post.id;
    const willOpen = !openComments[id];
    setOpenComments((p) => ({ ...p, [id]: willOpen }));
    if (!willOpen || commentsByPost[id]) return;

    setCommentsLoading((p) => ({ ...p, [id]: true }));
    try {
      const data = await publicRequest(
        `/community/posts/${encodeURIComponent(id)}/comments?limit=25`
      );
      setCommentsByPost((p) => ({ ...p, [id]: Array.isArray(data.items) ? data.items : [] }));
    } catch (err) {
      showToast(err.message || "Could not load comments.", "error");
      setCommentsByPost((p) => ({ ...p, [id]: [] }));
    } finally {
      setCommentsLoading((p) => ({ ...p, [id]: false }));
    }
  }

  const updateCommentDraft = (postId, value) =>
    setCommentDrafts((p) => ({ ...p, [postId]: value }));

  async function submitComment(post) {
    const id = post.id;
    const text = (commentDrafts[id] || "").trim();
    if (!text || commentSubmitting[id] || !requireLogin()) return;

    setCommentSubmitting((p) => ({ ...p, [id]: true }));
    try {
      const data = await authFetch(`/community/posts/${encodeURIComponent(id)}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: text }),
      });
      if (data.comment) {
        setCommentsByPost((p) => {
          const cur = p[id] || [];
          if (cur.some((c) => same(c.id, data.comment.id))) return p;
          return { ...p, [id]: [...cur, data.comment] };
        });
        setPosts((prev) =>
          prev.map((x) =>
            same(x.id, id)
              ? {
                  ...x,
                  commentCount:
                    typeof data.commentCount === "number"
                      ? data.commentCount
                      : (x.commentCount || 0) + 1,
                }
              : x
          )
        );
      }
      setCommentDrafts((p) => ({ ...p, [id]: "" }));
    } catch (err) {
      showToast(err.message || "Could not publish your comment.", "error");
    } finally {
      setCommentSubmitting((p) => ({ ...p, [id]: false }));
    }
  }

  async function editComment(post, comment, text) {
    try {
      const data = await authFetch(
        `/community/posts/${encodeURIComponent(post.id)}/comments/${encodeURIComponent(comment.id)}`,
        { method: "PATCH", body: JSON.stringify({ content: text }) }
      );
      setCommentsByPost((p) => ({
        ...p,
        [post.id]: (p[post.id] || []).map((c) =>
          same(c.id, comment.id)
            ? {
                ...c,
                content: data.comment?.content ?? text,
                editedAt: data.comment?.editedAt || new Date().toISOString(),
              }
            : c
        ),
      }));
    } catch (err) {
      showToast(err.message || "Could not edit the comment.", "error");
      throw err;
    }
  }

  async function deleteComment(post, comment) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const data = await authFetch(
        `/community/posts/${encodeURIComponent(post.id)}/comments/${encodeURIComponent(comment.id)}`,
        { method: "DELETE" }
      );
      setCommentsByPost((p) => ({
        ...p,
        [post.id]: (p[post.id] || []).filter((c) => !same(c.id, comment.id)),
      }));
      setPosts((prev) =>
        prev.map((x) =>
          same(x.id, post.id)
            ? {
                ...x,
                commentCount:
                  typeof data.commentCount === "number"
                    ? data.commentCount
                    : Math.max(0, (x.commentCount || 1) - 1),
              }
            : x
        )
      );
    } catch (err) {
      showToast(err.message || "Could not delete the comment.", "error");
    }
  }

  /* ───────── chat actions ───────── */

  function sendChat(text) {
    if (!socket) return showToast("Not connected yet.", "error");
    const clientId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setChatMessages((prev) => [
      ...prev,
      {
        id: clientId,
        clientId,
        content: text,
        createdAt: new Date().toISOString(),
        author: { id: userId, name: user?.name || user?.username || "You" },
        pending: true,
      },
    ]);
    socket.timeout(8000).emit("chat:send", { content: text, clientId }, (err, res) => {
      if (err || res?.error) {
        setChatMessages((prev) => prev.filter((m) => m.clientId !== clientId));
        showToast(res?.error || "Message failed to send.", "error");
      }
    });
  }

  function emitTyping() {
    const now = Date.now();
    if (now - lastTypingEmit.current < 1500) return;
    lastTypingEmit.current = now;
    socket?.emit("chat:typing");
  }

  function deleteChatMessage(message) {
    socket?.timeout(8000).emit("chat:delete", { messageId: message.id }, (err, res) => {
      if (err || res?.error) showToast(res?.error || "Could not delete message.", "error");
      else setChatMessages((prev) => prev.filter((m) => !same(m.id, message.id)));
    });
  }

  /* ───────── notifications / dm entry points ───────── */

  async function markNotifsRead() {
    setUnread(0);
    setNotifs((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    try {
      await authFetch("/community/notifications/read", { method: "PUT" });
    } catch {}
  }

  function openNotification(n) {
    setTab("feed");
    if (n.postId != null) {
      // make sure the post is visible: if it isn't loaded yet, refresh the feed
      if (!posts.some((p) => same(p.id, n.postId))) void loadFeed();
      requestAnimationFrame(() =>
        document
          .getElementById(`post-${n.postId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      );
    }
  }

  function messageAuthor(author) {
    if (!requireLogin()) return;
    setPeerRequest({ ...author, ts: Date.now() });
    setTab("dm");
  }

  function openTab(key) {
    if (key === "dm") setDmUnread(0);
    setTab(key);
  }

  const displayName = user?.name || user?.username || "Player";
  const typingNames = Object.values(typingUsers);
  const canPost = isAuthenticated && !submitting && uploadPct === null;

  const sections = [
    { key: "feed", label: "Feed", sub: "Fresh posts from the community", icon: SparkIcon, tone: "yellow", badge: 0 },
    { key: "chat", label: "Live chat", sub: "Talk with everyone who's online", icon: ChatIcon, tone: "mint", badge: 0 },
    { key: "dm", label: "Messages", sub: "Private chats with other players", icon: MailIcon, tone: "purple", badge: dmUnread },
  ];
  const links = [
    { key: "games", label: "Games", icon: GamepadIcon, tone: "coral", onClick: () => router.push("/home") },
    isAuthenticated
      ? { key: "profile", label: "Profile", icon: UserIcon, tone: "blue", onClick: () => router.push("/profile") }
      : { key: "login", label: "Log in", icon: LoginIcon, tone: "blue", onClick: login },
  ];
  const current = sections.find((x) => x.key === tab) || sections[0];

  const logo = (
    <button
      type="button"
      className="community-logo"
      onClick={() => router.push("/home")}
      aria-label="Go to SHARX home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SRC} alt="SHARX" />
    </button>
  );

  return (
    <main className="community-page" data-theme={theme}>
      <div className="community-shell">
        {/* ───────── left rail (tablet + desktop) ───────── */}
        <aside className="community-rail">
          {logo}
          <nav className="community-nav" aria-label="Community sections">
            {sections.map((item) => {
              const NavIcon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`community-nav-item tone-${item.tone} ${tab === item.key ? "is-active" : ""}`}
                  aria-current={tab === item.key ? "page" : undefined}
                  title={item.label}
                  onClick={() => openTab(item.key)}
                >
                  <span className="nav-ico">
                    <NavIcon />
                    {item.badge > 0 && (
                      <i className="community-badge">{item.badge > 9 ? "9+" : item.badge}</i>
                    )}
                  </span>
                  <span className="nav-lbl">{item.label}</span>
                </button>
              );
            })}

            <span className="community-nav-spacer" />

            {links.map((item) => {
              const NavIcon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`community-nav-item tone-${item.tone}`}
                  title={item.label}
                  onClick={item.onClick}
                  disabled={item.key === "login" && authLoading}
                >
                  <span className="nav-ico">
                    <NavIcon />
                  </span>
                  <span className="nav-lbl">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ───────── main column ───────── */}
        <div className="community-main">
          <header className="community-header">
            {logo}
            <div className="community-head-title">
              <h2>{current.label}</h2>
              <p>{current.sub}</p>
            </div>

            <div className="community-head-actions">
              {isAuthenticated && (
                <NotificationBell
                  items={notifs}
                  unread={unread}
                  onOpen={markNotifsRead}
                  onPick={openNotification}
                />
              )}

              <button
                type="button"
                className="community-theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                title="Toggle theme"
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>

              {!isAuthenticated && (
                <button
                  type="button"
                  className="community-login-button"
                  onClick={login}
                  disabled={authLoading}
                >
                  <LoginIcon />
                  Log in
                </button>
              )}
            </div>
          </header>

          <section className="community-content" aria-label={current.label}>
            <div className="community-pane" key={tab}>
              {tab === "chat" && (
                <ChatPanel
                  messages={chatMessages}
                  loading={chatLoading}
                  userId={userId}
                  isAuthenticated={isAuthenticated}
                  isAdmin={isAdmin}
                  connected={connected}
                  typingNames={typingNames}
                  onlineIds={onlineIds}
                  onSend={sendChat}
                  onTyping={emitTyping}
                  onDeleteMessage={deleteChatMessage}
                  onLogin={login}
                />
              )}

              {tab === "dm" && (
                <DmPanel
                  socket={socket}
                  userId={userId}
                  isAuthenticated={isAuthenticated}
                  onlineIds={onlineIds}
                  peerRequest={peerRequest}
                  onLogin={login}
                  onRead={refreshDmUnread}
                  showToast={showToast}
                />
              )}

              {tab === "feed" && (
                <>
                  {!authLoading && (
                    <form className="community-composer" onSubmit={createPost}>
                      <div className="community-composer-top">
                        <Avatar name={displayName} />
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          maxLength={POST_MAX}
                          rows={3}
                          placeholder={
                            isAuthenticated
                              ? "What's happening in your gaming world? (@ to mention)"
                              : "Log in to share something with the community..."
                          }
                          aria-label="Write a community post"
                          disabled={!isAuthenticated || submitting}
                        />
                      </div>

                      {(media || uploadPct !== null) && (
                        <div className="community-attach">
                          {uploadPct !== null ? (
                            <div className="community-progress" aria-label="Uploading">
                              <i style={{ width: `${uploadPct}%` }} />
                              <span>Uploading {uploadPct}%</span>
                            </div>
                          ) : (
                            <>
                              {media.mediaType === "video" ? (
                                <video src={media.preview} muted playsInline />
                              ) : (
                                <img src={media.preview} alt="Attachment preview" />
                              )}
                              <button
                                type="button"
                                className="community-attach-remove"
                                onClick={removeMedia}
                                aria-label="Remove attachment"
                              >
                                <CloseIcon />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      <div className="community-composer-footer">
                        <div className="community-composer-tools">
                          <input
                            ref={fileRef}
                            type="file"
                            hidden
                            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                            onChange={pickFile}
                          />
                          <button
                            type="button"
                            className="community-tool-btn"
                            disabled={!isAuthenticated || Boolean(media) || uploadPct !== null}
                            onClick={() => fileRef.current?.click()}
                            aria-label="Attach image or video"
                            title="Attach image or video"
                          >
                            <ImageIcon />
                          </button>
                          <span>
                            {content.length}/{POST_MAX}
                          </span>
                        </div>
                        <button type="submit" disabled={!canPost || (!content.trim() && !media)}>
                          <SendIcon />
                          {submitting ? "Posting..." : "Post"}
                        </button>
                      </div>

                      {!isAuthenticated && (
                        <button type="button" className="community-login-link" onClick={login}>
                          Log in to create a post
                        </button>
                      )}
                    </form>
                  )}

                  {pendingPosts.length > 0 && (
                    <button type="button" className="community-new-pill" onClick={showPending}>
                      <ArrowUpIcon />
                      {pendingPosts.length} new post{pendingPosts.length > 1 ? "s" : ""}
                    </button>
                  )}

                  {loading ? (
                    <div className="community-post-list">
                      {[0, 1, 2].map((i) => (
                        <div className="community-skeleton" key={i}>
                          <div className="sk-row">
                            <i className="sk sk-avatar" />
                            <div className="sk-col">
                              <i className="sk sk-line w40" />
                              <i className="sk sk-line w20" />
                            </div>
                          </div>
                          <i className="sk sk-line w90" />
                          <i className="sk sk-line w70" />
                        </div>
                      ))}
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="community-empty">
                      <span className="empty-ico">
                        <SparkIcon />
                      </span>
                      <h3>It's a little quiet here.</h3>
                      <p>Be the first to start a conversation.</p>
                    </div>
                  ) : (
                    <div className="community-post-list">
                      {posts.map((post) => (
                        <div id={`post-${post.id}`} key={post.id}>
                          <CommunityPost
                            post={post}
                            userId={userId}
                            isAdmin={isAdmin}
                            isAuthenticated={isAuthenticated}
                            comments={commentsByPost[post.id] || []}
                            commentsOpen={Boolean(openComments[post.id])}
                            commentsLoading={Boolean(commentsLoading[post.id])}
                            commentDraft={commentDrafts[post.id] || ""}
                            commentSubmitting={Boolean(commentSubmitting[post.id])}
                            actionLoading={Boolean(actionLoading[post.id])}
                            onReact={reactToPost}
                            onDelete={deletePost}
                            onEdit={editPost}
                            onReport={reportPost}
                            onMessage={messageAuthor}
                            onMute={muteUser}
                            onBan={banUser}
                            onToggleComments={toggleComments}
                            onCommentDraft={updateCommentDraft}
                            onSubmitComment={submitComment}
                            onEditComment={editComment}
                            onDeleteComment={deleteComment}
                            onLogin={login}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {!loading && nextCursor && (
                    <button
                      type="button"
                      className="community-load-more"
                      onClick={() => loadFeed(nextCursor)}
                      disabled={loadingMore}
                    >
                      <ChevronDownIcon />
                      {loadingMore ? "Loading more..." : "Load more posts"}
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        {/* ───────── right aside (large screens) ───────── */}
        <aside className="community-aside">
          <div className="community-about">
            <span className="community-eyebrow">
              <i />
              The Player Zone
            </span>
            <h1>
              Your people. Your <span className="community-hl">playground.</span>
            </h1>
            <p>Share your gaming moments, meet other players and talk about the games you love.</p>
            <div className="community-about-actions">
              <button
                type="button"
                className="community-back-home"
                onClick={() => router.push("/home")}
              >
                <BackIcon /> Back to games
              </button>
            </div>
          </div>

          <div className="community-live-card">
            <span className={`dot ${connected ? "on" : ""}`} />
            <div>
              <strong>{connected ? "Live now" : "Connecting..."}</strong>
              <span>
                {onlineCount > 0 ? `${onlineCount} players online` : "Realtime enabled"}
              </span>
            </div>
          </div>

          <p className="community-aside-note">Play nice. Be kind. Keep it fun.</p>
        </aside>
      </div>

      {/* ───────── bottom tab bar (phones) ───────── */}
      <nav className="community-bnav" aria-label="Community navigation">
        {[...sections, ...links].map((item) => {
          const NavIcon = item.icon;
          const isTab = sections.some((x) => x.key === item.key);
          const active = isTab && tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`tone-${item.tone} ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={isTab ? () => openTab(item.key) : item.onClick}
            >
              <span className="bnav-ico">
                <NavIcon />
                {item.badge > 0 && (
                  <i className="community-badge">{item.badge > 9 ? "9+" : item.badge}</i>
                )}
              </span>
              <span>{item.key === "chat" ? "Chat" : item.label}</span>
            </button>
          );
        })}
      </nav>

      {toast && (
        <div
          className={`community-toast is-${toast.type}`}
          role={toast.type === "error" ? "alert" : "status"}
        >
          <span className="toast-ico">
            {toast.type === "error" ? <CloseIcon /> : <CheckIcon />}
          </span>
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss">
            <CloseIcon />
          </button>
        </div>
      )}
    </main>
  );
}
