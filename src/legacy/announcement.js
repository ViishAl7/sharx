
"use client";

import React, { memo } from "react";
import "./announcement.css";

const LINES = [
  ["Behind", "the", "scenes,"],
  ["beyond", "expectations"],
];

const AnnouncementBanner = memo(function AnnouncementBanner() {
  let c = 0;

  return (
    <section className="shx-ann-banner" aria-label="SHARX announcement">
      <span className="shx-ann-banner-depth" aria-hidden="true" />
      <span className="shx-ann-banner-grain" aria-hidden="true" />
      <span className="shx-ann-banner-vignette" aria-hidden="true" />

      <div className="shx-ann-content">
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
                      <span className="shx-char shx-dot" style={{ "--c": c++ }}>
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

        <div className="shx-ann-message">
          <p className="shx-ann-greeting">Hey everyone!</p>

          <p>
            First of all, thank you to everyone who has continued supporting
            SHARX.
          </p>

          <p>
            I know things have been a little quiet lately. I haven't been able
            to give SHARX the time and attention it deserves over the past few
            weeks due to some personal commitments and health issues.
          </p>

          <p>
            But I'm back, and I'm working on SHARX every single day.
          </p>

          <p>
            I'm not here just to make a few small changes. I want to bring
            something genuinely better to SHARX — a much-improved experience,
            exciting new features, better performance, and things that make
            your time here worth it.
          </p>

          <p>
            Great things take time, and I don't want to rush something that
            deserves to be done right.
          </p>

          <p>So, I'm asking you for just a little more time and patience.</p>

          <p>
            SHARX is not stopping. This is just the beginning of something
            much bigger.
          </p>

          <p>
            Thank you for staying with us. The next chapter is being built,
            one day at a time.
          </p>

          <p className="shx-ann-closing">See you soon. 🚀</p>

          <p className="shx-ann-signature">Vishal</p>
        </div>
      </div>
    </section>
  );
});

export default AnnouncementBanner;
