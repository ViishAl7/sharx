"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, ChevronDown, Send, Mail, MessageCircle,
  Camera, Play, Gamepad2, Bug, Handshake,
  Lightbulb, CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [activeTopic, setActiveTopic] = useState("General");
  const [openFaq, setOpenFaq] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [seenSections, setSeenSections] = useState(new Set([0]));
  const sectionRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) return;

    try {
      const response = await fetch("http://localhost:5001/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          topic: activeTopic,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            name: "",
            email: "",
            message: "",
          });
        }, 3000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const observers = [];
    sectionRefs.forEach((ref, index) => {
      if (!ref.current) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(index);
              setSeenSections(prev => {
                const next = new Set(prev);
                next.add(index);
                return next;
              });
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(ref.current);
      observers.push(observer);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const goTo = (i) => {
    if (i < 0 || i > 3) return;
    if (sectionRefs[i]?.current) {
      sectionRefs[i].current.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(i);
      setSeenSections(prev => {
        const next = new Set(prev);
        next.add(i);
        return next;
      });
    }
  };

  const topics = [
    { label: "General", icon: <MessageCircle size={13} strokeWidth={2} /> },
    { label: "Bug Report", icon: <Bug size={13} strokeWidth={2} /> },
    { label: "Game Request", icon: <Gamepad2 size={13} strokeWidth={2} /> },
    { label: "Partnership", icon: <Handshake size={13} strokeWidth={2} /> },
    { label: "Feedback", icon: <Lightbulb size={13} strokeWidth={2} /> },
  ];

  const faqs = [
    { q: "Are all Sharx games free?", a: "Yes — every game on Sharx is 100% free. No hidden charges, no subscriptions, nothing." },
    { q: "Do I need an account to play?", a: "No. You can play any game without signing up. An account is only needed for leaderboards and tracking your score." },
    { q: "How quickly will I get support?", a: "We try to respond as fast as possible. Send us a message using the form and we will get back to you shortly." },
    { q: "How do I report a bug or request a game?", a: "Use the form above — select Bug Report or Game Request, describe the issue or game you want, and we will look into it." },
  ];

  const connects = [
   
  ];

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

:root {
  --navy: #1a2e44;
  --navy60: rgba(26,46,68,0.6);
  --navy40: rgba(26,46,68,0.4);
  --navy12: rgba(26,46,68,0.12);
  --navy06: rgba(26,46,68,0.06);
  --white80: rgba(255,255,255,0.8);
  --white60: rgba(255,255,255,0.6);
  --white50: rgba(255,255,255,0.5);
  --radius-pill: 999px;
  --radius-card: 24px;
  --radius-input: 16px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 100px;
  width: auto;
  object-fit: contain;
}

.cw {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'Plus Jakarta Sans', sans-serif;
  scroll-behavior: smooth;
}
.cw::-webkit-scrollbar { display: none; }

.section {
  min-height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 80px;
  padding-bottom: 64px;
}

.s1 { background: linear-gradient(135deg,#f0f9ff 0%,#dbeafe 100%); }
.s2 { background: linear-gradient(135deg,#faf5ff 0%,#ede9fe 100%); }
.s3 { background: linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%); }
.s4 { background: linear-gradient(135deg,#ecfeff 0%,#cffafe 100%); }

@keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
@keyframes fadeLeft { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:none} }
@keyframes fadeRight { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:none} }
@keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:none} }
@keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
@keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(18px)} }

.hero-content > *,
.form-left > *,
.form-right,
.connect-content > *,
.faq-left > * {
  opacity: 0;
}

.seen .hero-content h1 { animation: fadeUp 0.55s ease forwards 0.00s; }
.seen .hero-content p { animation: fadeUp 0.55s ease forwards 0.10s; }
.seen .hero-content .cta { animation: scaleIn 0.50s ease forwards 0.20s; }

.seen .form-left h2 { animation: fadeLeft 0.50s ease forwards 0.00s; }
.seen .form-left p { animation: fadeLeft 0.50s ease forwards 0.08s; }
.seen .form-left .chips { animation: fadeLeft 0.50s ease forwards 0.16s; }
.seen .form-right { animation: fadeRight 0.55s ease forwards 0.12s; }

.seen .connect-content h2 { animation: fadeUp 0.50s ease forwards 0.00s; }
.seen .connect-content p { animation: fadeUp 0.50s ease forwards 0.08s; }
.seen .connect-grid { animation: fadeUp 0.50s ease forwards 0.16s; }
.seen .coming-soon { animation: fadeUp 0.55s ease forwards 0.30s; }

.seen .faq-left h2 { animation: fadeLeft 0.50s ease forwards 0.00s; }
.seen .faq-left p { animation: fadeLeft 0.50s ease forwards 0.08s; }
.seen .faq-left .cta { animation: scaleIn 0.50s ease forwards 0.16s; }
.seen .faq-right { animation: fadeRight 0.55s ease forwards 0.12s; }

.blobs {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.22;
}
.s1 .blob:nth-child(1){animation:floatA 8s ease-in-out infinite;background:#4fd1c5;width:42%;height:46%;left:18%;top:18%;}
.s1 .blob:nth-child(2){animation:floatB 10s ease-in-out infinite;background:#b794f4;width:32%;height:36%;left:64%;top:40%;}
.s1 .blob:nth-child(3){animation:floatA 12s ease-in-out infinite;background:#f6e05e;width:26%;height:30%;left:38%;top:68%;}
.s2 .blob:nth-child(1){animation:floatB 9s ease-in-out infinite;background:#b794f4;width:40%;height:44%;left:8%;top:22%;}
.s2 .blob:nth-child(2){animation:floatA 11s ease-in-out infinite;background:#9f7aea;width:30%;height:34%;left:58%;top:14%;}
.s3 .blob:nth-child(1){animation:floatA 7s ease-in-out infinite;background:#f6e05e;width:38%;height:42%;left:14%;top:18%;}
.s3 .blob:nth-child(2){animation:floatB 13s ease-in-out infinite;background:#ed8936;width:28%;height:32%;left:63%;top:48%;}
.s4 .blob:nth-child(1){animation:floatB 10s ease-in-out infinite;background:#63b3ed;width:44%;height:48%;left:4%;top:16%;}
.s4 .blob:nth-child(2){animation:floatA 14s ease-in-out infinite;background:#4299e1;width:30%;height:34%;left:64%;top:33%;}

.navbar {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 1160px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: 0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
  z-index: 999;
  height: 60px;
}
.logo {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--navy);
  user-select: none;
  background: transparent;
}
.nav-btn {
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--navy);
  background: var(--navy06);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.nav-btn:hover { background: var(--navy12); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.nav-btn:active { transform: scale(0.97); }

.dots {
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(26,46,68,0.22);
  cursor: pointer;
  transition: all 0.2s;
}
.dot.active { background: var(--navy); transform: scale(1.7); }
.dot:hover:not(.active) { background: rgba(26,46,68,0.45); transform: scale(1.3); }

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(0,0,0,0.05);
  padding: 8px 20px;
  text-align: center;
  z-index: 500;
}
.footer p { color: var(--navy40); font-size: 11px; font-weight: 400; }
.footer a { color: var(--navy); text-decoration: none; font-weight: 600; margin: 0 6px; }
.footer a:hover { text-decoration: underline; }

.cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--navy);
  color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  padding: 13px 32px;
  border-radius: var(--radius-pill);
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(26,46,68,0.16);
}
.cta:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(26,46,68,0.26); }
.cta:active { transform: scale(0.98); }
.cta-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-wrap {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 680px;
  padding: 0 24px;
}
.hero-content h1 {
  font-size: clamp(38px,7vw,76px);
  font-weight: 800;
  color: var(--navy);
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin-bottom: 22px;
}
.hero-content p {
  font-size: clamp(15px,2.2vw,18px);
  color: var(--navy60);
  line-height: 1.65;
  max-width: 520px;
  margin: 0 auto 36px auto;
}

.form-layout {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1080px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  padding: 0 40px;
}
.form-left {
  flex: 0 0 auto;
  width: min(380px, 100%);
}
.form-left h2 {
  font-size: clamp(28px,4.5vw,52px);
  font-weight: 800;
  color: var(--navy);
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin-bottom: 14px;
}
.form-left p {
  font-size: 15px;
  color: var(--navy60);
  line-height: 1.6;
  margin-bottom: 24px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  background: var(--navy06);
  border: 1px solid rgba(26,46,68,0.08);
  color: var(--navy);
  cursor: pointer;
  transition: all 0.18s;
}
.chip.active { background: var(--navy); color: white; border-color: var(--navy); }
.chip:hover:not(.active) { background: var(--navy12); }

.form-right {
  flex: 1;
  min-width: 0;
  max-width: 440px;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-card);
  padding: 28px 24px;
  border: 1px solid rgba(255,255,255,0.75);
  box-shadow: 0 12px 32px rgba(0,0,0,0.05);
}
.success {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,200,150,0.1);
  border: 1px solid rgba(0,200,150,0.22);
  border-radius: 14px;
  padding: 10px 16px;
  margin-bottom: 16px;
  color: #00a86b;
  font-size: 13px;
  font-weight: 600;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}
.fi, .ft {
  width: 100%;
  padding: 11px 14px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(26,46,68,0.1);
  border-radius: var(--radius-input);
  color: var(--navy);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.18s, background 0.18s;
}
.fi:focus, .ft:focus { background: white; border-color: var(--navy); }
.ft { resize: none; height: 96px; margin-bottom: 14px; display: block; }
.sub-btn {
  width: 100%;
  padding: 13px;
  border-radius: var(--radius-pill);
  border: none;
  background: var(--navy);
  color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.sub-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(26,46,68,0.22); }

.connect-wrap {
  position: relative;
  z-index: 10;
  text-align: center;
  width: 100%;
  max-width: 840px;
  padding: 0 24px;
}

.connect-content h2 {
  font-size: clamp(36px,5vw,56px);
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.03em;
  margin-bottom: 8px;
}

.connect-content .subtitle {
  font-size: 17px;
  color: var(--navy60);
  font-weight: 500;
  margin-bottom: 32px;
}

.connect-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}

.connect-card {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 18px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.3s ease;
  text-align: left;
  cursor: default;
}

.connect-card:hover {
  transform: translateY(-4px) scale(1.02);
  background: rgba(255,255,255,0.95);
  box-shadow: 0 16px 32px rgba(0,0,0,0.08);
  border-color: rgba(255,255,255,0.9);
}

.c-ico {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.connect-card:hover .c-ico {
  transform: scale(1.1);
}

.c-info {
  flex: 1;
  min-width: 0;
}

.c-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 2px;
}

.c-handle {
  font-size: 11px;
  color: var(--navy40);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.c-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: 10px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.connect-card:hover .c-pill {
  transform: scale(1.05);
}

.coming-soon {
  max-width: 680px;
  margin: 0 auto;
  padding: 28px 32px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 20px;
  text-align: center;
  opacity: 0;
}

.seen .coming-soon {
  animation: fadeUp 0.6s ease forwards 0.3s;
}

.coming-soon p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--navy60);
  font-weight: 500;
}

.coming-soon strong {
  color: var(--navy);
  font-weight: 700;
}

/* ─── FAQ SECTION - EK DUM SUNDAR ─── */
.faq-layout {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 980px;
  display: flex;
  align-items: flex-start;
  gap: 64px;
  padding: 0 40px;
}

.faq-left {
  flex: 0 0 300px;
  padding-top: 8px;
}

.faq-left h2 {
  font-size: clamp(32px,4.5vw,52px);
  font-weight: 800;
  color: var(--navy);
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}

.faq-left p {
  font-size: 16px;
  color: var(--navy60);
  line-height: 1.6;
  margin-bottom: 28px;
}

.faq-right {
  flex: 1;
  min-width: 0;
}

.faq-item {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 50px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.faq-item:hover {
  background: rgba(255,255,255,0.9);
  border-color: rgba(255,255,255,0.8);
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}

.faq-q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  gap: 16px;
}

.faq-q span {
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
  line-height: 1.4;
  transition: color 0.3s ease;
}

.faq-item.open .faq-q span {
  color: #2c4a6e;
}

.faq-tog {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--navy06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--navy);
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-tog.open {
  transform: rotate(180deg);
  background: var(--navy);
  color: white;
}

.faq-answer-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
  opacity: 0;
}

.faq-answer-wrapper.open {
  max-height: 300px;
  opacity: 1;
}

.faq-a {
  padding: 0 22px 20px;
  font-size: 14px;
  color: var(--navy60);
  line-height: 1.7;
  padding-top: 4px;
}

@media (max-width: 1024px) {
  .dots { display: none; }
  .form-layout {
    flex-direction: column;
    align-items: center;
    padding: 0 28px;
    gap: 32px;
  }
  .form-left { width: 100%; text-align: center; max-width: 560px; }
  .chips { justify-content: center; }
  .form-right { max-width: 560px; width: 100%; }
  .faq-layout {
    flex-direction: column;
    align-items: center;
    padding: 0 28px;
    gap: 28px;
  }
  .faq-left { flex: none; width: 100%; max-width: 560px; text-align: center; }
  .faq-left .cta { display: none; }
  .faq-right { width: 100%; max-width: 560px; }
  .connect-grid { grid-template-columns: repeat(2, 1fr); max-width: 560px; }
}

@media (max-width: 640px) {
  .section { padding-top: 72px; padding-bottom: 56px; }
  .navbar { width: calc(100% - 20px); padding: 8px 14px; top: 10px; }
  .logo { font-size: 17px; }
  .nav-btn { height: 32px; padding: 0 12px; font-size: 12px; }
  .hero-wrap { padding: 0 20px; }
  .hero-content h1 { font-size: 36px; margin-bottom: 16px; }
  .hero-content p { font-size: 14px; margin-bottom: 28px; }
  .cta { font-size: 14px; padding: 12px 24px; }
  .form-layout { padding: 0 16px; gap: 24px; }
  .form-row { grid-template-columns: 1fr; gap: 8px; }
  .form-right { padding: 20px 16px; border-radius: 20px; }
  .chips { gap: 6px; }
  .chip { font-size: 11px; padding: 7px 12px; }
  .connect-wrap { padding: 0 16px; }
  .connect-grid { grid-template-columns: 1fr; gap: 10px; max-width: 100%; }
  .connect-card { border-radius: 16px; padding: 14px 16px; }
  .coming-soon { padding: 20px 18px; border-radius: 16px; }
  .coming-soon p { font-size: 13px; }
  .faq-layout { padding: 0 16px; gap: 20px; }
  .faq-right { width: 100%; max-width: 100%; }
  .faq-q { padding: 14px 16px; }
  .faq-q span { font-size: 13px; }
  .faq-a { font-size: 12px; padding: 0 16px 16px; }
  .footer { padding: 6px 12px; }
  .footer p { font-size: 10px; }
}

@media (max-width: 380px) {
  .hero-content h1 { font-size: 30px; }
  .connect-card { gap: 10px; padding: 12px; }
  .c-ico { width: 38px; height: 38px; border-radius: 12px; }
  .connect-content h2 { font-size: 28px; }
  .faq-q span { font-size: 12px; }
}
      `}</style>

      <div className="cw">
        <nav className="navbar">
          <div className="logo">
            <img src="/sharxbg.png" alt="SHARX Logo" />
          </div>
          <button className="nav-btn" onClick={() => window.history.back()}>
            <ArrowLeft size={12} strokeWidth={2.5} /> Back
          </button>
        </nav>

        <div className="dots">
          {[0,1,2,3].map(i => (
            <div
              key={i}
              className={`dot ${activeSection === i ? "active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <div className="footer">
          <p>
            © 2026 Sharx · All rights reserved.
            <Link href="/privacy">Privacy</Link>
          </p>
        </div>

        <div className={`section s1 ${seenSections.has(0) ? "seen" : ""}`} ref={sectionRefs[0]}>
          <div className="blobs">
            <div className="blob" />
            <div className="blob" />
            <div className="blob" />
          </div>
          <div className="hero-wrap">
            <div className="hero-content">
              <h1>Your voice<br />matters here.<br />Speak freely.</h1>
              <p>Real humans, real conversations. Found a bug? Have an idea? Just wanna say hi? We're listening — always.</p>
              <button className="cta" onClick={() => goTo(1)}>
                Let's roll!
                <span className="cta-icon"><ChevronDown size={15} strokeWidth={3} /></span>
              </button>
            </div>
          </div>
        </div>

        <div className={`section s2 ${seenSections.has(1) ? "seen" : ""}`} ref={sectionRefs[1]}>
          <div className="blobs">
            <div className="blob" />
            <div className="blob" />
          </div>
          <div className="form-layout">
            <div className="form-left">
              <h2>Send a<br />message.</h2>
              <p>Pick a topic below and fire away — we read every single message.</p>
              <div className="chips">
                {topics.map(t => (
                  <button
                    key={t.label}
                    className={`chip ${activeTopic === t.label ? "active" : ""}`}
                    onClick={() => setActiveTopic(t.label)}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-right">
              {submitted && (
                <div className="success">
                  <CheckCircle2 size={16} strokeWidth={2} />
                  Message sent! We'll reply soon.
                </div>
              )}
              <div className="form-row">
                <input
                  className="fi"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  className="fi"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <textarea
                className="ft"
                placeholder="Your message..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              />
              <button className="sub-btn" onClick={handleSubmit}>
                <Send size={15} strokeWidth={2.5} />
                {submitted ? "Sent!" : "Send Message"}
              </button>
            </div>
          </div>
        </div>

        <div className={`section s3 ${seenSections.has(2) ? "seen" : ""}`} ref={sectionRefs[2]}>
          <div className="blobs">
            <div className="blob" />
            <div className="blob" />
          </div>
          <div className="connect-wrap">
            <div className="connect-content">
              <h2>Find us everywhere.</h2>
              <p className="subtitle">Join the Sharx community across platforms</p>
              
              <div className="connect-grid">
                {connects.map(c => (
                  <div key={c.name} className="connect-card">
                    <div className="c-ico" style={{ background: c.bg }}>
                      <span style={{ color: c.accent }}>{c.icon}</span>
                    </div>
                    <div className="c-info">
                      <div className="c-name">{c.name}</div>
                      <div className="c-handle">{c.handle}</div>
                      <div className="c-pill" style={{ background: c.bg, color: c.accent }}>
                        {c.pill}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="coming-soon">
                <p>
                  We're setting up our official accounts across{' '}
                  <strong>Instagram, YouTube, Discord, Twitter, and TikTok</strong>{' '}
                  — coming very soon! Once live, we'll share every handle right 
                  here so you can follow along, catch updates, and be part of 
                  the Sharx community from day one.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ SECTION 4 - FAQ WITH SMOOTH ANIMATION */}
        <div className={`section s4 ${seenSections.has(3) ? "seen" : ""}`} ref={sectionRefs[3]}>
          <div className="blobs">
            <div className="blob" />
            <div className="blob" />
          </div>
          <div className="faq-layout">
            <div className="faq-left">
              <h2>Quick<br />answers.</h2>
              <p>Everything you need to know about Sharx.</p>
              <button className="cta" onClick={() => goTo(0)}>
                Back to top
                <span className="cta-icon" style={{ transform: "rotate(180deg)" }}>
                  <ChevronDown size={15} strokeWidth={3} />
                </span>
              </button>
            </div>
            <div className="faq-right">
              {faqs.map((f, i) => (
                <div
                  key={i}
                  className={`faq-item ${openFaq === i ? "open" : ""}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="faq-q">
                    <span>{f.q}</span>
                    <div className={`faq-tog ${openFaq === i ? "open" : ""}`}>
                      <ChevronDown size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className={`faq-answer-wrapper ${openFaq === i ? "open" : ""}`}>
                    <div className="faq-a">{f.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}