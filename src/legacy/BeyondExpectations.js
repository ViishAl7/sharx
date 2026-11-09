import React from "react";
import "./HomepageFeatureSections.css";

export default function BeyondExpectations() {
  return (
    <section className="shx-feature shx-beyond">
      <div className="shx-beyond-top">
        <span className="shx-feature-eyebrow">NO LIMITS. NO SHORTCUTS.</span>
        <span className="shx-beyond-index">02 / THE VISION</span>
      </div>
      <div className="shx-beyond-content">
        <p className="shx-beyond-kicker">WE ARE JUST GETTING STARTED</p>
        <h2>BEYOND<br /><span>EXPECTATIONS.</span></h2>
        <p className="shx-feature-description">
          More to explore. More to experience. Always moving beyond what’s expected.
        </p>
      </div>
      <div className="shx-beyond-mark" aria-hidden="true">S<span>.</span></div>
      <div className="shx-beyond-footer">
        <span>SHARX</span>
        <span>PLAY BEYOND THE ORDINARY.</span>
      </div>
    </section>
  );
}
