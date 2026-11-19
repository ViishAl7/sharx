"use client";

import React, { memo } from "react";
import "./announcement.css";

const LINES = [
  ["Behind", "the", "scenes,"],
  ["beyond", "expectations."],
  ["The", "next", "chapter", "is", "worth", "the", "wait."],
];

const FULL_TEXT =
  "Behind the scenes, beyond expectations. The next chapter is worth the wait.";

/* Word indexes are worked out once at module load, so rendering does zero work.
   Old version made ~90 animated <span>s (one per letter) with blur + shimmer.
   Now it's ~13 word spans that only animate opacity + transform (GPU friendly). */
let wordCount = 0;
const INDEXED = LINES.map((words) =>
  words.map((word) => ({ word, i: wordCount++ }))
);

const AnnouncementBanner = memo(function AnnouncementBanner() {
  return (
    <section className="shx-ann-banner" aria-label="SHARX announcement">
      <span className="shx-ann-banner-sweep" aria-hidden="true" />

      <div className="shx-ann-content">
        <h2 className="shx-ann-banner-text" aria-label={FULL_TEXT}>
          {INDEXED.map((words, li) => (
            <span className="shx-ann-banner-line" key={li} aria-hidden="true">
              {words.map(({ word, i }, wi) => (
                <React.Fragment key={i}>
                  <span className="shx-word" style={{ "--w": i }}>
                    {word}
                  </span>
                  {wi < words.length - 1 && " "}
                </React.Fragment>
              ))}
            </span>
          ))}
        </h2>
      </div>

      <div className="shx-ann-signature" aria-hidden="true">
        See you there.
      </div>
    </section>
  );
});

export default AnnouncementBanner;