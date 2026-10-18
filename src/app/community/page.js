"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "../../config";
import { authFetch } from "../../lib/auth-session";
import { useAuth } from "../../context/AuthContext";
import { currentUserId, readToken } from "../../lib/auth-session";
import { io } from "socket.io-client";
import "./community.css";

const PAGE_SIZE = 15;

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.message || `Request failed (${response.status})`
    );
  }

  return data;
}

async function publicRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  return readResponse(response);
}

function getInitials(name) {
  const words = String(name || "Player").trim().split(/\s+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "P";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function Avatar({ name }) {
  return (
    <div className="community-avatar" aria-label={`${name || "Player"} avatar`}>
      {getInitials(name)}
    </div>
  );
}

/* Custom SVG Icons (No Emojis) */
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

function CommunityPost({
  post,
  userId,
  isAuthenticated,
  comments,
  commentsOpen,
  commentsLoading,
  commentDraft,
  commentSubmitting,
  actionLoading,
  onLike,
  onDelete,
  onToggleComments,
  onCommentDraft,
  onSubmitComment,
  onLogin,
}) {
  const author = post.author || {};
  const ownPost =
    userId != null &&
    author.id != null &&
    String(userId) === String(author.id);

  return (
    <article className="community-post">
      <div className="community-post-header">
        <Avatar name={author.name} />

        <div className="community-author-details">
          <strong>{author.name || "SHARX Player"}</strong>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        {ownPost && (
          <button
            type="button"
            className="community-delete"
            disabled={actionLoading}
            onClick={() => onDelete(post)}
            aria-label="Delete your post"
            title="Delete post"
          >
            Delete
          </button>
        )}
      </div>

      {post.content && (
        <p className="community-post-content">{post.content}</p>
      )}

      {post.mediaUrl && post.mediaType === "image" && (
        <img
          className="community-post-media"
          src={post.mediaUrl}
          alt="Post attachment"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}

      {post.mediaUrl && post.mediaType === "video" && (
        <video
          className="community-post-media"
          src={post.mediaUrl}
          controls
          preload="metadata"
        >
          Your browser does not support video playback.
        </video>
      )}

      <div className="community-post-stats">
        <span>{post.likeCount || 0} Likes</span>
        <span>{post.commentCount || 0} Comments</span>
      </div>

      <div className="community-post-actions">
        <button
          type="button"
          className={`community-action ${
            post.likedByMe ? "is-liked" : ""
          }`}
          disabled={actionLoading}
          onClick={() => {
            if (!isAuthenticated) {
              onLogin();
              return;
            }

            onLike(post);
          }}
        >
          <HeartIcon filled={post.likedByMe} />
          {post.likedByMe ? "Liked" : "Like"}
        </button>

        <button
          type="button"
          className="community-action"
          onClick={() => onToggleComments(post)}
        >
          <CommentIcon />
          {commentsOpen ? "Hide comments" : "Comments"}
        </button>
      </div>

      {commentsOpen && (
        <div className="community-comments">
          {commentsLoading ? (
            <p className="community-muted">Loading comments...</p>
          ) : comments.length ? (
            comments.map((comment) => (
              <div className="community-comment" key={comment.id}>
                <Avatar name={comment.author?.name} />

                <div className="community-comment-body">
                  <strong>{comment.author?.name || "SHARX Player"}</strong>
                  <p>{comment.content}</p>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="community-muted">
              No comments yet. Start the conversation.
            </p>
          )}

          <form
            className="community-comment-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmitComment(post);
            }}
          >
            <input
              type="text"
              value={commentDraft}
              maxLength={1000}
              placeholder={
                isAuthenticated
                  ? "Write a comment..."
                  : "Log in to comment"
              }
              aria-label="Write a comment"
              onChange={(event) =>
                onCommentDraft(post.id, event.target.value)
              }
            />

            <button
              type="submit"
              disabled={
                !commentDraft.trim() ||
                commentSubmitting ||
                !isAuthenticated
              }
            >
              {commentSubmitting ? "Sending..." : "Send"}
            </button>
          </form>

          {!isAuthenticated && (
            <button
              type="button"
              className="community-login-link"
              onClick={onLogin}
            >
              Log in to join the conversation
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default function CommunityPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const userId = currentUserId();
  const isAuthenticated = Boolean(user);

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [openComments, setOpenComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const login = useCallback(() => {
    router.push("/login?next=%2Fcommunity");
  }, [router]);

  const loadFeed = useCallback(async (cursor = null) => {
    if (cursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError("");
    }

    try {
      const query = new URLSearchParams({ limit: String(PAGE_SIZE) });

      if (cursor) query.set("cursor", cursor);

      const data = await publicRequest(`/community/feed?${query.toString()}`);

      const incoming = Array.isArray(data.items) ? data.items : [];

      setPosts((previous) => {
        if (!cursor) return incoming;

        const existingIds = new Set(previous.map((post) => post.id));

        return [
          ...previous,
          ...incoming.filter((post) => !existingIds.has(post.id)),
        ];
      });

      setNextCursor(data.nextCursor || null);
    } catch (err) {
      setError(err.message || "Could not load the community feed.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  // Public community events are broadcast by the backend through Socket.IO.
  // REST requests remain the source of truth for authenticated actions.
  useEffect(() => {
    const socket = io(API_BASE, {
      auth: { token: readToken() || undefined },
      transports: ["websocket", "polling"],
    });

    socket.on("community:post_created", (payload) => {
      const incomingPost = payload?.post;
      if (!incomingPost?.id) return;

      setPosts((previous) => {
        if (previous.some((post) => String(post.id) === String(incomingPost.id))) {
          return previous;
        }
        return [{ ...incomingPost, likedByMe: false }, ...previous];
      });
    });

    socket.on("community:post_deleted", (payload) => {
      if (payload?.postId == null) return;
      const deletedId = String(payload.postId);

      setPosts((previous) =>
        previous.filter((post) => String(post.id) !== deletedId)
      );
      setOpenComments((previous) => {
        const next = { ...previous };
        delete next[deletedId];
        delete next[payload.postId];
        return next;
      });
      setCommentsByPost((previous) => {
        const next = { ...previous };
        delete next[deletedId];
        delete next[payload.postId];
        return next;
      });
    });

    socket.on("community:like_updated", (payload) => {
      if (payload?.postId == null || typeof payload.likeCount !== "number") {
        return;
      }

      const targetId = String(payload.postId);
      setPosts((previous) =>
        previous.map((post) =>
          String(post.id) === targetId
            ? { ...post, likeCount: payload.likeCount }
            : post
        )
      );
    });

    socket.on("community:comment_created", (payload) => {
      if (payload?.postId == null || !payload.comment?.id) return;

      const targetId = String(payload.postId);

      if (typeof payload.commentCount === "number") {
        setPosts((previous) =>
          previous.map((post) =>
            String(post.id) === targetId
              ? { ...post, commentCount: payload.commentCount }
              : post
          )
        );
      }

      // Only update a comment list that has already been loaded.
      // This avoids marking an unopened comments panel as fully loaded.
      setCommentsByPost((previous) => {
        const key = Object.prototype.hasOwnProperty.call(previous, targetId)
          ? targetId
          : payload.postId;

        if (!Object.prototype.hasOwnProperty.call(previous, key)) {
          return previous;
        }

        const current = previous[key] || [];
        if (current.some((comment) => String(comment.id) === String(payload.comment.id))) {
          return previous;
        }

        return { ...previous, [key]: [...current, payload.comment] };
      });
    });

    return () => {
      socket.off("community:post_created");
      socket.off("community:post_deleted");
      socket.off("community:like_updated");
      socket.off("community:comment_created");
      socket.disconnect();
    };
  }, [isAuthenticated]);

  const requireLogin = useCallback(() => {
    if (!isAuthenticated) {
      login();
      return false;
    }

    return true;
  }, [isAuthenticated, login]);

  async function createPost(event) {
    event.preventDefault();

    const text = content.trim();

    if (!text || submitting) return;

    if (!requireLogin()) return;

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const data = await authFetch("/community/posts", {
        method: "POST",
        body: JSON.stringify({ content: text }),
      });

      if (data.post) {
        setPosts((previous) => [
          data.post,
          ...previous.filter((post) => post.id !== data.post.id),
        ]);
      }

      setContent("");
      setNotice("Your post is live.");
    } catch (err) {
      setError(err.message || "Could not publish your post.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleLike(post) {
    if (!requireLogin() || actionLoading[post.id]) return;

    setActionLoading((previous) => ({
      ...previous,
      [post.id]: true,
    }));

    setError("");

    try {
      const data = await authFetch(
        `/community/posts/${encodeURIComponent(post.id)}/like`,
        { method: "PUT" }
      );

      setPosts((previous) =>
        previous.map((item) =>
          item.id === post.id
            ? {
                ...item,
                likedByMe: Boolean(data.liked),
                likeCount:
                  typeof data.likeCount === "number"
                    ? data.likeCount
                    : item.likeCount,
              }
            : item
        )
      );
    } catch (err) {
      setError(err.message || "Could not update your like.");
    } finally {
      setActionLoading((previous) => ({
        ...previous,
        [post.id]: false,
      }));
    }
  }

  async function deletePost(post) {
    if (!requireLogin() || actionLoading[post.id]) return;

    const confirmed = window.confirm(
      "Delete this post? This action cannot be undone."
    );

    if (!confirmed) return;

    setActionLoading((previous) => ({
      ...previous,
      [post.id]: true,
    }));

    setError("");

    try {
      await authFetch(
        `/community/posts/${encodeURIComponent(post.id)}`,
        { method: "DELETE" }
      );

      setPosts((previous) =>
        previous.filter((item) => item.id !== post.id)
      );

      setNotice("Post deleted.");
    } catch (err) {
      setError(err.message || "Could not delete the post.");
    } finally {
      setActionLoading((previous) => ({
        ...previous,
        [post.id]: false,
      }));
    }
  }

  async function toggleComments(post) {
    const postId = post.id;
    const willOpen = !openComments[postId];

    setOpenComments((previous) => ({
      ...previous,
      [postId]: willOpen,
    }));

    if (!willOpen || commentsByPost[postId]) return;

    setCommentsLoading((previous) => ({
      ...previous,
      [postId]: true,
    }));

    try {
      const data = await publicRequest(
        `/community/posts/${encodeURIComponent(postId)}/comments?limit=25`
      );

      setCommentsByPost((previous) => ({
        ...previous,
        [postId]: Array.isArray(data.items) ? data.items : [],
      }));
    } catch (err) {
      setError(err.message || "Could not load comments.");
      setCommentsByPost((previous) => ({
        ...previous,
        [postId]: [],
      }));
    } finally {
      setCommentsLoading((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  }

  function updateCommentDraft(postId, value) {
    setCommentDrafts((previous) => ({
      ...previous,
      [postId]: value,
    }));
  }

  async function submitComment(post) {
    const postId = post.id;
    const text = (commentDrafts[postId] || "").trim();

    if (!text || commentSubmitting[postId]) return;

    if (!requireLogin()) return;

    setCommentSubmitting((previous) => ({
      ...previous,
      [postId]: true,
    }));

    setError("");

    try {
      const data = await authFetch(
        `/community/posts/${encodeURIComponent(postId)}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ content: text }),
        }
      );

      if (data.comment) {
        setCommentsByPost((previous) => {
          const current = previous[postId] || [];
          if (current.some((comment) => String(comment.id) === String(data.comment.id))) {
            return previous;
          }
          return { ...previous, [postId]: [...current, data.comment] };
        });

        setPosts((previous) =>
          previous.map((item) =>
            String(item.id) === String(postId)
              ? {
                  ...item,
                  commentCount:
                    typeof data.commentCount === "number"
                      ? data.commentCount
                      : (item.commentCount || 0) + 1,
                }
              : item
          )
        );
      }

      setCommentDrafts((previous) => ({
        ...previous,
        [postId]: "",
      }));
    } catch (err) {
      setError(err.message || "Could not publish your comment.");
    } finally {
      setCommentSubmitting((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  }

  const displayName =
    user?.name ||
    user?.username ||
    "Player";

  return (
    <main className="community-page">
      <header className="community-topbar">
        <button
          type="button"
          className="community-brand"
          onClick={() => router.push("/home")}
          aria-label="Go to SHARX home"
        >
          <span className="community-brand-mark">S</span>
          <span>SHARX</span>
        </button>

        <nav className="community-topbar-actions" aria-label="Main navigation">
          <button
            type="button"
            className="community-nav-button"
            onClick={() => router.push("/home")}
          >
            Games
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              className="community-profile-button"
              onClick={() => router.push("/profile")}
            >
              <Avatar name={displayName} />
              <span>Profile</span>
            </button>
          ) : (
            <button
              type="button"
              className="community-login-button"
              onClick={login}
              disabled={authLoading}
            >
              Log in
            </button>
          )}
        </nav>
      </header>

      <div className="community-layout">
        <aside className="community-intro">
          <span className="community-eyebrow">THE PLAYER ZONE</span>
          <h1>
            Your people.
            <br />
            Your <span>playground.</span>
          </h1>
          <p>
            Share your gaming moments, meet other players and talk about
            the games you love.
          </p>

          <button
            type="button"
            className="community-back-home"
            onClick={() => router.push("/home")}
          >
            &larr; Back to games
          </button>
        </aside>

        <section className="community-feed" aria-label="Community feed">
          <div className="community-feed-heading">
            <div>
              <span className="community-eyebrow">SHARX COMMUNITY</span>
              <h2>The feed</h2>
            </div>

            <span className="community-online-note">
              Made for players
            </span>
          </div>

          {!authLoading && (
            <form className="community-composer" onSubmit={createPost}>
              <div className="community-composer-top">
                <Avatar name={displayName} />

                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder={
                    isAuthenticated
                      ? "What's happening in your gaming world?"
                      : "Log in to share something with the community..."
                  }
                  aria-label="Write a community post"
                  disabled={!isAuthenticated || submitting}
                />
              </div>

              <div className="community-composer-footer">
                <span>{content.length}/2000</span>

                <button
                  type="submit"
                  disabled={
                    !isAuthenticated ||
                    !content.trim() ||
                    submitting
                  }
                >
                  {submitting ? "Posting..." : "Post"}
                </button>
              </div>

              {!isAuthenticated && (
                <button
                  type="button"
                  className="community-login-link"
                  onClick={login}
                >
                  Log in to create a post
                </button>
              )}
            </form>
          )}

          {error && (
            <div className="community-alert community-alert-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>
                Dismiss
              </button>
            </div>
          )}

          {notice && (
            <div className="community-alert community-alert-success" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice("")}>
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="community-state">
              <div className="community-loader" />
              <p>Loading the player zone...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="community-empty">
              <h3>It's a little quiet here.</h3>
              <p>Be the first to start a conversation.</p>
            </div>
          ) : (
            <div className="community-post-list">
              {posts.map((post) => (
                <CommunityPost
                  key={post.id}
                  post={post}
                  userId={userId}
                  isAuthenticated={isAuthenticated}
                  comments={commentsByPost[post.id] || []}
                  commentsOpen={Boolean(openComments[post.id])}
                  commentsLoading={Boolean(commentsLoading[post.id])}
                  commentDraft={commentDrafts[post.id] || ""}
                  commentSubmitting={Boolean(commentSubmitting[post.id])}
                  actionLoading={Boolean(actionLoading[post.id])}
                  onLike={toggleLike}
                  onDelete={deletePost}
                  onToggleComments={toggleComments}
                  onCommentDraft={updateCommentDraft}
                  onSubmitComment={submitComment}
                  onLogin={login}
                />
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
              {loadingMore ? "Loading more..." : "Load more posts"}
            </button>
          )}

          <p className="community-footer-note">
            Play nice. Be kind. Keep it fun.
          </p>
        </section>
      </div>
    </main>
  );
}