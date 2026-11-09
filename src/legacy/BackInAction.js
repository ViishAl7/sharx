import React from "react";
import "./HomepageFeatureSections.css";

export default function BackInAction() {
  return (
    <section className="shx-feature shx-back-action">
      <div className="shx-bia-grid" aria-hidden="true" />
      <div className="shx-bia-copy">
        <span className="shx-feature-eyebrow">THE NEXT CHAPTER STARTS NOW</span>
        <h2>BACK IN <span>ACTION.</span></h2>
        <p className="shx-bia-subtitle">BUILT TO GO BEYOND.</p>
        <p className="shx-feature-description">
          Back to work. Every day, from now on.
        </p>
      </div>
      <div className="shx-bia-rocket" aria-hidden="true">
        <div className="shx-bia-orbit" />
        <svg viewBox="0 0 220 280" role="img">
          <defs>
            <linearGradient id="shxRocketBody" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#a8a8a8" />
            </linearGradient>
            <linearGradient id="shxRocketFire" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#777" />
            </linearGradient>
          </defs>
          <path d="M110 22 C66 56 62 119 72 183 L148 183 C158 119 154 56 110 22Z"
            fill="url(#shxRocketBody)" stroke="#fff" strokeWidth="3"/>
          <path d="M72 145 L36 190 L75 179Z" fill="#aaa" stroke="#fff" strokeWidth="2"/>
          <path d="M148 145 L184 190 L145 179Z" fill="#aaa" stroke="#fff" strokeWidth="2"/>
          <circle cx="110" cy="111" r="19" fill="#171717" stroke="#fff" strokeWidth="5"/>
          <circle cx="110" cy="111" r="9" fill="#aaa"/>
          <path d="M91 183 L91 207 L110 198 L129 207 L129 183Z" fill="#888"/>
          <path className="shx-bia-flame" d="M91 204 Q84 239 110 270 Q136 239 129 204 L110 222Z"
            fill="url(#shxRocketFire)"/>
          <path d="M103 205 Q101 235 110 247 Q119 235 117 205Z" fill="#fff"/>
        </svg>
      </div>
      <span className="shx-bia-bottom">SHARX <span>—</span> THE JOURNEY CONTINUES</span>
    </section>
  );
}
