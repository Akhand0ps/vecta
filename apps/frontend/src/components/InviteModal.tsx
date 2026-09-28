import React, { useState } from 'react';
import { X, Mail, Link2, Check, ExternalLink, UserPlus } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const inviteToken = 'inv_sec_' + Math.random().toString(36).substring(2, 9);
  const shareableLink = `${window.location.origin}/?invite=${inviteToken}&user=sam&board=project-board`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setEmail('');
      onClose();
    }, 1600);
  };

  const handleTestInNewTab = () => {
    window.open(shareableLink, '_blank');
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog-box"
        role="dialog"
        aria-modal="true"
        aria-label="Invite teammate to Project Board"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 'min(460px, calc(100vw - 24px))',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={16} color="var(--ink-primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-primary)' }}>
              Invite teammate to Project Board
            </h3>
          </div>
          <button onClick={onClose} className="touch-target btn-subtle" style={{ minWidth: 44, minHeight: 44, padding: 8 }} aria-label="Close dialog" title="Close (Escape)">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 'clamp(16px, 4vw, 20px)' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 18, lineHeight: 1.5 }}>
            Invited teammates will join as members and land directly inside this board.
          </p>

          {/* Email Invite Form */}
          <form onSubmit={handleSendInvite} style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-secondary)', display: 'block', marginBottom: 6 }}>
              Teammate email
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 'min(100%, 180px)' }}>
                <Mail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="sam@company.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: 32, fontSize: 13.5, minHeight: 44, boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="submit"
                className="touch-target btn-solid"
                style={{ minHeight: 44, padding: '8px 16px', whiteSpace: 'nowrap', flex: '1 1 110px' }}
              >
                {sentSuccess ? 'Sent' : 'Send invite'}
              </button>
            </div>
            {sentSuccess && (
              <p style={{ fontSize: 12, color: 'var(--signal-emerald)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                <Check size={13} />
                Invitation sent
              </p>
            )}
          </form>

          {/* Hairline Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '18px 0',
            color: 'var(--ink-muted)',
            fontSize: 11.5,
            fontWeight: 500,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-line)' }} />
            <span>or share direct link</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-line)' }} />
          </div>

          {/* Shareable Link Box */}
          <div style={{ marginBottom: 18 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-line)',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 7px 5px 10px',
              gap: 8,
            }}>
              <Link2 size={14} color="var(--ink-muted)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                readOnly
                aria-label="Direct board invite link"
                value={shareableLink}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 12,
                  color: 'var(--ink-secondary)',
                  width: '100%',
                  padding: 0,
                  outline: 'none',
                  boxShadow: 'none',
                }}
              />
              <button
                onClick={handleCopyLink}
                aria-label="Copy invite link to clipboard"
                className="btn-outlined"
                style={{ padding: '4px 10px', fontSize: 12, flexShrink: 0 }}
              >
                {copied ? <Check size={12} color="var(--signal-emerald)" /> : null}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Split-screen helper */}
          <div style={{
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-line)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-primary)' }}>
                Test multiplayer right now
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-secondary)' }}>
                Opens this link as "Sam" in a side-by-side window.
              </div>
            </div>
            <button
              onClick={handleTestInNewTab}
              className="btn-outlined"
              style={{ padding: '5px 10px', fontSize: 12 }}
            >
              <ExternalLink size={12} />
              <span>Open tab</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
