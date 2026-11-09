"use client";

import React, { memo } from "react";
import "./announcement.css";

const LINES = [
  ["Behind", "the", "scenes,"],
  ["beyond", "expectations"],
];

const AnnouncementBanner = memo(function AnnouncementBanner() {
  let c = 0; // running index for the stagger

  return (
    <section className="shx-ann-banner" aria-label="SHARX announcement">
      <span className="shx-ann-banner-depth" aria-hidden="true" />
      <span className="shx-ann-banner-grain" aria-hidden="true" />
      <span className="shx-ann-banner-vignette" aria-hidden="true" />

      <h2
        className="shx-ann-banner-text"
        aria-label="Behind the scenes, beyond expectations."
      >
        {LINES.map((words, li) => (
          <span className="shx-ann-banner-line" key={li} aria-hidden="true">
            {words.map((word, wi) => (
              <React.Fragment key={word + wi}>
                <span className="shx-word">
                  {word.split("").map((ch, ci) => (
                    <span className="shx-char" style={{ "--c": c++ }} key={ci}>
                      {ch}
                    </span>
                  ))}
                  {li === LINES.length - 1 && wi === words.length - 1 && (
                    <span
                      className="shx-char shx-dot"
                      style={{ "--c": c++ }}
                    >
                      .
                    </span>
                  )}
                </span>
                {wi < words.length - 1 && " "}
              </React.Fragment>
            ))}
          </span>
        ))}
      </h2>
    </section>
  );
});

export default AnnouncementBanner;