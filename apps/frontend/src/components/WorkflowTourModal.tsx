import React, { useEffect } from 'react';
import { X, Film, Sparkles } from 'lucide-react';
import { VectaMotionPlayer } from './VectaMotionPlayer';

interface WorkflowTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowTourModal: React.FC<WorkflowTourModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(18, 19, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 3vw, 40px)',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 1040,
          backgroundColor: 'var(--bg-app)',
          border: '1.5px solid var(--ink-primary)',
          boxShadow: '8px 8px 0px var(--ink-primary)',
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1.5px solid var(--border-line)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 2,
                backgroundColor: 'var(--ink-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Film size={14} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--ink-primary)',
                  letterSpacing: '0.04em',
                }}
              >
                VECTA WORKFLOW ARCHITECTURE // 40-SECOND FILM
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--ink-muted)',
                }}
              >
                Zero fixed columns. Users create custom sections and define their own pipeline.
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-subtle"
            style={{
              padding: '6px',
              borderRadius: 2,
              border: '1px solid var(--border-line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Close [Esc]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Player Body */}
        <div style={{ padding: 12, backgroundColor: '#0c0d10' }}>
          <VectaMotionPlayer
            autoPlay={true}
            initialMuted={false}
            showChapters={true}
            onClose={onClose}
          />
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--ink-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>FPS: 60</span>
            <span>•</span>
            <span>RESOLUTION: 1920×1080</span>
            <span>•</span>
            <span>AUDIO: SYNTHESIZED MECHANICAL SFX</span>
          </div>
          <div>PRESS [ESC] OR CLICK OUTSIDE TO RETURN</div>
        </div>
      </div>
    </div>
  );
};
export default WorkflowTourModal;
