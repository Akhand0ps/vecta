import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Activity,
  Film,
} from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { MOCK_USERS } from '../services/mockStorage';
import { FlipText } from './FlipText';
import { soundService } from '../services/soundService';
import { VectaMotionPlayer } from './VectaMotionPlayer';

interface LandingPageProps {
  onEnterBoard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterBoard }) => {
  const { setCurrentUser, resetBoard } = useBoard();

  // Signup State (Hero & Final CTA)
  const [email, setEmail] = useState('');
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'provisioning'>('email');
  const [otp, setOtp] = useState('839201');
  const [provisionProgress, setProvisionProgress] = useState(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // B11 Scroll-driven Tagline Reveal
  const taglineRef = useRef<HTMLDivElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);

  const taglineText =
    'Most project tools bury engineering velocity under nested menus, slow page reloads, and mandatory survey forms. Vecta gives your team an instant 4-column drafting surface with sub-50 millisecond interactions, live cross-tab multiplayer presence, and zero onboarding friction.';
  const taglineWords = taglineText.split(' ');

  useEffect(() => {
    const handleScroll = () => {
      if (!taglineRef.current) return;
      const rect = taglineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const start = windowHeight * 0.8;
      const end = windowHeight * 0.2;
      const total = start - end;
      const current = start - rect.top;

      let progress = current / total;
      progress = Math.max(0, Math.min(1, progress));

      const count = Math.floor(progress * taglineWords.length);
      setRevealedCount(count);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [taglineWords.length]);

  const handleStartSignup = (userEmail: string) => {
    setEmail(userEmail || 'alex@vecta.io');
    setStep('otp');
    setSignupModalOpen(true);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('provisioning');

    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setProvisionProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (MOCK_USERS[0]) {
            setCurrentUser(MOCK_USERS[0]);
          }
          resetBoard();
          setSignupModalOpen(false);
          onEnterBoard();
        }, 400);
      }
    }, 220);
  };

  const faqs = [
    {
      q: 'How does real-time multiplayer work without a laggy backend?',
      a: 'Vecta pairs optimistic local UI mutations with high-speed browser-native broadcasting. Cards move instantly on the sender screen, and peer updates propagate across tabs and teammates in under 50 milliseconds with zero layout thrash.',
    },
    {
      q: 'Do new teammates have to fill out onboarding surveys?',
      a: 'Never. Teammates click your tokenized invite link and land directly on the active board with full editing permissions. No workspace creation wizards, no persona questionnaires, and no credit card gates.',
    },
    {
      q: 'What columns are included in a new workspace?',
      a: 'Every new workspace provisions with 4 focused engineering sections: Backlog, In Progress, Review, and Done. You can create cards with a single Enter keystroke and drag them freely across columns.',
    },
    {
      q: 'Can I test multiplayer on a single laptop?',
      a: 'Yes. Open Vecta in two separate browser tabs or windows. In one tab switch to Alex, in the other switch to Sam. You will see live presence badges, typing indicators, and card moves sync across tabs instantly.',
    },
    {
      q: 'Is Vecta free for small teams?',
      a: 'Yes. Up to 10 teammates can collaborate with unlimited boards, cards, and real-time multiplayer at zero cost without entering a credit card.',
    },
    {
      q: 'How does Vecta handle keyboard navigation?',
      a: 'Every card supports tab-focus and Enter/Space opening. The card detail sheet supports Escape dismissal, and adding a new card requires just a title and an Enter keypress.',
    },
  ];

  const comparisonData = [
    {
      cap: 'Interaction latency',
      legacy: '800ms - 1500ms full re-renders',
      vecta: 'Under 50ms optimistic updates',
    },
    {
      cap: 'Teammate onboarding',
      legacy: 'Mandatory SSO, role surveys, admin approvals',
      vecta: 'Instant token link, zero friction join',
    },
    {
      cap: 'Multiplayer presence',
      legacy: 'Static page reload or separate paid plug-in',
      vecta: 'Native cross-tab presence & typing indicators',
    },
    {
      cap: 'Card creation flow',
      legacy: '12 mandatory form fields before saving',
      vecta: 'Title only with Enter key, detail drawer on demand',
    },
    {
      cap: 'Visual drafting theme',
      legacy: 'Cluttered menus, nested toolbars, distracting ads',
      vecta: 'Disciplined architectural drafting canvas',
    },
  ];

  return (
    <div
      className="blueprint-mesh"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--ink-primary)',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* 1. Architectural Header Strip */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 80,
          backgroundColor: 'rgba(248, 247, 242, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-line)',
          padding: '10px clamp(16px, 4vw, 32px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Left: Product Wordmark & Meta Stamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 2,
              backgroundColor: 'var(--ink-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '1.5px 1.5px 0px var(--ink-primary)',
            }}
          >
            <Layers size={17} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <FlipText
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 800,
                fontSize: 16,
                letterSpacing: '-0.03em',
                color: 'var(--ink-primary)',
                textTransform: 'uppercase',
              }}
            >
              Vecta
            </FlipText>
            <span
              className="tech-stamp hide-mobile"
              style={{ fontSize: 10, padding: '1px 6px', borderRadius: 2 }}
            >
              SYS.24 // STABLE
            </span>
          </div>
        </div>

        {/* Center: Monospace Section Navigation (Desktop only) */}
        <div
          className="hide-mobile hide-tablet font-mono"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontSize: 12,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--ink-secondary)',
          }}
        >
          <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 120ms' }}>
            [01] How it works
          </a>
          <span style={{ color: 'var(--border-line)' }}>•</span>
          <a href="#specifications" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 120ms' }}>
            [02] Specification
          </a>
          <span style={{ color: 'var(--border-line)' }}>•</span>
          <a href="#faq" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 120ms' }}>
            [03] Inquiries
          </a>
        </div>

        {/* Right: Tactile Mechanical Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          <button
            onClick={onEnterBoard}
            className="touch-target btn-mechanical-ghost hide-mobile"
            style={{ padding: '8px 14px', fontSize: 13, minHeight: 38 }}
          >
            Open board
          </button>
          <button
            onClick={() => handleStartSignup('alex@vecta.io')}
            className="touch-target btn-mechanical-solid"
            style={{ padding: '8px 16px', fontSize: 13, minHeight: 38 }}
          >
            <span>Start free</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* 2. Hero Section: Video First, Story & Form Below */}
      <section
        className="blueprint-grid"
        style={{
          paddingTop: 'clamp(14px, 2vw, 24px)',
          paddingBottom: 'clamp(40px, 6vw, 64px)',
          paddingLeft: 'clamp(16px, 4vw, 40px)',
          paddingRight: 'clamp(16px, 4vw, 40px)',
          maxWidth: 1240,
          margin: '0 auto',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Cinematic Video Screen — 980px Balanced Viewport Centerpiece */}
        <div
          id="preview"
          style={{
            width: '100%',
            maxWidth: 980,
            margin: '0 auto clamp(20px, 2.5vw, 32px)',
            position: 'relative',
          }}
        >
          <VectaMotionPlayer
            autoPlay={true}
            initialMuted={true}
            minimal={true}
            showChapters={false}
          />
        </div>

        {/* Narrative & Value Proposition Below Video — Centered */}
        <div
          style={{
            maxWidth: 820,
            margin: '0 auto 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <h1
            className="hero-headline"
            style={{
              fontWeight: 800,
              color: 'var(--ink-primary)',
              maxWidth: 720,
            }}
          >
            Ship software{' '}
            <span
              className="font-serif"
              style={{
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--signal-blue)',
                paddingRight: '0.04em',
              }}
            >
              without
            </span>{' '}
            the backlog bloat.
          </h1>

          <p
            className="hero-subtext"
            style={{
              color: 'var(--ink-secondary)',
              maxWidth: 580,
            }}
          >
            A fast, flexible board with real-time sync. No clutter.
          </p>
        </div>

        {/* Primary Actions: Centered Input + Buttons */}
        <div className="hero-actions-dock">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartSignup(email || 'alex@vecta.io');
            }}
            className="hero-signup-form"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hero-email-input"
            />
            <button
              type="submit"
              className="touch-target btn-mechanical-solid hero-btn-primary"
            >
              <span>Start free workspace</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <button
            type="button"
            onClick={onEnterBoard}
            className="touch-target btn-mechanical-ghost hero-btn-secondary"
          >
            <span>Open live board</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* 4. Mandatory B11 Scroll-driven Tagline Reveal Section */}
      <section
        ref={taglineRef}
        className="manifesto-section"
        style={{
          padding: 'clamp(40px, 8vw, 100px) clamp(16px, 5vw, 48px)',
          maxWidth: 980,
          margin: '0 auto',
          boxSizing: 'border-box',
          borderLeft: '3px solid var(--ink-primary)',
          background: 'rgba(255, 255, 255, 0.65)',
          borderTop: '1px solid var(--border-line)',
          borderBottom: '1px solid var(--border-line)',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--signal-blue)',
            }}
          >
            [ SECTION 02 // MANIFESTO ]
          </span>
        </div>
        <p
          style={{
            fontSize: 'clamp(20px, 3.8vw, 34px)',
            fontWeight: 700,
            lineHeight: 1.45,
            letterSpacing: '-0.025em',
            textAlign: 'left',
          }}
        >
          {taglineWords.map((word, idx) => (
            <span
              key={idx}
              className={`tagline-word ${idx < revealedCount ? 'active' : 'inactive'}`}
            >
              {word}{' '}
            </span>
          ))}
        </p>
      </section>

      {/* 5. Architectural Blueprint Matrix (Shattering the Box Grid) */}
      <section
        id="how-it-works"
        style={{
          padding: 'clamp(64px, 10vw, 110px) clamp(16px, 5vw, 48px)',
          maxWidth: 1180,
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'left', marginBottom: 48 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--signal-blue)',
              display: 'block',
              marginBottom: 10,
            }}
          >
            [ SPRINT_FLOW // LINEAR_ARCHITECTURE ]
          </span>
          <h2
            style={{
              fontSize: 'clamp(24px, 5vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
            }}
          >
            Three steps from sign-in to{' '}
            <span className="font-serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--signal-blue)' }}>
              shipping.
            </span>
          </h2>
        </div>

        {/* Continuous Blueprint Matrix with Stark Hairline Dividers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            borderTop: '1.5px solid var(--ink-primary)',
            borderBottom: '1.5px solid var(--ink-primary)',
            background: '#ffffff',
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              padding: 'clamp(24px, 4vw, 36px)',
              borderRight: '1px solid var(--border-line)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div
                className="font-mono"
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--ink-primary)',
                  marginBottom: 16,
                  letterSpacing: '-0.04em',
                }}
              >
                01/
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'var(--signal-blue)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                [ ZERO SURVEYS ]
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
                Claim your board in 10 seconds
              </h3>
              <p style={{ fontSize: 14, color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                Submit work email, paste your 6-digit OTP, and your organization and Project Board provision immediately.
                Zero 14-step onboarding wizards.
              </p>
            </div>
            <div
              className="font-mono"
              style={{
                marginTop: 24,
                paddingTop: 14,
                borderTop: '1px dashed var(--border-line)',
                fontSize: 11,
                color: 'var(--ink-muted)',
              }}
            >
              PROV_TIME: &lt; 800MS
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              padding: 'clamp(24px, 4vw, 36px)',
              borderRight: '1px solid var(--border-line)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div
                className="font-mono"
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--signal-blue)',
                  marginBottom: 16,
                  letterSpacing: '-0.04em',
                }}
              >
                02/
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'var(--signal-blue)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                [ SUB-50MS DRAFTING ]
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
                Draft and drag with zero lag
              </h3>
              <p style={{ fontSize: 14, color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                Press Enter to draft tasks with title only. Drag across Backlog, In Progress, Review, and Done. Local state
                mutates immediately without layout shift.
              </p>
            </div>
            <div
              className="font-mono"
              style={{
                marginTop: 24,
                paddingTop: 14,
                borderTop: '1px dashed var(--border-line)',
                fontSize: 11,
                color: 'var(--ink-muted)',
              }}
            >
              UI_RENDER: 120HZ COMPLIANT
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              padding: 'clamp(24px, 4vw, 36px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div
                className="font-mono"
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--signal-emerald)',
                  marginBottom: 16,
                  letterSpacing: '-0.04em',
                }}
              >
                03/
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'var(--signal-emerald)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                [ CROSS-TAB MULTIPLAYER ]
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
                Collaborate live across peers
              </h3>
              <p style={{ fontSize: 14, color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
                Invite teammates with a tokenized URL. Live presence badges show active tabs, real-time typing indicators
                broadcast discussions, and peer card moves glow.
              </p>
            </div>
            <div
              className="font-mono"
              style={{
                marginTop: 24,
                paddingTop: 14,
                borderTop: '1px dashed var(--border-line)',
                fontSize: 11,
                color: 'var(--ink-muted)',
              }}
            >
              SYNC_LATENCY: &lt; 50MS
            </div>
          </div>
        </div>
      </section>



      {/* 6. Engineering Specifications Matrix (Rule 4) */}
      <section
        id="specifications"
        style={{
          padding: 'clamp(56px, 9vw, 96px) clamp(16px, 5vw, 48px)',
          maxWidth: 1180,
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'left', marginBottom: 40 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--signal-blue)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            [ BENCHMARK // HARDWARE SPECIFICATION ]
          </span>
          <h2
            style={{
              fontSize: 'clamp(24px, 5vw, 40px)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
            }}
          >
            How Vecta compares to{' '}
            <span className="font-serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>
              legacy bloatware.
            </span>
          </h2>
        </div>

        {/* Desktop Specifications Table */}
        <div
          className="hide-mobile"
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--ink-primary)',
            borderRadius: 2,
            boxShadow: '4px 4px 0px var(--ink-primary)',
            overflow: 'hidden',
          }}
        >
          <div
            className="font-mono"
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1.5fr',
              background: '#f4f3ec',
              padding: '14px 20px',
              borderBottom: '1.5px solid var(--ink-primary)',
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <div>[ SPECIFICATION ]</div>
            <div>[ LEGACY TRACKERS ]</div>
            <div style={{ color: 'var(--signal-blue)' }}>[ VECTA WORKBENCH ]</div>
          </div>

          {comparisonData.map((row, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1.5fr',
                padding: '16px 20px',
                borderBottom: i === comparisonData.length - 1 ? 'none' : '1px solid var(--border-line)',
                fontSize: 13.5,
                alignItems: 'center',
                backgroundColor: i % 2 === 1 ? '#faf9f5' : '#ffffff',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>{row.cap}</div>
              <div style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {row.legacy}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  color: 'var(--signal-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Check size={15} style={{ color: 'var(--signal-emerald)', strokeWidth: 2.5 }} />
                <span>{row.vecta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Specifications Stack */}
        <div className="show-mobile" style={{ flexDirection: 'column', gap: 12, width: '100%' }}>
          {comparisonData.map((row, i) => (
            <div
              key={i}
              style={{
                background: '#ffffff',
                border: '1.5px solid var(--ink-primary)',
                boxShadow: '2.5px 2.5px 0px var(--ink-primary)',
                padding: '16px',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: 2,
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: 'var(--ink-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 4,
                }}
              >
                SPEC_0{i + 1}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink-primary)', marginBottom: 10 }}>
                {row.cap}
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: 12,
                  color: 'var(--ink-muted)',
                  marginBottom: 8,
                  padding: '6px 10px',
                  background: '#f4f3ec',
                  border: '1px solid var(--border-line)',
                  borderRadius: 2,
                }}
              >
                <span style={{ fontWeight: 700 }}>Legacy: </span>
                {row.legacy}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--signal-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  background: 'var(--signal-blue-tint)',
                  border: '1px solid var(--signal-blue-border)',
                  borderRadius: 2,
                }}
              >
                <Check size={14} style={{ color: 'var(--signal-emerald)', strokeWidth: 2.5, flexShrink: 0 }} />
                <span>{row.vecta}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ Accordion (Editorial Typography) */}
      <section
        id="faq"
        style={{
          padding: 'clamp(56px, 9vw, 96px) clamp(16px, 5vw, 48px)',
          maxWidth: 880,
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'left', marginBottom: 40 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--signal-blue)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            [ SECTION 04 // TECHNICAL INQUIRIES ]
          </span>
          <h2
            style={{
              fontSize: 'clamp(24px, 5vw, 40px)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
            }}
          >
            Frequently asked{' '}
            <span className="font-serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>
              questions.
            </span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid var(--ink-primary)',
                  borderRadius: 2,
                  boxShadow: isOpen ? '2.5px 2.5px 0px var(--ink-primary)' : '1px 1px 0px var(--ink-primary)',
                  transition: 'box-shadow 120ms ease',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="touch-target"
                  style={{
                    width: '100%',
                    minHeight: 52,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: 14.5,
                    color: 'var(--ink-primary)',
                    gap: 12,
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                  aria-expanded={isOpen}
                >
                  <span style={{ lineHeight: 1.4 }}>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp size={18} color="var(--ink-primary)" style={{ flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={18} color="var(--ink-muted)" style={{ flexShrink: 0 }} />
                  )}
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '12px 20px 20px 20px',
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: 'var(--ink-secondary)',
                      borderTop: '1px solid var(--border-line)',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Final Risk-Reversal CTA: Architectural Work Order Voucher */}
      <section
        style={{
          padding: 'clamp(56px, 10vw, 100px) clamp(16px, 5vw, 48px)',
          maxWidth: 1180,
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '2px solid var(--ink-primary)',
            borderRadius: 3,
            padding: 'clamp(36px, 7vw, 68px) clamp(20px, 5vw, 48px)',
            textAlign: 'left',
            boxShadow: '6px 6px 0px var(--ink-primary)',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* Top Stamp Tag */}
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--signal-blue)',
              marginBottom: 16,
            }}
          >
            [ WORK_ORDER // INSTANT PROVISIONING ]
          </div>

          <h2
            style={{
              fontSize: 'clamp(26px, 5.5vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              marginBottom: 16,
              maxWidth: 720,
            }}
          >
            Start building{' '}
            <span className="font-serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--signal-blue)' }}>
              today.
            </span>
          </h2>

          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'var(--ink-secondary)',
              maxWidth: 620,
              lineHeight: 1.55,
              marginBottom: 32,
            }}
          >
            Zero setup fee. No credit card required. Free for engineering teams up to 10. Open your workspace and invite
            your first teammate in under one minute.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartSignup(email || 'alex@vecta.io');
            }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'stretch',
              gap: 10,
              maxWidth: 520,
              marginBottom: 20,
              boxSizing: 'border-box',
            }}
          >
            <input
              type="email"
              placeholder="Enter work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: '1 1 240px',
                minWidth: 'min(100%, 220px)',
                minHeight: 46,
                padding: '11px 16px',
                fontSize: 14,
                borderRadius: 2,
                border: '1.5px solid var(--ink-primary)',
                background: 'var(--bg-app)',
                color: 'var(--ink-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              className="touch-target btn-mechanical-solid"
              style={{
                flex: '0 0 auto',
                minHeight: 46,
                padding: '12px 24px',
                fontSize: 14,
              }}
            >
              <span>Get started free</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div
            className="font-mono"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(10px, 2vw, 18px)',
              fontSize: 11.5,
              color: 'var(--ink-muted)',
              flexWrap: 'wrap',
              textTransform: 'uppercase',
            }}
          >
            <span>[ IMMEDIATE SETUP ]</span>
            <span>//</span>
            <span>[ CARDLESS ACCESS ]</span>
            <span>//</span>
            <span>[ ZERO LOCK-IN ]</span>
          </div>
        </div>
      </section>

      {/* 9. Minimal Footer with Social Profiles */}
      <footer
        style={{
          borderTop: '1.5px solid var(--ink-primary)',
          background: '#ffffff',
          padding: 'clamp(20px, 3vw, 28px) clamp(16px, 5vw, 48px)',
          fontSize: 12.5,
          color: 'var(--ink-secondary)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 800, color: 'var(--ink-primary)', letterSpacing: '-0.02em' }}>VECTA</span>
            <span style={{ color: 'var(--border-line)' }}>•</span>
            <span className="font-mono" style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>WORKBENCH</span>
          </div>

          <div
            className="font-mono"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              flexWrap: 'wrap',
              fontSize: 12,
            }}
          >
            <a
              href="https://github.com/akhand0ps"
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--ink-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 120ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-secondary)')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>

            <span style={{ color: 'var(--border-line)' }}>•</span>

            <a
              href="https://www.linkedin.com/in/akhand0ps/"
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--ink-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 120ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-secondary)')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>LinkedIn</span>
            </a>

            <span style={{ color: 'var(--border-line)' }}>•</span>

            <a
              href="https://x.com/akhand_06x"
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--ink-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 120ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-secondary)')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Signup Modal Dialog (OTP Verification Flow - Mechanical Styling) */}
      {signupModalOpen && (
        <div className="dialog-backdrop" onClick={() => setSignupModalOpen(false)}>
          <div
            className="dialog-box"
            role="dialog"
            aria-modal="true"
            aria-label="Create workspace"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#ffffff',
              border: '2px solid var(--ink-primary)',
              borderRadius: 3,
              boxShadow: '6px 6px 0px var(--ink-primary)',
              padding: 'clamp(20px, 5vw, 32px)',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
              <button
                onClick={() => setSignupModalOpen(false)}
                className="touch-target btn-subtle"
                style={{ minWidth: 44, minHeight: 44, padding: 8 }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: 'var(--ink-primary)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  boxShadow: '2px 2px 0px var(--ink-primary)',
                }}
              >
                <Layers size={20} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>
                {step === 'provisioning'
                  ? 'Setting up your workspace'
                  : step === 'otp'
                  ? 'Verify your email'
                  : 'Start free workspace'}
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--ink-secondary)' }}>
                {step === 'otp'
                  ? `Enter the 6-digit confirmation code sent to ${email}`
                  : step === 'provisioning'
                  ? 'Initializing organization and Project Board'
                  : 'Get immediate access with zero survey forms.'}
              </p>
            </div>

            {/* OTP Form */}
            {step === 'otp' && (
              <form onSubmit={handleOtpVerify}>
                <div style={{ marginBottom: 18 }}>
                  <label
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--ink-secondary)',
                      display: 'block',
                      marginBottom: 6,
                      textTransform: 'uppercase',
                    }}
                  >
                    6-digit code
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="num font-mono"
                    style={{
                      width: '100%',
                      minHeight: 50,
                      fontSize: 24,
                      letterSpacing: '0.25em',
                      textAlign: 'center',
                      fontWeight: 800,
                      padding: '8px 12px',
                      borderRadius: 2,
                      border: '1.5px solid var(--ink-primary)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="touch-target btn-mechanical-solid"
                  style={{ width: '100%', minHeight: 46, fontSize: 14 }}
                >
                  <ShieldCheck size={16} />
                  <span>Verify code and open board</span>
                </button>
              </form>
            )}

            {/* Provisioning Progress */}
            {step === 'provisioning' && (
              <div style={{ padding: '4px 0' }}>
                <div
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 2,
                    padding: '16px',
                    border: '1px solid var(--border-line)',
                    marginBottom: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: provisionProgress >= 25 ? 'var(--signal-emerald)' : 'var(--ink-muted)',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Verified {email}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: provisionProgress >= 50 ? 'var(--signal-emerald)' : 'var(--ink-muted)',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Created organization "My Workspace"</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: provisionProgress >= 75 ? 'var(--signal-emerald)' : 'var(--ink-muted)',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Created Project Board with 4 columns</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: provisionProgress >= 100 ? 'var(--signal-emerald)' : 'var(--ink-muted)',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Redirecting to your board...</span>
                  </div>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: 4,
                    borderRadius: 2,
                    background: 'var(--border-line)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${provisionProgress}%`,
                      height: '100%',
                      background: 'var(--ink-primary)',
                      transition: 'width 200ms ease-out',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
