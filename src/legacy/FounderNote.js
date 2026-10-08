"use client";

// src/legacy/FounderNote.js — SHARX · Crayon Deluxe
//
// FounderNoteCard + FounderNoteModal with EN / HINGLISH support.
// - Compact crayon homepage card with doodles, washi tape, smiley
// - Full-screen scrollable modal with 8 sections
// - Language switch inside modal (EN / HINGLISH) — no reload, no close
// - IntersectionObserver reveals
// - Scroll progress bar at the top of the modal
// - prefers-reduced-motion → all motion disabled

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./FounderNote.css";

/* ═══════════════════════════════════════════
   LANGUAGE COPY
═══════════════════════════════════════════ */
const COPY = {
  english: {
    card: {
      eyebrow: "A NOTE FROM THE PERSON BEHIND SHARX",
      titlePrefix: "Hey ",
      titleHighlight: "everyone",
      titleSuffix: ".",
      copy:
        "I know I haven't been able to give SHARX as much time as I want to lately. There's a reason — and I want to tell you honestly.",
      cta: "Read my note",
      support: "A few minutes. One honest update.",
    },
    modal: {
      from: "FROM THE PERSON BUILDING SHARX",
      headlinePrefix: "A little note from the person ",
      headlineEm: "behind",
      headlineSuffix: " SHARX.",
      opening: "I have a few things I want to share with all of you.",
      footerThanks: "Thank you for reading. ❤️",
      langLabel: "Language",
    },
    sections: [
      {
        id: "s01",
        label: "01 — FIRST, I'M SORRY.",
        kind: "plain",
        accent: "yellow",
        paragraphs: [
          "Hey everyone.",
          "First of all, thank you for being here.",
          "I know I haven't been able to give SHARX as much time as I want to lately.",
          { text: "And honestly, I'm sorry for that.", emphasis: "underline-yellow" },
        ],
      },
      {
        id: "s02",
        label: "02 — WHERE DOES THE TIME GO?",
        kind: "time",
        accent: "blue",
        paragraphs: [
          "My BCA classes, practicals, assignments and college work take up almost my entire day.",
          "By the time I get home, it's already quite late.",
          "Then I eat, rest a little, and sometimes very little time is left for SHARX.",
        ],
      },
      {
        id: "s03",
        label: "03 — BUT I HAVEN'T STOPPED.",
        kind: "big-line",
        accent: "coral",
        big: "Please don't think I've stopped working on SHARX.",
        bigAfter: "I haven't.",
        paragraphs: [
          "I have a lot of things in my mind for SHARX — new features, updates and ideas that I genuinely want to bring here.",
          "I just haven't been able to work on them as quickly as I want to.",
        ],
      },
      {
        id: "s04",
        label: "04 — ABOUT THE EVENT",
        kind: "event",
        accent: "lilac",
        paragraphs: [
          "If you saw the event announcement and wondered whether it's actually going to happen —",
          { text: "Yes. It is.", emphasis: "strong" },
          "It's real, and I'm working on it right now.",
          "I'm just not ready to reveal every detail yet.",
        ],
        after: [
          "One of the things I'm working on is a system where the time you spend playing games and completing certain activities on SHARX can count toward rewards.",
          "I'm also working on how that activity and time will be tracked, how rewards will be credited to your account, and how withdrawals will work.",
          "There are more things being worked on alongside this.",
          "When everything is ready, you'll know more.",
        ],
      },
      {
        id: "s05",
        label: "05 — I KNOW THE GAMES AREN'T PERFECT.",
        kind: "list",
        accent: "mint",
        paragraphs: [
          "I know the games currently on SHARX aren't as good as they should be.",
          { text: "And honestly, I'm not completely happy with them either.", emphasis: "underline-coral" },
          "There are many better games I want to bring to SHARX.",
          "Right now, my budget is limited, so I can't bring as many good games as I want to.",
          "I'm trying to improve this over time.",
        ],
        after: [
          "Right now, the SHARX experience is better on laptop or desktop than on mobile.",
          "I know mobile still needs work.",
          "I'm aware of that, and I want to improve it too.",
        ],
      },
      {
        id: "s06",
        label: "06 — WHAT YOU DON'T SEE",
        kind: "night",
        accent: "dark",
        paragraphs: [
          "Almost my entire day goes into college.",
          "And even after coming home, I try to find time for SHARX.",
          "Sometimes, if I'm not too tired, I work on SHARX until 12 or 1 AM.",
          "And if I'm completely exhausted, I sleep.",
          "This isn't an excuse.",
          "I just want you to understand what's actually happening behind SHARX — the part you don't normally see.",
        ],
        big: "Because I genuinely want to build SHARX.",
      },
      {
        id: "s07",
        label: "07 — WHERE I WANT TO TAKE SHARX",
        kind: "forward",
        accent: "yellow",
        paragraphs: [
          "This is still just the beginning.",
          "I know SHARX has a long way to go.",
          "But I have a lot of hope for SHARX.",
          "I want to take SHARX much further and make it genuinely very good.",
          "I have many ideas about the direction I want to take it in.",
          "And this journey has only just started.",
        ],
        big: "This is still the beginning.",
      },
      {
        id: "s08",
        label: "08 — THANK YOU FOR STAYING.",
        kind: "closing",
        accent: "mint",
        paragraphs: [
          "This is still just the beginning.",
          "If you're still here, still playing, still exploring SHARX, or even just checking in from time to time —",
          "Thank you.",
          "Your time, your patience and your feedback matter to me more than you probably realize.",
          "I may not be able to give SHARX as much time as I want to right now.",
          { text: "But I'm not giving up on SHARX.", emphasis: "underline-yellow" },
          "I'll keep learning.",
          "I'll keep building.",
          "I'll keep improving.",
          "I'm doing my best, and I genuinely want SHARX to go far.",
        ],
        signature: { name: "— Vishal", title: "FOUNDER & CREATOR, SHARX" },
      },
    ],
  },

  hinglish: {
    card: {
      eyebrow: "SHARX BANANE WALE KI TARAF SE EK NOTE",
      titlePrefix: "Hey ",
      titleHighlight: "everyone",
      titleSuffix: ".",
      copy:
        "Mujhe pata hai ki lately main SHARX ko utna time nahi de pa raha hoon jitna main dena chahta hoon. Iski ek wajah hai — aur main aapko honestly batana chahta hoon.",
      cta: "Mera note padho",
      support: "Kuch minute. Ek honest update.",
    },
    modal: {
      from: "SHARX BANA RAHE PERSON KI TARAF SE",
      headlinePrefix: "SHARX ke ",
      headlineEm: "peeche",
      headlineSuffix: " wale person ki chhoti si note.",
      opening: "Aap sabse mujhe kuch baatein kehni hain.",
      footerThanks: "Padhne ke liye thank you. ❤️",
      langLabel: "Language",
    },
    sections: [
      {
        id: "s01",
        label: "01 — SABSE PEHLE, SORRY.",
        kind: "plain",
        accent: "yellow",
        paragraphs: [
          "Hey everyone.",
          "Sabse pehle, yahan hone ke liye thank you.",
          "Mujhe pata hai ki lately main SHARX ko utna time nahi de pa raha hoon jitna main dena chahta hoon.",
          { text: "Aur honestly, iske liye mujhe sorry kehna hai.", emphasis: "underline-yellow" },
        ],
      },
      {
        id: "s02",
        label: "02 — TIME KAHAN CHALA JAATA HAI?",
        kind: "time",
        accent: "blue",
        paragraphs: [
          "Meri BCA classes, practicals, assignments aur college ka kaam mere din ka lagbhag poora time le lete hain.",
          "Jab tak main ghar pahunchta hoon, tab tak kaafi late ho chuka hota hai.",
          "Phir main khaata hoon, thoda rest karta hoon, aur kabhi-kabhi SHARX ke liye bahut hi kam time bach pata hai.",
        ],
      },
      {
        id: "s03",
        label: "03 — LEKIN MAINE SHARX CHHODA NAHI HAI.",
        kind: "big-line",
        accent: "coral",
        big: "Please ye mat sochna ki maine SHARX par kaam karna band kar diya hai.",
        bigAfter: "Maine nahi kiya.",
        paragraphs: [
          "SHARX ke liye mere dimaag mein bahut saari cheezein hain — naye features, updates aur ideas, jinhe main genuinely yahan lana chahta hoon.",
          "Bas main un sab par utni jaldi kaam nahi kar pa raha hoon jitni jaldi main chahta hoon.",
        ],
      },
      {
        id: "s04",
        label: "04 — EVENT KE BAARE MEIN",
        kind: "event",
        accent: "lilac",
        paragraphs: [
          "Agar aapne event announcement dekha hai aur socha hai ki ye sach mein hone wala hai ya nahi —",
          { text: "Haan. Ho raha hai.", emphasis: "strong" },
          "Ye real hai, aur main abhi ispar kaam kar raha hoon.",
          "Bas main abhi iski har detail reveal karne ke liye ready nahi hoon.",
        ],
        after: [
          "Ek cheez jispar main kaam kar raha hoon — ek aisa system jisme aap SHARX par games khelne aur kuch activities complete karne mein jo time spend karte ho, woh rewards ke liye count ho sake.",
          "Main ye bhi dekh raha hoon ki activity aur time ko kaise track kiya jayega, rewards aapke account mein kaise credit honge, aur withdrawals kaise kaam karenge.",
          "Aur bhi kuch cheezein iske saath work ho rahi hain.",
          "Jab sab ready hoga, tab aapko aur pata chalega.",
        ],
      },
      {
        id: "s05",
        label: "05 — MUJHE PATA HAI, GAMES PERFECT NAHI HAIN.",
        kind: "list",
        accent: "mint",
        paragraphs: [
          "Mujhe pata hai ki abhi SHARX par jo games hain, woh utne acche nahi hain jitne hone chahiye.",
          { text: "Aur honestly, main khud bhi unse completely happy nahi hoon.", emphasis: "underline-coral" },
          "Bahut saari better games hain jo main SHARX par lana chahta hoon.",
          "Abhi mera budget limited hai, isliye main utni acchi games nahi la pa raha hoon jitni main chahta hoon.",
          "Main time ke saath ise improve karne ki koshish kar raha hoon.",
        ],
        after: [
          "Abhi SHARX ka experience laptop ya desktop par mobile se better hai.",
          "Mujhe pata hai ki mobile par abhi bhi kaam chahiye.",
          "Main iske baare mein aware hoon, aur ise improve karna bhi chahta hoon.",
        ],
      },
      {
        id: "s06",
        label: "06 — JO AAP NAHI DEKHTE.",
        kind: "night",
        accent: "dark",
        paragraphs: [
          "Mera almost poora din college mein nikal jaata hai.",
          "Aur ghar aane ke baad bhi main SHARX ke liye time nikalne ki koshish karta hoon.",
          "Kabhi-kabhi, agar main zyada tired nahi hoon, toh main raat ke 12 ya 1 baje tak SHARX par kaam karta hoon.",
          "Aur agar main completely exhausted hoon, toh so jaata hoon.",
          "Ye koi excuse nahi hai.",
          "Main bas chahta hoon ki aap samjho ki SHARX ke peeche actually kya ho raha hai, jo aapko normally dikhai nahi deta.",
        ],
        big: "Kyunki main genuinely SHARX ko build karna chahta hoon.",
      },
      {
        id: "s07",
        label: "07 — MAIN SHARX KO KAHAN LE JAANA CHAHTA HOON.",
        kind: "forward",
        accent: "yellow",
        paragraphs: [
          "Ye abhi bhi sirf shuruaat hai.",
          "Mujhe pata hai ki SHARX ko abhi bahut aage jaana hai.",
          "Lekin mujhe SHARX se bahut umeed hai.",
          "Main SHARX ko bahut aage le jaana chahta hoon aur ise genuinely bahut accha banana chahta hoon.",
          "Mere paas bahut saare ideas hain ki main SHARX ko aage kis direction mein le jaana chahta hoon.",
          "Aur ye journey abhi shuru hi hui hai.",
        ],
        big: "Ye abhi bhi sirf shuruaat hai.",
      },
      {
        id: "s08",
        label: "08 — STAY KARNE KE LIYE THANK YOU.",
        kind: "closing",
        accent: "mint",
        paragraphs: [
          "Ye abhi bhi sirf shuruaat hai.",
          "Agar aap abhi bhi yahan ho, abhi bhi khel rahe ho, SHARX explore kar rahe ho, ya kabhi-kabhi check karne aate ho —",
          "Thank you.",
          "Aapka time, aapka patience aur aapka feedback mere liye shayad usse bhi zyada matter karta hai jitna aap sochte ho.",
          "Ho sakta hai main abhi SHARX ko utna time na de pa raha hoon jitna main dena chahta hoon.",
          { text: "Lekin main SHARX ko chhod nahi raha.", emphasis: "underline-yellow" },
          "Main seekhta rahunga.",
          "Main banata rahunga.",
          "Main improve karta rahunga.",
          "Main apna best kar raha hoon, aur main genuinely chahta hoon ki SHARX bahut aage jaaye.",
        ],
        signature: { name: "— Vishal", title: "FOUNDER & CREATOR, SHARX" },
      },
    ],
  },
};

