import React from "react";

export const metadata = {
  title: "SHARX — A New Chapter is Coming",
  description: "Something fresh, playful, and unmistakably Sharx is taking shape.",
};

export default function MaintenancePage() {
  return (
    <main className="sharx-crayon-simple">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          min-height: 100%;
          background-color: #FDFBF7;
        }

        .sharx-crayon-simple {
          --navy: #102A43;
          --paper: #FDFBF7;
          --crayon-yellow: #FFCA28;
          --crayon-coral: #FF7E67;
          --crayon-mint: #6EE7B7;
          --crayon-blue: #60A5FA;
          --crayon-purple: #C084FC;
          --crayon-pink: #F472B6;

          position: relative;
          min-height: 100svh;
          width: 100%;
          overflow: hidden;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 40px 20px;

          font-family: 'Comfortaa', 'Comic Sans MS', system-ui, sans-serif;
          color: var(--navy);

          background-color: var(--paper);
          background-image:
            radial-gradient(circle at 12% 15%, rgba(255, 202, 40, 0.16), transparent 32%),
            radial-gradient(circle at 88% 20%, rgba(96, 165, 250, 0.14), transparent 30%),
            radial-gradient(circle at 20% 88%, rgba(244, 114, 182, 0.12), transparent 30%),
            radial-gradient(circle at 85% 85%, rgba(110, 231, 183, 0.14), transparent 32%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
        }

        .svg-defs {
          position: absolute;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        /* =========================================================
           ANIMATED CRAYON DOODLES
        ========================================================= */
        .doodle {
          position: absolute;
          z-index: 2;
          pointer-events: none;
          animation: floatDoodle 7s ease-in-out infinite;
        }

        .doodle svg {
          width: 100%;
          height: 100%;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: url(#crayon-texture);
        }

        .doodle-cloud { top: 12%; left: 8%; width: 100px; height: 60px; animation-delay: 0s; }
        .doodle-cloud svg { stroke: var(--crayon-blue); stroke-width: 8; }

        .doodle-plane { top: 10%; right: 10%; width: 110px; height: 90px; animation-delay: 1.5s; }
        .doodle-plane svg { stroke: var(--crayon-mint); stroke-width: 8; }

        .doodle-plane-dots {
          position: absolute;
          top: 44px;
          right: -34px;
          display: flex;
          gap: 7px;
          transform: rotate(18deg);
        }
        .doodle-plane-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--crayon-mint);
          opacity: 0.75;
          animation: dotPulse 1.8s ease-in-out infinite;
        }
        .doodle-plane-dots span:nth-child(1) { animation-delay: 0s; }
        .doodle-plane-dots span:nth-child(2) { animation-delay: 0.2s; }
        .doodle-plane-dots span:nth-child(3) { animation-delay: 0.4s; }
        .doodle-plane-dots span:nth-child(4) { animation-delay: 0.6s; }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }

        .doodle-star-1 { top: 22%; left: 18%; width: 45px; height: 45px; animation-delay: 2s; }
        .doodle-star-1 svg { stroke: var(--crayon-yellow); stroke-width: 8; }

        .doodle-star-2 { top: 28%; left: 8%; width: 25px; height: 25px; animation-delay: 3s; }
        .doodle-star-2 svg { stroke: var(--crayon-coral); stroke-width: 6; }

        .doodle-star-3 { top: 18%; right: 22%; width: 35px; height: 35px; animation-delay: 1s; }
        .doodle-star-3 svg { stroke: var(--crayon-pink); stroke-width: 7; }

        .doodle-star-4 { bottom: 25%; left: 30%; width: 30px; height: 30px; animation-delay: 4s; }
        .doodle-star-4 svg { stroke: var(--crayon-purple); stroke-width: 7; }

        .doodle-squiggle-left { top: 45%; left: 8%; width: 50px; height: 25px; }
        .doodle-squiggle-left svg { stroke: var(--crayon-yellow); stroke-width: 8; }

        .doodle-squiggle-right { top: 40%; right: 8%; width: 60px; height: 25px; animation-delay: 2.5s; }
        .doodle-squiggle-right svg { stroke: var(--crayon-purple); stroke-width: 8; }

        .doodle-smiley { bottom: 20%; left: 12%; width: 60px; height: 40px; animation-delay: 1s; }
        .doodle-smiley svg { stroke: var(--crayon-blue); stroke-width: 8; }

        .doodle-dash-bottom {
          position: absolute;
          bottom: 18%;
          left: 22%;
          display: flex;
          gap: 6px;
          transform: rotate(-4deg);
        }
        .doodle-dash-bottom span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--crayon-yellow);
          opacity: 0.7;
          animation: dotPulse 2s ease-in-out infinite;
        }
        .doodle-dash-bottom span:nth-child(1) { animation-delay: 0s; }
        .doodle-dash-bottom span:nth-child(2) { animation-delay: 0.15s; }
        .doodle-dash-bottom span:nth-child(3) { animation-delay: 0.3s; }
        .doodle-dash-bottom span:nth-child(4) { animation-delay: 0.45s; }
        .doodle-dash-bottom span:nth-child(5) { animation-delay: 0.6s; }

        .doodle-crown { bottom: 15%; right: 12%; width: 65px; height: 55px; animation-delay: 3.5s; }
        .doodle-crown svg { stroke: var(--crayon-coral); stroke-width: 8; }

        .doodle-heart { bottom: 25%; right: 22%; width: 35px; height: 35px; animation-delay: 4.5s; }
        .doodle-heart svg { stroke: var(--crayon-pink); stroke-width: 7; fill: rgba(244, 114, 182, 0.2); }

        @keyframes floatDoodle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(4deg); }
        }

        /* =========================================================
           MAIN CONTENT
        ========================================================= */
        .content-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .logo-container {
          position: relative;
          width: 180px;
          height: 180px;
          margin-bottom: 20px; 
          display: flex;
          align-items: center;
          justify-content: center;
          animation: logoPop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
        }

        .logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0px 10px 15px rgba(16, 42, 67, 0.15));
          position: relative;
          z-index: 2;
        }

        @keyframes logoPop {
          from { opacity: 0; transform: scale(0.7) rotate(-8deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          margin-bottom: 22px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.75);
          border: 1.5px solid rgba(16, 42, 67, 0.12);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--navy);
          opacity: 0;
          animation: fadeInUp 0.7s ease-out 0.35s forwards, glowPulse 2.4s ease-in-out 1.2s infinite;
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 126, 103, 0); }
          50% { box-shadow: 0 0 14px 2px rgba(255, 126, 103, 0.18); }
        }

        .eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--crayon-coral);
          animation: dotPulse 1.6s ease-in-out infinite;
        }

        .headline {
          font-size: clamp(36px, 6vw, 64px);
          line-height: 1.2;
          font-weight: 700;
          color: var(--navy);
          letter-spacing: -0.02em;
          margin-bottom: 18px;
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
        }

        .headline .accent {
          position: relative;
          display: inline-block;
        }

        .headline .accent::after {
          content: "";
          position: absolute;
          left: -2%;
          bottom: -6px;
          width: 104%;
          height: 14px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 20' preserveAspectRatio='none'%3E%3Cpath d='M2,14 C30,6 55,18 80,10 C105,3 130,16 155,9 C170,5 185,12 198,8' stroke='%23FFCA28' stroke-width='7' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: 100% 100%;
          transform-origin: left center;
          transform: scaleX(0);
          animation: drawLine 0.8s cubic-bezier(0.65, 0, 0.35, 1) 1.1s forwards;
        }

        @keyframes drawLine {
          to { transform: scaleX(1); }
        }

        .subtext {
          max-width: 480px;
          margin: 0 auto;
          font-size: 16px;
          line-height: 1.7;
          color: #55647c;
          font-weight: 400;
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.8s forwards;
        }

        .subtext strong {
          color: var(--navy);
          font-weight: 700;
        }

        .footer-mark {
          margin-top: 30px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--navy);
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 1s forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* =========================================================
           MOBILE RESPONSIVE
        ========================================================= */
        @media (max-width: 768px) {
          .headline { font-size: clamp(28px, 8vw, 42px); }
          .subtext { font-size: 14px; }
          .logo-container { width: 140px; height: 140px; }
          
          .doodle-cloud { top: 8%; left: 5%; width: 60px; }
          .doodle-plane { top: 6%; right: 5%; width: 70px; }
          
          .doodle-star-1 { top: 15%; left: 10%; width: 30px; }
          .doodle-star-2 { top: 20%; left: 5%; width: 20px; }
          .doodle-star-3 { top: 12%; right: 12%; width: 25px; }
          .doodle-star-4 { bottom: 18%; left: 20%; width: 20px; }
          
          .doodle-squiggle-left { top: 48%; left: 4%; width: 35px; }
          .doodle-squiggle-right { top: 42%; right: 4%; width: 40px; }
          
          .doodle-smiley { bottom: 10%; left: 6%; width: 45px; }
          .doodle-dash-bottom { bottom: 8%; left: 16%; }
          
          .doodle-crown { bottom: 8%; right: 6%; width: 45px; }
          .doodle-heart { bottom: 18%; right: 12%; width: 25px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .doodle, .logo-container, .eyebrow, .headline, .subtext, .footer-mark, .headline .accent::after, .eyebrow-dot, .doodle-plane-dots span, .doodle-dash-bottom span {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <svg className="svg-defs">
        <defs>
          <filter id="crayon-texture" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="0.3" result="blur" />
            <feComponentTransfer in="blur">
              <feFuncA type="linear" slope="0.9" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <div className="doodle doodle-cloud">
        <svg viewBox="0 0 100 50">
          <path d="M20,40 Q5,40 10,25 Q15,10 30,15 Q40,0 60,10 Q80,5 85,25 Q100,30 90,40 Z" />
        </svg>
      </div>

      <div className="doodle doodle-plane">
        <svg viewBox="0 0 100 100">
          <path d="M10,50 L90,10 L60,90 L45,60 Z" />
          <path d="M90,10 L45,60" />
        </svg>
        <div className="doodle-plane-dots">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>

      <div className="doodle doodle-star-1">
        <svg viewBox="0 0 100 100">
          <path d="M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z" />
        </svg>
      </div>
      <div className="doodle doodle-star-2">
        <svg viewBox="0 0 100 100">
          <path d="M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z" />
        </svg>
      </div>
      <div className="doodle doodle-star-3">
        <svg viewBox="0 0 100 100">
          <path d="M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z" />
        </svg>
      </div>
      <div className="doodle doodle-star-4">
        <svg viewBox="0 0 100 100">
          <path d="M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z" />
        </svg>
      </div>

      <div className="doodle doodle-squiggle-left">
        <svg viewBox="0 0 50 20">
          <path d="M0,10 Q12.5,0 25,10 T50,10" />
        </svg>
      </div>
      <div className="doodle doodle-squiggle-right">
        <svg viewBox="0 0 50 20">
          <path d="M0,10 Q12.5,0 25,10 T50,10" />
        </svg>
      </div>

      <div className="doodle doodle-smiley">
        <svg viewBox="0 0 60 40">
          <path d="M5,20 Q5,35 30,35 Q55,35 55,20" />
          <path d="M15,10 L15,15" />
          <path d="M45,10 L45,15" />
        </svg>
      </div>
      <div className="doodle-dash-bottom">
        <span></span><span></span><span></span><span></span><span></span>
      </div>

      <div className="doodle doodle-crown">
        <svg viewBox="0 0 60 50">
          <path d="M5,40 L5,20 L20,30 L30,10 L40,30 L55,20 L55,40 Z" />
        </svg>
      </div>
      <div className="doodle doodle-heart">
        <svg viewBox="0 0 50 50">
          <path d="M25,45 Q5,25 5,15 Q5,5 15,5 Q25,5 25,15 Q25,5 35,5 Q45,5 45,15 Q45,25 25,45 Z" />
        </svg>
      </div>

      <div className="content-wrapper">
        <div className="logo-container">
          <img src="/sharx-logo.webp" alt="SHARX" className="logo-img" />
        </div>

        <div className="eyebrow">
          <span className="eyebrow-dot" />
          Landing today
        </div>

        <h1 className="headline">
          A new chapter of <br />
          <span className="accent">SHARX</span> is coming.
        </h1>

        <p className="subtext">
          We&apos;re redrawing the whole experience — <strong>brighter</strong>,
          bolder, and made just for you. Hang tight.
        </p>

        <div className="footer-mark">SHARX</div>
      </div>
    </main>
  );
}