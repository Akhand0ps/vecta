import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { MOCK_USERS } from '../services/mockStorage';
import {
  UserPlus,
  Search,
  ExternalLink,
  RotateCcw,
  Layers,
  Menu,
  X,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Flame,
  Film,
} from 'lucide-react';
import { FlipText } from './FlipText';
import { Kbd } from './ui/Kbd';
import { soundService } from '../services/soundService';

interface NavbarProps {
  onOpenInvite: () => void;
  onOpenLanding: () => void;
  onOpenTour?: () => void;
  onBackToLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenInvite,
  onOpenLanding,
  onOpenTour,
  onBackToLanding,
}) => {
  const [isMuted, setIsMuted] = useState(() => soundService.isMuted());
  const {
    board,
    currentUser,
    setCurrentUser,
    presenceUsers,
    filterAssignedToMe,
    setFilterAssignedToMe,
    searchQuery,
    setSearchQuery,
    resetBoard,
    setIsBragOpen,
  } = useBoard();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const assignedCount =
    board?.cards.filter((c) => c.assignees.some((a) => a.id === currentUser.id)).length || 0;

  const handleOpenSecondTab = () => {
    const targetPersona = currentUser.id === MOCK_USERS[0]?.id ? 'sam' : 'alex';
    window.open(`/?user=${targetPersona}`, '_blank');
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-line)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          width: '100%',
          maxWidth: '100vw',
        }}
      >
        {/* Left: Product Wordmark & (Desktop) Search & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div
            onClick={onBackToLanding}
            role={onBackToLanding ? 'button' : undefined}
            tabIndex={onBackToLanding ? 0 : undefined}
            onKeyDown={(e) => {
              if (onBackToLanding && (e.key === 'Enter' || e.key === ' ')) onBackToLanding();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: onBackToLanding ? 'pointer' : 'default',
              minWidth: 0,
            }}
            title={onBackToLanding ? 'Back to landing page' : undefined}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--ink-primary)',
                color: 'var(--ink-contrast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Layers size={16} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, overflow: 'hidden' }}>
              <FlipText
                style={{
                  fontWeight: 800,
                  fontSize: 14.5,
                  letterSpacing: '-0.03em',
                  color: 'var(--ink-primary)',
                  whiteSpace: 'nowrap',
                }}
              >
                Vecta
              </FlipText>
              <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>/</span>
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--ink-secondary)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {board?.title || 'Project Board'}
              </span>
            </div>
          </div>

          {/* Desktop Search Input (Hidden on Mobile) */}
          <div className="hide-mobile" style={{ position: 'relative', width: 210 }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: 9,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ink-muted)',
              }}
            />
            <input
              type="text"
              aria-label="Search cards by title or description"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 36px 5px 28px',
                fontSize: 12.5,
                minHeight: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-line)',
              }}
            />
            <Kbd
              size="sm"
              style={{
                position: 'absolute',
                right: 7,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              ⌘K
            </Kbd>
          </div>

          {/* Desktop Segmented Filter Toggle (Hidden on Mobile) */}
          <div
            className="hide-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-app)',
              padding: 2,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-line)',
            }}
          >
            <button
              onClick={() => {
                soundService.playClick();
                setFilterAssignedToMe(false);
              }}
              aria-pressed={!filterAssignedToMe}
              style={{
                padding: '3px 9px',
                fontSize: 12,
                fontWeight: !filterAssignedToMe ? 600 : 500,
                color: !filterAssignedToMe ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                backgroundColor: !filterAssignedToMe ? 'var(--bg-surface)' : 'transparent',
                borderRadius: 'var(--radius-xs)',
                boxShadow: !filterAssignedToMe ? '0 1px 2px rgba(17,20,26,0.06)' : 'none',
              }}
            >
              All cards
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setFilterAssignedToMe(true);
              }}
              aria-pressed={filterAssignedToMe}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 9px',
                fontSize: 12,
                fontWeight: filterAssignedToMe ? 600 : 500,
                color: filterAssignedToMe ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                backgroundColor: filterAssignedToMe ? 'var(--bg-surface)' : 'transparent',
                borderRadius: 'var(--radius-xs)',
                boxShadow: filterAssignedToMe ? '0 1px 2px rgba(17,20,26,0.06)' : 'none',
              }}
            >
              <span>Assigned to me</span>
              {assignedCount > 0 && (
                <span
                  className="num"
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: filterAssignedToMe ? 'var(--signal-blue)' : 'var(--ink-muted)',
                  }}
                >
                  {assignedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Controls (Hidden on Mobile < 768px) */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Presence Stack */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-line)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <span className="status-pip" />
            <span
              className="num"
              style={{ fontSize: 11.5, color: 'var(--ink-secondary)', fontWeight: 500, marginRight: 2 }}
            >
              {presenceUsers.length} live
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {presenceUsers.map((p, index) => {
                const isSelf = p.user.id === currentUser.id;
                return (
                  <div
                    key={p.tabId || `${p.user.id}_${index}`}
                    title={`${p.user.name} ${isSelf ? '(You)' : ''}`}
                    style={{
                      position: 'relative',
                      marginLeft: index === 0 ? 0 : -6,
                      zIndex: 10 - index,
                    }}
                  >
                    <img
                      src={p.user.avatarUrl}
                      alt={p.user.name}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: `1.5px solid ${isSelf ? 'var(--signal-blue)' : '#ffffff'}`,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Persona Switcher / Split-Screen Helper */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-line)',
              borderRadius: 'var(--radius-sm)',
              padding: '3px 7px',
            }}
          >
            <span style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>You:</span>
            <select
              aria-label="Active user persona"
              value={currentUser.id}
              onChange={(e) => {
                const u = MOCK_USERS.find((x) => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              style={{
                background: 'transparent',
                color: 'var(--ink-primary)',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                padding: 0,
                minHeight: '24px',
              }}
            >
              {MOCK_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleOpenSecondTab}
              className="btn-subtle"
              style={{ fontSize: 11, padding: '1px 5px', color: 'var(--signal-blue)' }}
              aria-label="Open second tab for split-screen testing"
              title="Launch second browser window to test live updates"
            >
              <ExternalLink size={11} />
              <span>2nd tab</span>
            </button>
          </div>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextMuted = soundService.toggleMute();
              setIsMuted(nextMuted);
              if (!nextMuted) soundService.playClick();
            }}
            className="btn-subtle"
            style={{ padding: '6px' }}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            title={isMuted ? 'Unmute mechanical audio' : 'Mute audio feedback'}
          >
            {isMuted ? <VolumeX size={14} color="var(--ink-muted)" /> : <Volume2 size={14} color="var(--ink-secondary)" />}
          </button>

          {/* Reset State */}
          <button
            onClick={() => {
              soundService.playClick();
              resetBoard();
            }}
            className="btn-subtle"
            style={{ padding: '6px' }}
            aria-label="Reset board to default state"
            title="Reset board state"
          >
            <RotateCcw size={13} />
          </button>

          {/* /brag Launch Showcase Trigger */}
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setIsBragOpen(true);
            }}
            className="btn-outlined"
            style={{
              fontSize: 12,
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              borderColor: 'rgba(249, 115, 22, 0.4)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--ink-primary)',
            }}
            title="Launch /brag showcase studio (B)"
          >
            <Flame size={13} color="#f97316" />
            <span style={{ fontWeight: 600 }}>/brag</span>
            <Kbd size="sm">B</Kbd>
          </button>

          {/* 40-Second Architectural Workflow Tour Film */}
          {onOpenTour && (
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                onOpenTour();
              }}
              className="btn-outlined"
              style={{
                fontSize: 12,
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                borderColor: 'var(--border-line)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--ink-primary)',
              }}
              title="Watch 40-second workflow architecture film"
            >
              <Film size={13} color="var(--signal-blue)" />
              <span style={{ fontWeight: 600 }}>Tour</span>
            </button>
          )}

          {/* Onboarding Simulator */}
          <button
            onClick={onOpenLanding}
            className="btn-outlined"
            style={{ fontSize: 12, padding: '5px 10px' }}
          >
            Demo
          </button>

          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="btn-subtle"
              style={{ fontSize: 12, padding: '5px 8px', color: 'var(--ink-secondary)' }}
              title="Return to marketing landing page"
            >
              Landing
            </button>
          )}

          {/* Invite CTA */}
          <button
            onClick={onOpenInvite}
            className="btn-solid"
            style={{ padding: '6px 12px', fontSize: 12.5 }}
            aria-label="Invite teammate to board"
          >
            <UserPlus size={13} />
            <span>Invite</span>
          </button>
        </div>

        {/* Mobile Header Controls (< 768px): Avatar + Hamburger Trigger */}
        <div className="show-mobile" style={{ alignItems: 'center', gap: 8 }}>
          <div
            title={`Active: ${currentUser.name}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '2px solid var(--signal-blue)',
                objectFit: 'cover',
              }}
            />
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="touch-target btn-outlined"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              minWidth: 44,
              minHeight: 44,
            }}
            aria-label="Open workspace controls menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Accessible Slide-out Panel with 44px Tap Hitboxes) */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="mobile-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Workspace controls"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 16,
                borderBottom: '1px solid var(--border-line)',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontal size={18} color="var(--signal-blue)" />
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink-primary)' }}>
                  Workspace controls
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="touch-target btn-subtle"
                style={{ minWidth: 44, minHeight: 44, padding: 8 }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--ink-secondary)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Search cards
              </label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Filter by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: 34,
                    minHeight: 44,
                    fontSize: 14,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-line)',
                    backgroundColor: 'var(--bg-app)',
                  }}
                />
              </div>
            </div>

            {/* Mobile Filter */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--ink-secondary)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Filter by assignee
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => setFilterAssignedToMe(false)}
                  className="btn-touch"
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    fontSize: 13,
                    border: `1px solid ${
                      !filterAssignedToMe ? 'var(--signal-blue-border)' : 'var(--border-line)'
                    }`,
                    backgroundColor: !filterAssignedToMe ? 'var(--signal-blue-tint)' : 'var(--bg-surface)',
                    color: !filterAssignedToMe ? 'var(--signal-blue)' : 'var(--ink-secondary)',
                  }}
                >
                  All cards
                </button>
                <button
                  type="button"
                  onClick={() => setFilterAssignedToMe(true)}
                  className="btn-touch"
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    fontSize: 13,
                    border: `1px solid ${
                      filterAssignedToMe ? 'var(--signal-blue-border)' : 'var(--border-line)'
                    }`,
                    backgroundColor: filterAssignedToMe ? 'var(--signal-blue-tint)' : 'var(--bg-surface)',
                    color: filterAssignedToMe ? 'var(--signal-blue)' : 'var(--ink-secondary)',
                  }}
                >
                  Assigned ({assignedCount})
                </button>
              </div>
            </div>

            {/* Mobile Persona Switcher */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--ink-secondary)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Active persona
              </label>
              <select
                aria-label="Active user persona"
                value={currentUser.id}
                onChange={(e) => {
                  const u = MOCK_USERS.find((x) => x.id === e.target.value);
                  if (u) setCurrentUser(u);
                }}
                style={{
                  width: '100%',
                  minHeight: 44,
                  fontSize: 14,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-line)',
                  padding: '8px 12px',
                  fontWeight: 600,
                }}
              >
                {MOCK_USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Actions Stack with 44px Tap Hitboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInvite();
                }}
                className="btn-solid btn-touch"
                style={{ width: '100%' }}
              >
                <UserPlus size={16} />
                <span>Invite teammate</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  soundService.playClick();
                  setIsBragOpen(true);
                }}
                className="btn-outlined btn-touch"
                style={{ width: '100%', borderColor: 'rgba(249, 115, 22, 0.4)' }}
              >
                <Flame size={16} color="#f97316" />
                <span>/brag Launch Showcase</span>
              </button>

              {onOpenTour && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    soundService.playClick();
                    onOpenTour();
                  }}
                  className="btn-outlined btn-touch"
                  style={{ width: '100%' }}
                >
                  <Film size={16} color="var(--signal-blue)" />
                  <span>40s Workflow Architecture Film</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenSecondTab();
                }}
                className="btn-outlined btn-touch"
                style={{ width: '100%' }}
              >
                <ExternalLink size={16} />
                <span>Open split-screen tab</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLanding();
                }}
                className="btn-outlined btn-touch"
                style={{ width: '100%' }}
              >
                <span>Onboarding walkthrough</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  resetBoard();
                }}
                className="btn-subtle btn-touch"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RotateCcw size={15} />
                <span>Reset board state</span>
              </button>

              {onBackToLanding && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onBackToLanding();
                  }}
                  className="btn-subtle btn-touch"
                  style={{ width: '100%', justifyContent: 'center', color: 'var(--signal-blue)' }}
                >
                  <span>Return to landing page</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
