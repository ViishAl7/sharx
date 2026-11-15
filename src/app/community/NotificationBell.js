"use client";

import { useEffect, useRef, useState } from "react";
import { BellIcon, Avatar, CheckIcon } from "./ui";
import { timeAgo } from "./api";

function describe(n) {
  const who = n.actor?.name || "Someone";
  if (n.type === "mention") return `${who} mentioned you`;
  if (n.type === "reaction") return `${who} reacted ${n.emoji || "❤️"} to your post`;
  if (n.type === "comment") return `${who} commented on your post`;
  return `${who} sent you an update`;
}

export default function NotificationBell({ items, unread, onOpen, onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="community-bell" ref={ref}>
      <button
        type="button"
        className="community-theme-toggle"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && unread > 0) onOpen();
        }}
      >
        <BellIcon />
        {unread > 0 && (
          <span className="community-badge">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="community-notif-panel" role="menu">
          <div className="community-notif-title">
            <BellIcon /> Notifications
          </div>
          {items.length === 0 ? (
            <p className="community-muted center">
              <CheckIcon /> You're all caught up.
            </p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`community-notif ${n.readAt ? "" : "is-unread"}`}
                onClick={() => {
                  setOpen(false);
                  onPick(n);
                }}
              >
                <Avatar name={n.actor?.name} />
                <div>
                  <strong>{describe(n)}</strong>
                  {n.preview && <p>{n.preview}</p>}
                  <span>{timeAgo(n.createdAt)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
