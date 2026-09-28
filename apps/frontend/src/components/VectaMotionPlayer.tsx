import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Film,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';

export interface VectaMotionPlayerProps {
  autoPlay?: boolean;
  initialMuted?: boolean;
  showChapters?: boolean;
  minimal?: boolean;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export const CHAPTERS = [
  { id: 'canvas', label: '01 / CANVAS', time: 0, title: 'Blank Drafting Surface' },
  { id: 'section', label: '02 / SECTION', time: 6, title: 'Custom Section Architecture' },
  { id: 'cards', label: '03 / CARDS', time: 13, title: 'Precision Spec Drafting' },
  { id: 'multi-col', label: '04 / WORKFLOW', time: 20, title: 'Multi-Section Pipeline' },
  { id: 'multiplayer', label: '05 / MULTIPLAYER', time: 26, title: 'Live Peer Presence' },
  { id: 'outro', label: '06 / FINALE', time: 30, title: 'Vecta Engineering Workbench' },
];

export const VectaMotionPlayer: React.FC<VectaMotionPlayerProps> = ({
  autoPlay = true,
  initialMuted = true,
  showChapters = true,
  minimal = false,
  onClose,
  style,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(40.04);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const hideControlsTimeout = useRef<number | null>(null);

  // Format time (seconds -> MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setHasInteracted(true);
  }, []);

