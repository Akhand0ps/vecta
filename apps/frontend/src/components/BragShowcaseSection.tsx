import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useBoard } from '../context/BoardContext';
import { useToast } from '../context/ToastContext';
import { soundService } from '../services/soundService';
import { Kbd } from './ui/Kbd';
import { FlipText } from './FlipText';
import {
  generateBragPlan,
  TONE_METADATA,
  type BragTone,
  type AspectRatio,
} from '../services/bragService';
import {
  Flame,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Monitor,
  Smartphone,
  Square,
  Download,
  ExternalLink,
  Volume2,
  VolumeX,
  Zap,
  Layers,
  Activity,
} from 'lucide-react';

export const BragShowcaseSection: React.FC = () => {
  const { board, currentUser } = useBoard();
  const { addToast } = useToast();

  const [tone, setTone] = useState<BragTone>('polished');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('landscape');
  const [activeTab, setActiveTab] = useState<'x' | 'linkedin' | 'slack' | 'markdown' | 'plan'>('x');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Playback & stage state
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [isAudioEnabled, setIsAudioEnabled] = useState(false); // starts muted like modern launch pages

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate brag plan dynamically based on current board state and chosen tone
  const bragPlan = useMemo(() => {
    return generateBragPlan(board, currentUser, tone);
  }, [board, currentUser, tone]);

  const beats = bragPlan.beats;
  const currentBeat = beats[activeBeatIndex] || beats[0];

  // Playback timer & scene progression (infinite smooth loop)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 50;
    const totalDurationSec = beats.reduce((acc, b) => acc + b.durationSec, 0);
    const stepPercent = (intervalMs / (totalDurationSec * 1000)) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + stepPercent;
        if (next >= 100) {
          if (isAudioEnabled) soundService.playDone();
          return 0; // seamless loop
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, beats, isAudioEnabled]);

  // Synchronize active beat based on progress percentage
  useEffect(() => {
    const totalDuration = beats.reduce((acc, b) => acc + b.durationSec, 0);
    let accumulated = 0;
    let targetIndex = 0;

    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      if (!beat) continue;
      const beatDurationPercent = (beat.durationSec / totalDuration) * 100;
      if (progress >= accumulated && progress < accumulated + beatDurationPercent) {
        targetIndex = i;
        break;
      }
      accumulated += beatDurationPercent;
    }

    if (targetIndex !== activeBeatIndex) {
      setActiveBeatIndex(targetIndex);
      if (isAudioEnabled && isPlaying) {
        if (targetIndex === beats.length - 1) {
          soundService.playDone();
        } else {
          soundService.playSnap();
        }
      }
    }
  }, [progress, beats, activeBeatIndex, isAudioEnabled, isPlaying]);

  const goToBeat = useCallback(
    (index: number) => {
      const totalDuration = beats.reduce((acc, b) => acc + b.durationSec, 0);
      let accumulated = 0;
      for (let i = 0; i < index; i++) {
        const b = beats[i];
        if (b) accumulated += b.durationSec;
      }
      const targetPercent = (accumulated / totalDuration) * 100 + 0.5;
      setProgress(targetPercent);
      setActiveBeatIndex(index);
    },
    [beats]
  );

  const handleCopy = useCallback(
    async (text: string, tabKey: string) => {
      soundService.playClick();
      try {
        await navigator.clipboard.writeText(text);
        setCopiedTab(tabKey);
        addToast({
          title: 'Copied to clipboard!',
          description: 'Ready to post and brag about your sprint.',
          type: 'success',
          duration: 3500,
        });
        setTimeout(() => setCopiedTab(null), 2500);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    },
    [addToast]
  );

  const handleDownloadPlan = useCallback(() => {
    soundService.playClick();
    const blob = new Blob([bragPlan.deliverables.markdownPlan], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brag-plan-${tone}-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'Downloaded brag-plan.md',
      description: 'Saved your complete launch showcase brief.',
      type: 'info',
      duration: 3500,
    });
  }, [bragPlan.deliverables.markdownPlan, tone, addToast]);

  const handleOpenTwitterIntent = useCallback(() => {
    soundService.playClick();
    const tweetText = encodeURIComponent(bragPlan.deliverables.xPost);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  }, [bragPlan.deliverables.xPost]);

  return (
    <section
      id="brag-showcase"
      ref={containerRef}
      style={{
        padding: 'clamp(56px, 8vw, 96px) clamp(16px, 5vw, 48px)',
        maxWidth: 1180,
        margin: '0 auto',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Editorial Header */}
      <div style={{ textAlign: 'left', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 3,
              backgroundColor: '#f97316',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Flame size={14} />
          </div>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#ea580c',
            }}
          >
            [ 02 // MOTION GRAPHICS ENGINE // POWERED BY LATENT-SPACES/BRAG ]
          </span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(28px, 5.5vw, 48px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: 'var(--ink-primary)',
            marginBottom: 16,
          }}
        >
          You built it.{' '}
          <span className="font-serif" style={{ fontStyle: 'italic', fontWeight: 400, color: '#ea580c' }}>
            Now brag.
          </span>
        </h2>

        <p
          style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            lineHeight: 1.6,
            color: 'var(--ink-secondary)',
            maxWidth: 720,
            margin: 0,
          }}
        >
          Turn the sprint you just completed into a 20-second launch showcase directly on the web.
          Kinetic typography, simulated Kanban interactions, zero-overhead Web Audio acoustics, and multi-platform share copy—live in your browser.
        </p>
      </div>

      {/* Embedded Theater Container */}
      <div
        style={{
          backgroundColor: '#0c0d12',
          border: '1.5px solid var(--ink-primary)',
          borderRadius: 4,
          boxShadow: '4px 4px 0px var(--ink-primary)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff',
        }}
      >
        {/* Theater Control Header */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#13151c',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Left Title & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                }}
              />
              <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em', color: '#ffffff' }}>
                /brag
              </span>
            </div>
            <span
              className="font-mono hide-mobile"
              style={{
                fontSize: 10.5,
                color: 'rgba(255, 255, 255, 0.5)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                paddingLeft: 10,
              }}
            >
              LAUNCH SHOWCASE THEATER
            </span>
          </div>

          {/* Center: Tone Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: 3,
              borderRadius: 6,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            {(Object.keys(TONE_METADATA) as BragTone[]).map((t) => {
              const meta = TONE_METADATA[t];
              const isSelected = tone === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    setTone(t);
                    setProgress(0);
                    setActiveBeatIndex(0);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.55)',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                    borderRadius: 4,
                    border: isSelected ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                  title={meta.description}
                >
                  <span>{meta.emoji}</span>
                  <span className="hide-mobile">{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Aspect Ratio Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: 2,
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setAspectRatio('landscape');
              }}
              style={{
                padding: '4px 7px',
                borderRadius: 3,
                backgroundColor: aspectRatio === 'landscape' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: aspectRatio === 'landscape' ? '#38bdf8' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
              }}
              title="16:9 Landscape (Desktop / 𝕏)"
            >
              <Monitor size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setAspectRatio('vertical');
              }}
              style={{
                padding: '4px 7px',
                borderRadius: 3,
                backgroundColor: aspectRatio === 'vertical' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: aspectRatio === 'vertical' ? '#38bdf8' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
              }}
              title="9:16 Vertical (Reels / TikTok)"
            >
              <Smartphone size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setAspectRatio('square');
              }}
              style={{
                padding: '4px 7px',
                borderRadius: 3,
                backgroundColor: aspectRatio === 'square' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: aspectRatio === 'square' ? '#38bdf8' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
              }}
              title="1:1 Square (LinkedIn / Feed)"
            >
              <Square size={14} />
            </button>
          </div>
        </div>

        {/* Live Theater Motion Stage */}
        <div
          style={{
            padding: 'clamp(20px, 4vw, 36px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#0a0b0e',
            position: 'relative',
          }}
        >
          {/* The Kinetic Canvas Screen */}
          <div
            style={{
              width: '100%',
              maxWidth:
                aspectRatio === 'landscape'
                  ? '860px'
                  : aspectRatio === 'vertical'
                  ? '380px'
                  : '540px',
              aspectRatio:
                aspectRatio === 'landscape'
                  ? '16 / 9'
                  : aspectRatio === 'vertical'
                  ? '9 / 16'
                  : '1 / 1',
              backgroundColor: '#11131a',
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 20px 48px -8px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 'clamp(18px, 3.5vw, 32px)',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 240ms var(--ease-snappy)',
            }}
          >
            {/* Tone Spotlight Aura */}
            <div
              style={{
                position: 'absolute',
                top: '-35%',
                left: '20%',
                width: '60%',
                height: '80%',
                background: `radial-gradient(ellipse at center, ${TONE_METADATA[tone].themeColor}55 0%, transparent 70%)`,
                filter: 'blur(35px)',
                pointerEvents: 'none',
              }}
            />

            {/* Stage Screen Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 2,
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: TONE_METADATA[tone].themeColor,
                    boxShadow: `0 0 8px ${TONE_METADATA[tone].themeColor}`,
                  }}
                />
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.85)',
                  }}
                >
                  {currentBeat?.badge}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="font-mono" style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.45)' }}>
                  VECTA.DEV // BRAG.05
                </span>
              </div>
            </div>

            {/* Stage Screen Center: Kinetic Motion Elements */}
            <div
              key={`${tone}_${activeBeatIndex}`}
              style={{
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 14,
                animation: 'fadeInUp 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              {/* Beat 1 & 2: Dynamic Typographic Slam */}
              {activeBeatIndex < 2 && (
                <div>
                  <h3
                    style={{
                      fontFamily:
                        tone === 'polished'
                          ? 'var(--font-serif)'
                          : tone === 'chaotic'
                          ? 'var(--font-ui)'
                          : 'var(--font-ui)',
                      fontStyle: tone === 'polished' ? 'italic' : 'normal',
                      fontWeight: tone === 'chaotic' ? 900 : 800,
                      fontSize: aspectRatio === 'vertical' ? 22 : 32,
                      lineHeight: 1.12,
                      letterSpacing: tone === 'chaotic' ? '-0.02em' : '-0.035em',
                      color: '#ffffff',
                      marginBottom: 10,
                    }}
                  >
                    {currentBeat?.headline}
                  </h3>
                  <p
                    style={{
                      fontSize: aspectRatio === 'vertical' ? 12.5 : 15,
                      color: 'rgba(255, 255, 255, 0.75)',
                      lineHeight: 1.5,
                      maxWidth: 580,
                      margin: 0,
                    }}
                  >
                    {currentBeat?.subtitle}
                  </p>
                </div>
              )}

              {/* Beat 3: Live Simulated Kanban Board in Action */}
              {activeBeatIndex === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      className="font-mono"
                      style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}
                    >
                      [ LIVE DEMO: J/K DOSSIER TRAVERSAL ]
                    </span>
                    <span className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                      0KB AUDIO ASSETS
                    </span>
                  </div>

                  {/* 3 Animated Columns */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      padding: 10,
                      borderRadius: 4,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span className="font-mono" style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>
                        BACKLOG
                      </span>
                      <div
                        style={{
                          padding: '6px 8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 3,
                          fontSize: 10.5,
                          color: 'rgba(255, 255, 255, 0.65)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        Optimize WS latency
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span className="font-mono" style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>
                        IN REVIEW
                      </span>
                      <div
                        style={{
                          padding: '6px 8px',
                          backgroundColor: 'rgba(15, 56, 217, 0.25)',
                          borderRadius: 3,
                          fontSize: 10.5,
                          color: '#93c5fd',
                          border: '1px solid rgba(59, 130, 246, 0.45)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>Synthesized Audio</span>
                        <Kbd size="sm">J</Kbd>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span className="font-mono" style={{ fontSize: 9.5, fontWeight: 600, color: '#4ade80' }}>
                        DONE (SHIPPED)
                      </span>
                      <div
                        style={{
                          padding: '6px 8px',
                          backgroundColor: 'rgba(34, 197, 94, 0.18)',
                          borderRadius: 3,
                          fontSize: 10.5,
                          color: '#86efac',
                          border: '1px solid rgba(34, 197, 94, 0.35)',
                          boxShadow: '0 0 14px rgba(34, 197, 94, 0.25)',
                        }}
                      >
                        ✓ Command Dossier
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>
                    <Zap size={13} color="#fbbf24" />
                    <span>{currentBeat?.subtitle}</span>
                  </div>
                </div>
              )}

              {/* Beat 4: Telemetry Proof Metrics */}
              {activeBeatIndex === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    {currentBeat?.headline}
                  </h3>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: aspectRatio === 'vertical' ? '1fr 1fr' : 'repeat(4, 1fr)',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 4,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                        Shipped Cards
                      </span>
                      <span className="num font-mono" style={{ fontSize: 22, fontWeight: 800, color: '#4ade80' }}>
                        {bragPlan.stats.shippedCount}
                      </span>
                    </div>

                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 4,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                        Sync Latency
                      </span>
                      <span className="num font-mono" style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8' }}>
                        &lt;{bragPlan.stats.syncLatencyMs}ms
                      </span>
                    </div>

                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 4,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                        Audio Bundles
                      </span>
                      <span className="num font-mono" style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24' }}>
                        0 KB
                      </span>
                    </div>

                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 4,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                        Sprint Velocity
                      </span>
                      <span className="num font-mono" style={{ fontSize: 22, fontWeight: 800, color: '#a78bfa' }}>
                        100%
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                    {currentBeat?.subtitle}
                  </p>
                </div>
              )}

              {/* Beat 5: Outro Brand Reveal */}
              {activeBeatIndex === 4 && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Layers size={20} />
                    </div>
                    <FlipText
                      style={{
                        fontWeight: 800,
                        fontSize: aspectRatio === 'vertical' ? 24 : 36,
                        letterSpacing: '-0.04em',
                        color: '#ffffff',
                      }}
                    >
                      VECTA
                    </FlipText>
                  </div>

                  <p
                    style={{
                      fontSize: aspectRatio === 'vertical' ? 12.5 : 16,
                      color: 'rgba(255, 255, 255, 0.85)',
                      maxWidth: 520,
                      lineHeight: 1.45,
                      margin: 0,
                    }}
                  >
                    {currentBeat?.subtitle}
                  </p>

                  <div
                    className="font-mono"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 12px',
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      fontSize: 11,
                      color: '#f97316',
                      marginTop: 4,
                    }}
                  >
                    <Sparkles size={12} color="#f97316" />
                    <span>YOU BUILT IT. NOW BRAG.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stage Screen Bottom Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 2,
                fontSize: 10.5,
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              <span className="font-mono">{currentBeat?.meta}</span>
              <span className="font-mono num">
                BEAT 0{activeBeatIndex + 1} / 0{beats.length}
              </span>
            </div>
          </div>

          {/* Timeline & Scrubber Bar directly under screen */}
          <div
            style={{
              width: '100%',
              maxWidth: '860px',
              marginTop: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Scrubber Progress Track */}
            <div
              style={{
                width: '100%',
                height: 6,
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                borderRadius: 3,
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                setProgress(ratio * 100);
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: TONE_METADATA[tone].themeColor,
                  transition: isPlaying ? 'none' : 'width 120ms ease',
                  boxShadow: `0 0 10px ${TONE_METADATA[tone].themeColor}`,
                }}
              />
            </div>

            {/* Transport Buttons & Beat Steps */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    setIsPlaying((prev) => !prev);
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title={isPlaying ? 'Pause showcase' : 'Play showcase'}
                >
                  {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: 2 }} />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    setProgress(0);
                    setActiveBeatIndex(0);
                    setIsPlaying(true);
                  }}
                  style={{
                    padding: 6,
                    color: 'rgba(255,255,255,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Replay from start"
                >
                  <RotateCcw size={16} />
                </button>

                {/* "Tap for sound" toggle like latent-spaces.github.io/brag */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAudioEnabled((prev) => !prev);
                    soundService.playClick();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 4,
                    backgroundColor: isAudioEnabled ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.06)',
                    color: isAudioEnabled ? '#38bdf8' : 'rgba(255,255,255,0.6)',
                    border: isAudioEnabled ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255,255,255,0.12)',
                    fontSize: 11.5,
                    cursor: 'pointer',
                  }}
                  title={isAudioEnabled ? 'Mute synthesized sound cues' : 'Enable synthesized sound cues'}
                >
                  {isAudioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span className="font-mono">{isAudioEnabled ? 'AUDIO: ON' : 'TAP FOR SOUND'}</span>
                </button>
              </div>

              {/* 5 Storyboard Beat Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {beats.map((b, idx) => {
                  const isCurrent = activeBeatIndex === idx;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        soundService.playSnap();
                        goToBeat(idx);
                      }}
                      style={{
                        fontSize: 11,
                        fontWeight: isCurrent ? 700 : 500,
                        padding: '3px 8px',
                        borderRadius: 3,
                        backgroundColor: isCurrent ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                        color: isCurrent ? '#ffffff' : 'rgba(255,255,255,0.5)',
                        border: isCurrent ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                      }}
                    >
                      <span className="num font-mono">0{idx + 1}</span>
                      <span className="hide-mobile">{b.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Share Deliverables Console (On the page, no modal) */}
        <div
          style={{
            backgroundColor: '#11131a',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '18px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Tabs bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setActiveTab('x');
                }}
                style={{
                  padding: '4px 10px',
                  fontSize: 12.5,
                  fontWeight: activeTab === 'x' ? 700 : 500,
                  color: activeTab === 'x' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: activeTab === 'x' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  borderRadius: 4,
                  border: activeTab === 'x' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                𝕏 / Twitter Post
              </button>

              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setActiveTab('linkedin');
                }}
                style={{
                  padding: '4px 10px',
                  fontSize: 12.5,
                  fontWeight: activeTab === 'linkedin' ? 700 : 500,
                  color: activeTab === 'linkedin' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: activeTab === 'linkedin' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  borderRadius: 4,
                  border: activeTab === 'linkedin' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                LinkedIn
              </button>

              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setActiveTab('slack');
                }}
                style={{
                  padding: '4px 10px',
                  fontSize: 12.5,
                  fontWeight: activeTab === 'slack' ? 700 : 500,
                  color: activeTab === 'slack' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: activeTab === 'slack' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  borderRadius: 4,
                  border: activeTab === 'slack' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                Slack Changelog
              </button>

              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setActiveTab('markdown');
                }}
                style={{
                  padding: '4px 10px',
                  fontSize: 12.5,
                  fontWeight: activeTab === 'markdown' ? 700 : 500,
                  color: activeTab === 'markdown' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: activeTab === 'markdown' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  borderRadius: 4,
                  border: activeTab === 'markdown' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                GitHub Badge
              </button>

              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setActiveTab('plan');
                }}
                style={{
                  padding: '4px 10px',
                  fontSize: 12.5,
                  fontWeight: activeTab === 'plan' ? 700 : 500,
                  color: activeTab === 'plan' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: activeTab === 'plan' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  borderRadius: 4,
                  border: activeTab === 'plan' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                brag-plan.md
              </button>
            </div>

            {/* Quick Export Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {activeTab === 'x' && (
                <button
                  type="button"
                  onClick={handleOpenTwitterIntent}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    padding: '5px 10px',
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                  }}
                >
                  <span>Post on 𝕏</span>
                  <ExternalLink size={12} />
                </button>
              )}

              {activeTab === 'plan' && (
                <button
                  type="button"
                  onClick={handleDownloadPlan}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    padding: '5px 10px',
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={12} />
                  <span>Download .md</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  let textToCopy = bragPlan.deliverables.xPost;
                  if (activeTab === 'linkedin') textToCopy = bragPlan.deliverables.linkedInPost;
                  if (activeTab === 'slack') textToCopy = bragPlan.deliverables.slackChangelog;
                  if (activeTab === 'markdown') textToCopy = bragPlan.deliverables.markdownBadge;
                  if (activeTab === 'plan') textToCopy = bragPlan.deliverables.markdownPlan;
                  handleCopy(textToCopy, activeTab);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 3,
                  backgroundColor: '#ffffff',
                  color: '#111318',
                  border: '1px solid #ffffff',
                  cursor: 'pointer',
                }}
              >
                {copiedTab === activeTab ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                <span>{copiedTab === activeTab ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Copy Snippet Box */}
          <div
            style={{
              backgroundColor: '#0a0b0e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              padding: '12px 14px',
              fontSize: 12.5,
              lineHeight: 1.55,
              color: 'rgba(255, 255, 255, 0.85)',
              whiteSpace: 'pre-wrap',
              fontFamily: activeTab === 'markdown' || activeTab === 'plan' ? 'var(--font-mono)' : 'inherit',
              maxHeight: 160,
              overflowY: 'auto',
            }}
          >
            {activeTab === 'x' && bragPlan.deliverables.xPost}
            {activeTab === 'linkedin' && bragPlan.deliverables.linkedInPost}
            {activeTab === 'slack' && bragPlan.deliverables.slackChangelog}
            {activeTab === 'markdown' && bragPlan.deliverables.markdownBadge}
            {activeTab === 'plan' && bragPlan.deliverables.markdownPlan}
          </div>
        </div>
      </div>
    </section>
  );
};
