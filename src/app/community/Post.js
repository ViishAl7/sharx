"use client";

import { useState } from "react";
import {
  Avatar,
  Menu,
  InlineEditor,
  ReactionButton,
  RichText,
  CommentIcon,
  HeartIcon,
  EditIcon,
  TrashIcon,
  FlagIcon,
  MailIcon,
  ShieldIcon,
  MuteIcon,
  BanIcon,
  ChevronDownIcon,
} from "./ui";
import { COMMENT_MAX, POST_MAX, REACTIONS, safeUrl, same, timeAgo } from "./api";

const EDIT_WINDOW_MS = 30 * 60 * 1000;
const canStillEdit = (createdAt) =>
  Date.now() - new Date(createdAt).getTime() < EDIT_WINDOW_MS;

/* ───────────── comment ───────────── */

function CommentItem({ comment, userId, isAdmin, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const own =
    userId != null && comment.author?.id != null && same(userId, comment.author.id);

  const items = [];
  if (own && canStillEdit(comment.createdAt))
    items.push({ label: "Edit", icon: EditIcon, onClick: () => setEditing(true) });
  if (own || isAdmin)
    items.push({
      label: own ? "Delete" : "Remove (admin)",
      icon: own ? TrashIcon : ShieldIcon,
      danger: true,
      onClick: () => onDelete(comment),
    });

  return (
    <div className="community-comment">
      <Avatar name={comment.author?.name} />
      <div className="community-comment-body">
        <div className="community-comment-head">
          <strong>{comment.author?.name || "SHARX Player"}</strong>
          {!editing && <Menu items={items} />}
        </div>

        {editing ? (
          <InlineEditor
            rows={2}
            initial={comment.content}
            max={COMMENT_MAX}
            onCancel={() => setEditing(false)}
            onSave={async (text) => {
              await onEdit(comment, text);
              setEditing(false);
            }}
          />
        ) : (
          <RichText text={comment.content} />
        )}

        <span>
          {timeAgo(comment.createdAt)}
          {comment.editedAt ? " · edited" : ""}
        </span>
      </div>
    </div>
  );
}

/* ───────────── post ───────────── */

export default function CommunityPost({
  post,
  userId,
  isAdmin,
  isAuthenticated,
  comments,
  commentsOpen,
  commentsLoading,
  commentDraft,
  commentSubmitting,
  actionLoading,
  onReact,
  onDelete,
  onEdit,
  onReport,
  onMessage,
  onMute,
  onBan,
  onToggleComments,
  onCommentDraft,
  onSubmitComment,
  onEditComment,
  onDeleteComment,
  onLogin,
}) {
  const [editing, setEditing] = useState(false);
  const author = post.author || {};
  const ownPost = userId != null && author.id != null && same(userId, author.id);
  const imageSrc = post.mediaType === "image" ? safeUrl(post.mediaUrl) : "";
  const videoSrc = post.mediaType === "video" ? safeUrl(post.mediaUrl) : "";

  const menuItems = [];
  if (ownPost) {
    if (canStillEdit(post.createdAt))
      menuItems.push({ label: "Edit post", icon: EditIcon, onClick: () => setEditing(true) });
    menuItems.push({ label: "Delete post", icon: TrashIcon, danger: true, onClick: () => onDelete(post) });
  } else {
    if (isAuthenticated) {
      menuItems.push({ label: "Message", icon: MailIcon, onClick: () => onMessage(author) });
      menuItems.push({ label: "Report", icon: FlagIcon, onClick: () => onReport(post) });
    }
    if (isAdmin) {
      menuItems.push({ label: "Remove post (admin)", icon: TrashIcon, danger: true, onClick: () => onDelete(post) });
      menuItems.push({ label: "Mute user 1h", icon: MuteIcon, danger: true, onClick: () => onMute(author, 60) });
      menuItems.push({ label: "Ban user", icon: BanIcon, danger: true, onClick: () => onBan(author) });
    }
  }

  // reaction summary chips (top first)
  const summary = Object.entries(post.reactions || {})
    .filter(([e, n]) => n > 0 && REACTIONS.includes(e))
    .sort((a, b) => b[1] - a[1]);

  return (
    <article className={`community-post ${commentsOpen ? "has-comments" : ""}`}>
      <div className="community-post-header">
        <Avatar name={author.name} />
        <div className="community-author-details">
          <strong>{author.name || "SHARX Player"}</strong>
          <span>
            {author.username ? `@${author.username} · ` : ""}
            {timeAgo(post.createdAt)}
            {post.editedAt ? " · edited" : ""}
          </span>
        </div>
        {!editing && <Menu items={menuItems} />}
      </div>

      {editing ? (
        <InlineEditor
          initial={post.content || ""}
          max={POST_MAX}
          onCancel={() => setEditing(false)}
          onSave={async (text) => {
            await onEdit(post, text);
            setEditing(false);
          }}
        />
      ) : (
        post.content && <RichText className="community-post-content" text={post.content} />
      )}

      {imageSrc && (
        <img
          className="community-post-media"
          src={imageSrc}
          alt="Post attachment"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
      {videoSrc && (
        <video className="community-post-media" src={videoSrc} controls preload="metadata" playsInline />
      )}

      <div className="community-post-stats">
        <span className="community-reaction-summary">
          {summary.length > 0 ? (
            summary.slice(0, 3).map(([e]) => <i key={e}>{e}</i>)
          ) : (
            <HeartIcon />
          )}
          {post.likeCount || 0} {post.likeCount === 1 ? "Reaction" : "Reactions"}
        </span>
        <span>
          <CommentIcon />
          {post.commentCount || 0} {post.commentCount === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      <div className="community-post-actions">
        <ReactionButton
          myReaction={post.myReaction}
          disabled={actionLoading}
          onReact={(emoji) => (isAuthenticated ? onReact(post, emoji) : onLogin())}
        />

        <button type="button" className="community-action" onClick={() => onToggleComments(post)}>
          <CommentIcon />
          {commentsOpen ? "Hide comments" : "Comments"}
        </button>
      </div>

      {commentsOpen && (
        <div className="community-comments">
          {commentsLoading ? (
            <p className="community-muted">Loading comments...</p>
          ) : comments.length ? (
            comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                userId={userId}
                isAdmin={isAdmin}
                onEdit={(comment, text) => onEditComment(post, comment, text)}
                onDelete={(comment) => onDeleteComment(post, comment)}
              />
            ))
          ) : (
            <p className="community-muted">No comments yet. Start the conversation.</p>
          )}

          <form
            className="community-comment-form"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitComment(post);
            }}
          >
            <input
              type="text"
              value={commentDraft}
              maxLength={COMMENT_MAX}
              placeholder={isAuthenticated ? "Write a comment... (@ to mention)" : "Log in to comment"}
              aria-label="Write a comment"
              onChange={(e) => onCommentDraft(post.id, e.target.value)}
            />
            <button
              type="submit"
              disabled={!commentDraft.trim() || commentSubmitting || !isAuthenticated}
            >
              {commentSubmitting ? "Sending..." : "Send"}
            </button>
          </form>

          {!isAuthenticated && (
            <button type="button" className="community-login-link" onClick={onLogin}>
              Log in to join the conversation
            </button>
          )}
        </div>
      )}
    </article>
  );
}
