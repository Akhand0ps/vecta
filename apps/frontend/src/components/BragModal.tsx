import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Share2,
  Monitor,
  Smartphone,
  Square,
  Download,
  ExternalLink,
  X,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';

export const BragModal: React.FC = () => {
  const { board, currentUser, isBragOpen, setIsBragOpen } = useBoard();
  const { addToast } = useToast();

  const [tone, setTone] = useState<BragTone>('polished');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('landscape');
  const [activeTab, setActiveTab] = useState<'x' | 'linkedin' | 'slack' | 'markdown' | 'plan'>('x');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Video / Motion Stage Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isAudioEnabled, setIsAudioEnabled] = useState(!soundService.isMuted());

  // Generate brag plan dynamically based on current board state and tone
  const bragPlan = useMemo(() => {
    return generateBragPlan(board, currentUser, tone);
  }, [board, currentUser, tone]);

  const beats = bragPlan.beats;
  const currentBeat = beats[activeBeatIndex] || beats[0];

  // Playback timer & scene progression
  useEffect(() => {
    if (!isBragOpen || !isPlaying) return;

    const intervalMs = 50;
    const totalDurationSec = beats.reduce((acc, b) => acc + b.durationSec, 0);
    const stepPercent = (intervalMs / (totalDurationSec * 1000)) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + stepPercent;
        if (next >= 100) {
          // Loop or pause on finish
          if (isAudioEnabled) soundService.playDone();
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isBragOpen, isPlaying, beats, isAudioEnabled]);

  // Synchronize active beat based on progress
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

  // Keyboard navigation within modal
  useEffect(() => {
    if (!isBragOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        soundService.playClick();
        setIsBragOpen(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        soundService.playClick();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        soundService.playSnap();
        goToBeat((activeBeatIndex + 1) % beats.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        soundService.playSnap();
        goToBeat((activeBeatIndex - 1 + beats.length) % beats.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBragOpen, activeBeatIndex, beats.length, setIsBragOpen]);

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

  if (!isBragOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Brag Launch Showcase Studio"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        backgroundColor: 'rgba(10, 12, 16, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(12px, 2vw, 24px)',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundService.playClick();
          setIsBragOpen(false);
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '94vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-line)',
          boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.4), 0 0 1px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 220ms var(--ease-snappy) forwards',
        }}
      >
        {/* Studio Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-line)',
            backgroundColor: 'var(--bg-app)',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#111318',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              <Flame size={18} color="#f97316" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--ink-primary)' }}>
                  /brag
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    backgroundColor: 'rgba(249, 115, 22, 0.12)',
                    color: '#c2410c',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid rgba(249, 115, 22, 0.25)',
                  }}
                >
                  Showcase Studio
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--ink-muted)', margin: 0 }}>
                You built it. Now brag. Powered by <span style={{ fontWeight: 600 }}>latent-spaces/brag</span>
              </p>
            </div>
          </div>

          {/* Tone Selector Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-surface)',
              padding: 3,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-line)',
              gap: 2,
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
                    padding: '4px 9px',
                    fontSize: 12,
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? 'var(--ink-primary)' : 'var(--ink-muted)',
                    backgroundColor: isSelected ? 'var(--bg-app)' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: isSelected ? '0 1px 2px rgba(17,20,26,0.08)' : 'none',
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

          {/* Modal Header Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Aspect Ratio Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface)',
                padding: 2,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-line)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setAspectRatio('landscape');
                }}
                style={{
                  padding: '4px 6px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: aspectRatio === 'landscape' ? 'var(--bg-app)' : 'transparent',
                  color: aspectRatio === 'landscape' ? 'var(--signal-blue)' : 'var(--ink-muted)',
                }}
                title="Landscape (16:9) • X / Desktop"
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
                  padding: '4px 6px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: aspectRatio === 'vertical' ? 'var(--bg-app)' : 'transparent',
                  color: aspectRatio === 'vertical' ? 'var(--signal-blue)' : 'var(--ink-muted)',
                }}
                title="Vertical (9:16) • Reels / Stories"
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
                  padding: '4px 6px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: aspectRatio === 'square' ? 'var(--bg-app)' : 'transparent',
                  color: aspectRatio === 'square' ? 'var(--signal-blue)' : 'var(--ink-muted)',
                }}
                title="Square (1:1) • Feed / LinkedIn"
              >
                <Square size={14} />
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setIsBragOpen(false);
              }}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--ink-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close modal (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Main Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Tone Brief Banner */}
          <div
            style={{
              padding: '8px 14px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>{TONE_METADATA[tone].emoji}</span>
              <span style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>
                {TONE_METADATA[tone].label} Direction:
              </span>
              <span style={{ color: 'var(--ink-secondary)' }}>{TONE_METADATA[tone].description}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span className="num" style={{ fontSize: 11, color: 'var(--signal-emerald)', fontWeight: 600 }}>
                ● {bragPlan.stats.shippedCount} deliverables in Done
              </span>
            </div>
          </div>

          {/* THE MOTION STAGE (Simulated Video Player) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#0c0d11',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #23262f',
              padding: '16px',
              position: 'relative',
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* The Video Canvas */}
            <div
              style={{
                width: '100%',
                maxWidth:
                  aspectRatio === 'landscape'
                    ? '720px'
                    : aspectRatio === 'vertical'
                    ? '340px'
                    : '460px',
                aspectRatio:
                  aspectRatio === 'landscape'
                    ? '16 / 9'
                    : aspectRatio === 'vertical'
                    ? '9 / 16'
                    : '1 / 1',
                backgroundColor: '#12141a',
                backgroundImage:
                  'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                color: '#ffffff',
                boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
                transition: 'all 240ms var(--ease-snappy)',
              }}
            >
              {/* Subtle spotlight glow */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40%',
                  left: '20%',
                  width: '60%',
                  height: '80%',
                  background: `radial-gradient(ellipse at center, ${TONE_METADATA[tone].themeColor}44 0%, transparent 70%)`,
                  filter: 'blur(30px)',
                  pointerEvents: 'none',
                }}
              />

              {/* Stage Top Bar: Beat Badge & Watermark */}
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
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {currentBeat?.badge}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600 }}>
                    VECTA × /BRAG
                  </span>
                </div>
              </div>

              {/* Stage Middle Dynamic Content (Changes per beat) */}
              <div
                key={`${tone}_${activeBeatIndex}`}
                style={{
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 12,
                  animation: 'fadeInUp 260ms ease-out forwards',
                }}
              >
                {/* Beat 1 & 2: Typographic Punchline */}
                {activeBeatIndex < 2 && (
                  <div>
                    <h2
                      style={{
                        fontFamily:
                          tone === 'polished'
                            ? 'var(--font-serif)'
                            : tone === 'chaotic'
                            ? 'var(--font-ui)'
                            : 'var(--font-ui)',
                        fontStyle: tone === 'polished' ? 'italic' : 'normal',
                        fontWeight: tone === 'chaotic' ? 900 : 700,
                        fontSize: aspectRatio === 'vertical' ? 22 : 28,
                        lineHeight: 1.15,
                        letterSpacing: tone === 'chaotic' ? '-0.02em' : '-0.03em',
                        color: '#ffffff',
                        marginBottom: 8,
                      }}
                    >
                      {currentBeat?.headline}
                    </h2>
                    <p
                      style={{
                        fontSize: aspectRatio === 'vertical' ? 12 : 14,
                        color: 'rgba(255, 255, 255, 0.72)',
                        lineHeight: 1.45,
                        maxWidth: '520px',
                      }}
                    >
                      {currentBeat?.subtitle}
                    </p>
                  </div>
                )}

                {/* Beat 3: Live Interactive Simulated UI */}
                {activeBeatIndex === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>
                        DEMONSTRATION: CENTERED COMMAND DOSSIER
                      </span>
                      <span className="num" style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                        Press J / K to traverse
                      </span>
                    </div>

                    {/* Simulated Mini Kanban Columns */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.35)',
                        padding: 10,
                        borderRadius: 6,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                          BACKLOG
                        </span>
                        <div
                          style={{
                            padding: '6px 8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 4,
                            fontSize: 10,
                            color: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          Audit telemetry stream
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                          IN REVIEW
                        </span>
                        <div
                          style={{
                            padding: '6px 8px',
                            backgroundColor: 'rgba(15, 56, 217, 0.2)',
                            borderRadius: 4,
                            fontSize: 10,
                            color: '#93c5fd',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>Synthetic Audio</span>
                          <span style={{ fontSize: 8, color: '#60a5fa' }}>active</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 9.5, fontWeight: 600, color: '#4ade80' }}>
                          DONE (SHIPPED)
                        </span>
                        <div
                          style={{
                            padding: '6px 8px',
                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                            borderRadius: 4,
                            fontSize: 10,
                            color: '#86efac',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            boxShadow: '0 0 12px rgba(34, 197, 94, 0.2)',
                          }}
                        >
                          ✓ Centered Dossier
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                      <Zap size={12} color="#fbbf24" />
                      <span>{currentBeat?.subtitle}</span>
                    </div>
                  </div>
                )}

                {/* Beat 4: Telemetry Proof Metrics */}
                {activeBeatIndex === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#ffffff' }}>
                      {currentBeat?.headline}
                    </h3>

                    {/* Metric Cards Grid */}
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
                          borderRadius: 6,
                          padding: '8px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                          Shipped Issues
                        </span>
                        <span className="num" style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>
                          {bragPlan.stats.shippedCount}
                        </span>
                      </div>

                      <div
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 6,
                          padding: '8px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                          Sync Latency
                        </span>
                        <span className="num" style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8' }}>
                          &lt;{bragPlan.stats.syncLatencyMs}ms
                        </span>
                      </div>

                      <div
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 6,
                          padding: '8px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                          Audio Bundles
                        </span>
                        <span className="num" style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>
                          0 KB
                        </span>
                      </div>

                      <div
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 6,
                          padding: '8px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                          Sprint Velocity
                        </span>
                        <span className="num" style={{ fontSize: 18, fontWeight: 800, color: '#a78bfa' }}>
                          100%
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                      {currentBeat?.subtitle}
                    </p>
                  </div>
                )}

                {/* Beat 5: Outro & Call to Action */}
                {activeBeatIndex === 4 && (
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
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
                          fontSize: aspectRatio === 'vertical' ? 24 : 32,
                          letterSpacing: '-0.04em',
                          color: '#ffffff',
                        }}
                      >
                        VECTA
                      </FlipText>
                    </div>

                    <p
                      style={{
                        fontSize: aspectRatio === 'vertical' ? 12 : 15,
                        color: 'rgba(255, 255, 255, 0.8)',
                        maxWidth: '480px',
                        lineHeight: 1.4,
                      }}
                    >
                      {currentBeat?.subtitle}
                    </p>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 9999,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        fontSize: 11,
                        color: '#e2e8f0',
                        marginTop: 4,
                      }}
                    >
                      <Sparkles size={12} color="#f59e0b" />
                      <span>vecta.dev • You built it. Now brag.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stage Bottom Bar: Scene indicator & duration */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  zIndex: 2,
                  fontSize: 10,
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                <span>{currentBeat?.meta}</span>
                <span className="num">
                  Beat {activeBeatIndex + 1} of {beats.length}
                </span>
              </div>
            </div>

            {/* Stage Timeline & Scrubber Bar */}
            <div
              style={{
                width: '100%',
                maxWidth: '720px',
                marginTop: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {/* Progress Scrubber */}
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

              {/* Player Controls & Beat Markers */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                {/* Play/Pause & Replay */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setIsPlaying((prev) => !prev);
                    }}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={isPlaying ? 'Pause showcase (Space)' : 'Play showcase (Space)'}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
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
                    }}
                    title="Replay from start"
                  >
                    <RotateCcw size={15} />
                  </button>

                  {/* Audio Mute in Stage */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAudioEnabled((prev) => !prev);
                      soundService.playClick();
                    }}
                    style={{
                      padding: 6,
                      color: isAudioEnabled ? '#38bdf8' : 'rgba(255,255,255,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={isAudioEnabled ? 'Mute synthesized audio cues' : 'Enable synthesized audio cues'}
                  >
                    {isAudioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </button>
                </div>

                {/* 5 Storyboard Beat Selector Chips */}
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
                          borderRadius: 4,
                          backgroundColor: isCurrent ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
                          color: isCurrent ? '#ffffff' : 'rgba(255,255,255,0.5)',
                          border: isCurrent ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span className="num">0{idx + 1}</span>
                        <span className="hide-mobile">{b.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Kbd size="sm" style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)' }}>
                    Space
                  </Kbd>
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>play/pause</span>
                </div>
              </div>
            </div>
          </div>

          {/* SHARE DELIVERABLES DRAWER */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-line)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Tab navigation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-line)',
                paddingBottom: 10,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    setActiveTab('x');
                  }}
                  style={{
                    padding: '4px 10px',
                    fontSize: 12.5,
                    fontWeight: activeTab === 'x' ? 600 : 500,
                    color: activeTab === 'x' ? 'var(--ink-primary)' : 'var(--ink-muted)',
                    backgroundColor: activeTab === 'x' ? 'var(--bg-surface)' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    border: activeTab === 'x' ? '1px solid var(--border-line)' : '1px solid transparent',
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
                    fontWeight: activeTab === 'linkedin' ? 600 : 500,
                    color: activeTab === 'linkedin' ? 'var(--ink-primary)' : 'var(--ink-muted)',
                    backgroundColor: activeTab === 'linkedin' ? 'var(--bg-surface)' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    border: activeTab === 'linkedin' ? '1px solid var(--border-line)' : '1px solid transparent',
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
                    fontWeight: activeTab === 'slack' ? 600 : 500,
                    color: activeTab === 'slack' ? 'var(--ink-primary)' : 'var(--ink-muted)',
                    backgroundColor: activeTab === 'slack' ? 'var(--bg-surface)' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    border: activeTab === 'slack' ? '1px solid var(--border-line)' : '1px solid transparent',
                  }}
                >
                  Slack / Changelog
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
                    fontWeight: activeTab === 'markdown' ? 600 : 500,
                    color: activeTab === 'markdown' ? 'var(--ink-primary)' : 'var(--ink-muted)',
                    backgroundColor: activeTab === 'markdown' ? 'var(--bg-surface)' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    border: activeTab === 'markdown' ? '1px solid var(--border-line)' : '1px solid transparent',
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
                    fontWeight: activeTab === 'plan' ? 600 : 500,
                    color: activeTab === 'plan' ? 'var(--ink-primary)' : 'var(--ink-muted)',
                    backgroundColor: activeTab === 'plan' ? 'var(--bg-surface)' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    border: activeTab === 'plan' ? '1px solid var(--border-line)' : '1px solid transparent',
                  }}
                >
                  brag-plan.md
                </button>
              </div>

              {/* Action buttons for current tab */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {activeTab === 'x' && (
                  <button
                    type="button"
                    onClick={handleOpenTwitterIntent}
                    className="btn-outlined"
                    style={{ fontSize: 11.5, padding: '4px 8px', gap: 4 }}
                  >
                    <span>Open on 𝕏</span>
                    <ExternalLink size={12} />
                  </button>
                )}

                {activeTab === 'plan' && (
                  <button
                    type="button"
                    onClick={handleDownloadPlan}
                    className="btn-outlined"
                    style={{ fontSize: 11.5, padding: '4px 8px', gap: 4 }}
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
                  className="btn-solid"
                  style={{ fontSize: 11.5, padding: '5px 10px', gap: 5 }}
                >
                  {copiedTab === activeTab ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
                  <span>{copiedTab === activeTab ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Tab Content Display Area */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-line)',
                padding: '12px 14px',
                minHeight: '110px',
                fontSize: 12.5,
                lineHeight: 1.5,
                color: 'var(--ink-primary)',
                whiteSpace: 'pre-wrap',
                fontFamily: activeTab === 'markdown' || activeTab === 'plan' ? 'var(--font-mono)' : 'inherit',
                maxHeight: '180px',
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

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-line)',
            backgroundColor: 'var(--bg-app)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--ink-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Shortcut:</span>
            <Kbd size="sm">B</Kbd>
            <span>or</span>
            <Kbd size="sm">Esc</Kbd>
            <span>to exit</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'var(--ink-secondary)', fontWeight: 500 }}>
              {bragPlan.stats.shippedCount} deliverables ready for launch
            </span>
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setIsBragOpen(false);
              }}
              className="btn-outlined"
              style={{ fontSize: 12, padding: '4px 10px' }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
