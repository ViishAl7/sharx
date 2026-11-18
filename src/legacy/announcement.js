"use client";

import React, { memo } from "react";
import "./announcement.css";

const LINES = [
  ["Behind", "the", "scenes,"],
  ["beyond", "expectations."],
  ["The", "next", "chapter", "is", "worth", "the", "wait."],
];

const AnnouncementBanner = memo(function AnnouncementBanner() {
  let c = 0;

  return (
    <section className="shx-ann-banner" aria-label="SHARX announcement">
      <span className="shx-ann-banner-depth" aria-hidden="true" />
      <span className="shx-ann-banner-grain" aria-hidden="true" />
      <span className="shx-ann-banner-vignette" aria-hidden="true" />
      <span className="shx-ann-banner-sweep" aria-hidden="true" />

      <div className="shx-ann-content">
        <h2
          className="shx-ann-banner-text"
          aria-label="Behind the scenes, beyond expectations. The next chapter is worth the wait."
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
                  </span>
                  {wi < words.length - 1 && " "}
                </React.Fragment>
              ))}
            </span>
          ))}
        </h2>
      </div>

      {/* Signature positioned beautifully in the bottom-right corner */}
      <div className="shx-ann-signature" aria-hidden="true">
        See you there.
      </div>
    </section>
  );
});

export default AnnouncementBanner;