  // Mute / Unmute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    setHasInteracted(true);
  }, []);

  // Option A: Click on video to unmute if muted, or toggle play/pause if unmuted
  const handleVideoClick = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      togglePlay();
    }
    setHasInteracted(true);
  }, [isMuted, togglePlay]);

  // Seek to specific timestamp
  const seekTo = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setHasInteracted(true);
  }, []);

  // Replay from start
  const handleReplay = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    setHasInteracted(true);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen]);

  // Video event handlers
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onLoadedMetadata = () => {
      if (v.duration && !isNaN(v.duration)) {
        setDuration(v.duration);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);

    if (autoPlay) {
      v.muted = true;
      setIsMuted(true);
      v.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay may be blocked by browser policy until interaction
        setIsPlaying(false);
      });
    }

    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
    };
  }, [autoPlay]);

  // Mouse move to show controls and auto-hide
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      window.clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Progress bar interaction
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(pos * duration);
  };

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleProgressBarMouseLeave = () => {
    setHoverTime(null);
  };

  // Determine active chapter
  const activeChapterIndex = CHAPTERS.reduce((curr, ch, idx) => {
    return currentTime >= ch.time ? idx : curr;
  }, 0);
  const currentChapter = CHAPTERS[activeChapterIndex] || CHAPTERS[0];

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#121316',
        borderRadius: isFullscreen ? 0 : 4,
        overflow: 'hidden',
        border: isFullscreen ? 'none' : '1.5px solid var(--ink-primary)',
        boxShadow: isFullscreen ? 'none' : '4px 4px 0px var(--ink-primary)',
        aspectRatio: isFullscreen ? undefined : '16 / 9',
        height: isFullscreen ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Top Telemetry Stamp Bar */}
      {!minimal && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'linear-gradient(180deg, rgba(18,19,22,0.85) 0%, rgba(18,19,22,0) 100%)',
            color: '#ffffff',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.04em',
            pointerEvents: showControls ? 'auto' : 'none',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 240ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isPlaying ? 'var(--signal-emerald)' : '#eab308',
                boxShadow: isPlaying ? '0 0 8px var(--signal-emerald)' : 'none',
                display: 'inline-block',
              }}
            />
            <span style={{ fontWeight: 600 }}>
              VECTA WORKFLOW FILM // 40-SEC ARCHITECTURE
            </span>
            <span
              style={{
                display: 'inline-block',
                padding: '1px 6px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                fontSize: 9.5,
                fontWeight: 500,
              }}
            >
              {currentChapter.label} : {currentChapter.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10.5 }}>
              1080P // 60 FPS
            </span>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                }}
                title="Close viewer"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Video Element */}
      <video
        ref={videoRef}
        src="/vecta-motion.mp4"
        playsInline
        preload="auto"
        loop
        onClick={handleVideoClick}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#0c0d10',
          cursor: 'pointer',
        }}
      />

      {/* Option A: Click to Unmute Prompt Pill (Visible on hover when muted) */}
      {isMuted && isPlaying && showControls && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 25,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'var(--ink-primary)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '7px 14px',
            borderRadius: 2,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'transform 120ms ease, background-color 120ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--signal-blue)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--ink-primary)')}
        >
          <VolumeX size={13} color="#fca5a5" />
          <span>CLICK ANYWHERE TO UNMUTE</span>
        </button>
      )}

      {/* Center Play Button Overlay (when paused) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(18, 19, 22, 0.35)',
            backdropFilter: 'blur(3px)',
            cursor: 'pointer',
          }}
        >
          <div
            className="vplayer-play-circle"
            style={{
              width: minimal ? 64 : 72,
              height: minimal ? 64 : 72,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-app)',
              border: '2px solid var(--ink-primary)',
              boxShadow: '4px 4px 0px var(--ink-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-primary)',
              transition: 'transform 150ms ease',
              marginBottom: minimal ? 0 : 14,
            }}
          >
            <Play size={minimal ? 26 : 30} style={{ marginLeft: 3 }} />
          </div>
          {!minimal && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#ffffff',
                backgroundColor: 'var(--ink-primary)',
                padding: '4px 12px',
                borderRadius: 2,
              }}
            >
              WATCH 40S WORKFLOW STORY [SPACE]
            </span>
          )}
        </div>
      )}

      {/* Bottom Floating Control Dock */}
      <div
        className="vplayer-dock"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: '24px 16px 14px 16px',
          background: 'linear-gradient(0deg, rgba(18,19,22,0.95) 0%, rgba(18,19,22,0.7) 60%, rgba(18,19,22,0) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          transition: 'opacity 240ms ease',
        }}
      >
        {/* Scrub Bar & Chapter Markers */}
        <div style={{ position: 'relative', width: '100%' }}>
          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                left: `${hoverPosition}%`,
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--ink-primary)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '2px 6px',
                borderRadius: 2,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 30,
              }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Scrub Track */}
          <div
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            onMouseMove={handleProgressBarMouseMove}
            onMouseLeave={handleProgressBarMouseLeave}
            style={{
              position: 'relative',
              width: '100%',
              height: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              cursor: 'pointer',
              overflow: 'visible',
            }}
          >
            {/* Progress Fill */}
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--signal-blue)',
                borderRadius: 3,
                position: 'relative',
              }}
            >
              {/* Playhead thumb */}
              <div
                style={{
                  position: 'absolute',
                  right: -5,
                  top: -4,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '2px solid var(--signal-blue)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                }}
              />
            </div>

            {/* Chapter Notch Marks */}
            {CHAPTERS.map((ch) => {
              const pos = (ch.time / duration) * 100;
              return (
                <div
                  key={ch.id}
                  title={`${ch.label}: ${ch.title}`}
                  style={{
                    position: 'absolute',
                    left: `${pos}%`,
                    top: -2,
                    bottom: -2,
                    width: 2,
                    backgroundColor: currentTime >= ch.time ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Chapter Pills Row */}
        {showChapters && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: 2,
            }}
          >
            {CHAPTERS.map((ch, idx) => {
              const isActive = idx === activeChapterIndex;
              return (
                <button
                  key={ch.id}
                  onClick={() => seekTo(ch.time)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 8px',
                    borderRadius: 2,
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.03em',
                    whiteSpace: 'nowrap',
                    border: isActive ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  <span style={{ color: isActive ? 'var(--signal-emerald)' : 'inherit' }}>
                    {isActive ? '●' : '○'}
                  </span>
                  <span>{ch.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Primary Controls Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            color: '#ffffff',
          }}
        >
          {/* Left: Play/Pause, Replay, Timecode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={togglePlay}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                cursor: 'pointer',
              }}
              title={isPlaying ? 'Pause [Space]' : 'Play [Space]'}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: 2 }} />}
            </button>

            <button
              onClick={handleReplay}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                cursor: 'pointer',
              }}
              title="Replay from start"
            >
              <RotateCcw size={14} />
            </button>

            {/* Time readout */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '0.04em',
              }}
            >
              <span>{formatTime(currentTime)}</span>
              <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.4)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Audio Mute, Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 2,
                backgroundColor: isMuted ? 'rgba(255,255,255,0.1)' : 'rgba(15, 56, 217, 0.4)',
                border: isMuted ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--signal-blue)',
                color: '#ffffff',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
              }}
              title={isMuted ? 'Unmute [M]' : 'Mute [M]'}
            >
              {isMuted ? <VolumeX size={14} color="#fca5a5" /> : <Volume2 size={14} color="#86efac" />}
              <span className="vplayer-audio-text">{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                cursor: 'pointer',
              }}
              title={isFullscreen ? 'Exit Fullscreen [F]' : 'Enter Fullscreen [F]'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VectaMotionPlayer;