/* ═══════════════════════════════════════════
   PARAGRAPH RENDERER
═══════════════════════════════════════════ */
function Paragraph({ p, i }) {
  if (typeof p === "string") {
    return <p className="shx-note-p" key={i}>{p}</p>;
  }
  return (
    <p className={`shx-note-p shx-note-p-${p.emphasis || "normal"}`} key={i}>
      {p.text}
    </p>
  );
}

/* ═══════════════════════════════════════════
   SINGLE SECTION
═══════════════════════════════════════════ */
function Section({ section, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`shx-note-section shx-note-section-${section.kind} ${
        visible ? "is-in" : ""
      }`}
      style={{ "--shx-delay": `${Math.min(index * 40, 160)}ms` }}
      aria-labelledby={`shx-${section.id}-label`}
    >
      <span
        id={`shx-${section.id}-label`}
        className={`shx-note-label shx-note-label-${section.accent}`}
      >
        <span className="shx-note-label-dot" aria-hidden="true" />
        {section.label}
      </span>

      {section.big && section.kind !== "big-line" && (
        <p className="shx-note-big">{section.big}</p>
      )}

      {section.kind === "big-line" && (
        <>
          <p className="shx-note-big">{section.big}</p>
          <p className="shx-note-big shx-note-big-emph">{section.bigAfter}</p>
        </>
      )}

      {section.paragraphs?.map((p, i) => (
        <Paragraph key={i} p={p} i={i} />
      ))}

      {section.after?.map((p, i) => (
        <Paragraph key={`a-${i}`} p={p} i={`a-${i}`} />
      ))}

      {section.signature && (
        <footer className="shx-note-sign">
          <span className="shx-note-sign-name">{section.signature.name}</span>
          <span className="shx-note-sign-title">{section.signature.title}</span>
        </footer>
      )}

      {section.kind === "time" && (
        <div className="shx-note-motif shx-note-motif-time" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="shx-note-motif-time-dot"
              style={{ "--i": i }}
            />
          ))}
        </div>
      )}

      {section.kind === "event" && (
        <div className="shx-note-motif shx-note-motif-event" aria-hidden="true">
          <span className="shx-note-motif-event-pill">BEING WORKED ON</span>
        </div>
      )}

      {section.kind === "list" && (
        <div className="shx-note-motif shx-note-motif-list" aria-hidden="true">
          <span className="shx-note-motif-list-row" />
          <span className="shx-note-motif-list-row" />
          <span className="shx-note-motif-list-row" />
        </div>
      )}

      {section.kind === "forward" && (
        <div className="shx-note-motif shx-note-motif-forward" aria-hidden="true">
          <svg
            viewBox="0 0 120 24"
            width="120"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="12" x2="100" y2="12" />
            <polyline points="92 4 104 12 92 20" />
          </svg>
        </div>
      )}

      {section.kind === "night" && (
        <div className="shx-note-night-decor" aria-hidden="true">
          <span className="shx-note-night-star shx-note-night-star-1" />
          <span className="shx-note-night-star shx-note-night-star-2" />
          <span className="shx-note-night-star shx-note-night-star-3" />
          <span className="shx-note-night-moon" />
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════
   LANGUAGE SWITCH
═══════════════════════════════════════════ */
function LanguageSwitch({ language, onChange, label }) {
  return (
    <div className="shx-note-lang" role="group" aria-label={label}>
      <span className="shx-note-lang-icon" aria-hidden="true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2 a15.3 15.3 0 0 1 4 10 a15.3 15.3 0 0 1 -4 10 a15.3 15.3 0 0 1 -4 -10 a15.3 15.3 0 0 1 4 -10 z" />
        </svg>
      </span>
      <button
        type="button"
        className={`shx-note-lang-btn ${
          language === "english" ? "is-active" : ""
        }`}
        onClick={() => onChange("english")}
        aria-pressed={language === "english"}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        className={`shx-note-lang-btn ${
          language === "hinglish" ? "is-active" : ""
        }`}
        onClick={() => onChange("hinglish")}
        aria-pressed={language === "hinglish"}
        aria-label="Switch to Hinglish"
      >
        HINGLISH
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HOMEPAGE CARD — Crayon Deluxe
═══════════════════════════════════════════ */
export const FounderNoteCard = memo(function FounderNoteCard({ onOpen }) {
  const card = COPY.english.card;
  return (
    <section className="shx-fnc" aria-labelledby="shx-fnc-title">
      {/* paper texture layers */}
      <span className="shx-fnc-fibers" aria-hidden="true" />
      <span className="shx-fnc-dots" aria-hidden="true" />

      {/* warm crayon blobs */}
      <span className="shx-fnc-blob shx-fnc-blob-1" aria-hidden="true" />
      <span className="shx-fnc-blob shx-fnc-blob-2" aria-hidden="true" />

      {/* washi tape corners */}
      <span className="shx-fnc-tape shx-fnc-tape-1" aria-hidden="true" />
      <span className="shx-fnc-tape shx-fnc-tape-2" aria-hidden="true" />

      {/* crayon doodles */}
      <svg
        className="shx-fnc-doodle shx-fnc-doodle-star-1"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2 L14 9 L21 9 L15.5 13.5 L17.5 21 L12 16.5 L6.5 21 L8.5 13.5 L3 9 L10 9 Z" />
      </svg>
      <svg
        className="shx-fnc-doodle shx-fnc-doodle-star-2"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2 L14 9 L21 9 L15.5 13.5 L17.5 21 L12 16.5 L6.5 21 L8.5 13.5 L3 9 L10 9 Z" />
      </svg>
      <svg
        className="shx-fnc-doodle shx-fnc-doodle-heart"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21 C 4 15, 2 10, 5 6.5 C 7.5 3.5, 11 4, 12 7 C 13 4, 16.5 3.5, 19 6.5 C 22 10, 20 15, 12 21 Z" />
      </svg>
      <span className="shx-fnc-doodle shx-fnc-doodle-dot-1" aria-hidden="true">
        <svg viewBox="0 0 12 12" width="100%" height="100%">
          <circle cx="6" cy="6" r="4" fill="currentColor" />
        </svg>
      </span>
      <span className="shx-fnc-doodle shx-fnc-doodle-dot-2" aria-hidden="true">
        <svg viewBox="0 0 12 12" width="100%" height="100%">
          <circle cx="6" cy="6" r="4" fill="currentColor" />
        </svg>
      </span>
      <svg
        className="shx-fnc-doodle shx-fnc-doodle-squiggle"
        viewBox="0 0 90 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M2 8 Q 14 2, 26 8 T 50 8 T 74 8 T 88 8" />
      </svg>

      <header className="shx-fnc-head">
        <span className="shx-fnc-eyebrow">
          <span className="shx-fnc-eyebrow-dot" aria-hidden="true" />
          {card.eyebrow}
        </span>

        <h2 id="shx-fnc-title" className="shx-fnc-title">
          <span className="shx-fnc-title-spark" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="100%"
              height="100%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
              <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
              <path d="M8.5 14 Q 12 17.5, 15.5 14" />
            </svg>
          </span>
          <span>
            {card.titlePrefix}
            <span className="shx-fnc-title-hl">{card.titleHighlight}</span>
            {card.titleSuffix}
          </span>
        </h2>

        <p className="shx-fnc-copy">{card.copy}</p>
      </header>

      <footer className="shx-fnc-foot">
        <button
          type="button"
          className="shx-fnc-cta"
          onClick={onOpen}
          aria-label="Read the full note from Vishal"
        >
          <span className="shx-fnc-cta-text">{card.cta}</span>
          <span className="shx-fnc-cta-arrow" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </button>

        <span className="shx-fnc-support">
          <span className="shx-fnc-support-dot" aria-hidden="true" />
          {card.support}
        </span>
      </footer>
    </section>
  );
});

/* ═══════════════════════════════════════════
   MODAL
═══════════════════════════════════════════ */
export const FounderNoteModal = memo(function FounderNoteModal({
  open,
  onClose,
}) {
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState("english");
  const [fading, setFading] = useState(false);
  const scrollRef = useRef(null);

  const copy = COPY[language];
  const modalCopy = copy.modal;

  const handleClose = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      onClose?.();
    }, 240);
  }, [onClose]);

  /* Body scroll lock */
  useEffect(() => {
    if (!open) return undefined;
    const scrollY = window.scrollY || window.pageYOffset;
    const { body } = document;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  /* Escape closes */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  /* Scroll to top on open + reset progress */
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setProgress(0);
    }
  }, [open]);

  /* Scroll progress */
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const p = max > 0 ? (el.scrollTop / max) * 100 : 0;
    setProgress(p);
  }, []);

  const progressWidth = useMemo(
    () => `${Math.min(100, Math.max(0, progress))}%`,
    [progress]
  );

  /* Language switch — preserves scroll, short crossfade */
  const handleLanguageChange = useCallback(
    (next) => {
      if (next === language) return;
      setFading(true);
      window.setTimeout(() => {
        setLanguage(next);
        setFading(false);
      }, 160);
    },
    [language]
  );

  if (!open) return null;

  return (
    <div
      className={`shx-note-overlay ${closing ? "is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shx-note-heading"
      onClick={handleClose}
    >
      <div
        className="shx-note-modal"
        onClick={(e) => e.stopPropagation()}
        ref={scrollRef}
        onScroll={onScroll}
      >
        {/* Top bar: progress + language + close */}
        <div className="shx-note-topbar">
          <div className="shx-note-progress" aria-hidden="true">
            <span
              className="shx-note-progress-fill"
              style={{ width: progressWidth }}
            />
          </div>
          <div className="shx-note-toolbar">
            <LanguageSwitch
              language={language}
              onChange={handleLanguageChange}
              label={modalCopy.langLabel}
            />
            <button
              type="button"
              className="shx-note-close"
              onClick={handleClose}
              aria-label="Close the note"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>
        </div>

        <div className="shx-note-paper">
          {/* corner ornaments */}
          <span className="shx-note-ornament shx-note-ornament-tl" aria-hidden="true" />
          <span className="shx-note-ornament shx-note-ornament-tr" aria-hidden="true" />
          <span className="shx-note-ornament shx-note-ornament-bl" aria-hidden="true" />
          <span className="shx-note-ornament shx-note-ornament-br" aria-hidden="true" />

          <header className="shx-note-hero">
            <span className="shx-note-from">
              <span className="shx-note-from-dot" aria-hidden="true" />
              {modalCopy.from}
            </span>
            <h1 id="shx-note-heading" className="shx-note-headline">
              {modalCopy.headlinePrefix}
              <em>{modalCopy.headlineEm}</em>
              {modalCopy.headlineSuffix}
            </h1>
            <p className="shx-note-opening">{modalCopy.opening}</p>
          </header>

          <div
            className={`shx-note-body shx-note-langfade ${
              fading ? "is-fading" : ""
            }`}
          >
            {copy.sections.map((s, i) => (
              <Section key={s.id} section={s} index={i} />
            ))}
          </div>

          <footer className="shx-note-footer">
            <span className="shx-note-footer-line" aria-hidden="true" />
            <p className="shx-note-footer-thanks">{modalCopy.footerThanks}</p>
          </footer>
        </div>
      </div>
    </div>
  );
});

export default FounderNoteCard;