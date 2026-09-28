import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, CheckCircle2, Layers } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { MOCK_USERS } from '../services/mockStorage';

interface LandingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LandingModal: React.FC<LandingModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentUser, resetBoard } = useBoard();

  const [step, setStep] = useState<'email' | 'otp' | 'provisioning'>('email');
  const [email, setEmail] = useState('alex@vecta.io');
  const [otp, setOtp] = useState('839201');
  const [provisionProgress, setProvisionProgress] = useState(0);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep('otp');
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
          setCurrentUser(MOCK_USERS[0]);
          resetBoard();
          onClose();
          setStep('email');
          setProvisionProgress(0);
        }, 400);
      }
    }, 240);
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog-box"
        role="dialog"
        aria-modal="true"
        aria-label="Create your workspace"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 'min(440px, calc(100vw - 24px))',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
          padding: 'clamp(20px, 4vw, 28px)',
          boxSizing: 'border-box',
        }}
      >
        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
          <button onClick={onClose} className="touch-target btn-subtle" style={{ minWidth: 44, minHeight: 44, padding: 8 }} aria-label="Close dialog" title="Close (Escape)">
            <X size={18} />
          </button>
        </div>

        {/* Wordmark Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--ink-primary)',
            color: 'var(--ink-contrast)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Layers size={20} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 4 }}>
            {step === 'provisioning'
              ? 'Setting up your workspace'
              : step === 'otp'
              ? 'Check your inbox'
              : 'Create your workspace'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-secondary)' }}>
            {step === 'otp'
              ? `We sent a 6-digit code to ${email}`
              : step === 'provisioning'
              ? 'Initializing Project Board with 4 columns'
              : 'Sign up with zero friction. You land directly inside a usable board.'}
          </p>
        </div>

        {/* Step 1: Email Form */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 6 }}>
                Work email
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.io"
                style={{ width: '100%', fontSize: 14, minHeight: 44, padding: '10px 12px', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              className="touch-target btn-solid"
              style={{ width: '100%', minHeight: 44, fontSize: 13.5 }}
            >
              <span>Continue with email</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* Step 2: OTP Form */}
        {step === 'otp' && (
          <form onSubmit={handleOtpVerify}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 6 }}>
                6-digit code
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="839201"
                className="num"
                style={{
                  width: '100%',
                  fontSize: 22,
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                  fontWeight: 700,
                  minHeight: 48,
                  padding: '9px 12px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              className="touch-target btn-solid"
              style={{ width: '100%', minHeight: 44, fontSize: 13.5 }}
            >
              <ShieldCheck size={16} />
              <span>Verify and open board</span>
            </button>
          </form>
        )}

        {/* Step 3: Zero-latency Automated Provisioning */}
        {step === 'provisioning' && (
          <div style={{ padding: '4px 0' }}>
            <div style={{
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              border: '1px solid var(--border-line)',
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: provisionProgress >= 25 ? 'var(--signal-emerald)' : 'var(--ink-muted)', fontWeight: 500 }}>
                <CheckCircle2 size={15} />
                <span>Verified {email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: provisionProgress >= 50 ? 'var(--signal-emerald)' : 'var(--ink-muted)', fontWeight: 500 }}>
                <CheckCircle2 size={15} />
                <span>Created organization "My Workspace"</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: provisionProgress >= 75 ? 'var(--signal-emerald)' : 'var(--ink-muted)', fontWeight: 500 }}>
                <CheckCircle2 size={15} />
                <span>Created Project Board with 4 columns</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: provisionProgress >= 100 ? 'var(--signal-emerald)' : 'var(--ink-muted)', fontWeight: 500 }}>
                <CheckCircle2 size={15} />
                <span>Opening board</span>
              </div>
            </div>

            {/* Progress line */}
            <div style={{
              width: '100%',
              height: 3,
              borderRadius: 'var(--radius-full)',
              background: 'var(--border-line)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${provisionProgress}%`,
                height: '100%',
                background: 'var(--ink-primary)',
                transition: 'width 200ms ease-out',
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
