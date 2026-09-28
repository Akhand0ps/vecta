import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useBoard } from '../context/BoardContext';
import { MOCK_USERS } from '../services/mockStorage';
import {
  X,
  Calendar,
  MessageSquare,
  Trash2,
  Send,
  Check,
  ChevronUp,
  ChevronDown,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CardDetailModal: React.FC = () => {
  const {
    board,
    activeCardId,
    setActiveCardId,
    updateCard,
    deleteCard,
    addComment,
    toggleAssignee,
    setTyping,
    typingUsers,
    currentUser,
  } = useBoard();

  const card = board?.cards.find((c) => c.id === activeCardId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commentText, setCommentText] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isClosing, setIsClosing] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state whenever active card changes
  useEffect(() => {
    setIsClosing(false);
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setDueDate(card.dueDate ? (card.dueDate.split('T')[0] ?? '') : '');
    }
  }, [card?.id]);

  // Section cards for J / K and prev / next navigation
  const currentSection = board?.sections.find((s) => s.id === card?.sectionId);
  const sectionCards = useMemo(() => {
    if (!board || !card) return [];
    return board.cards
      .filter((c) => c.sectionId === card.sectionId)
      .sort((a, b) => a.order - b.order);
  }, [board, card?.sectionId]);

  const currentIndex = sectionCards.findIndex((c) => c.id === card?.id);
  const prevCard = currentIndex > 0 ? (sectionCards[currentIndex - 1] ?? null) : null;
  const nextCard =
    currentIndex >= 0 && currentIndex < sectionCards.length - 1
      ? (sectionCards[currentIndex + 1] ?? null)
      : null;

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    if (card) setTyping(card.id, false);
    setTimeout(() => {
      setActiveCardId(null);
      setIsClosing(false);
    }, 150);
  };

  const handleNavigate = (targetId: string | null) => {
    if (!targetId) return;
    if (card) setTyping(card.id, false);
    setActiveCardId(targetId);
  };

  // Keyboard navigation: Escape closes; J/K & Arrows navigate between cards when not typing in an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (!isInputFocused) {
        if ((e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') && nextCard) {
          e.preventDefault();
          handleNavigate(nextCard.id);
        } else if ((e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') && prevCard) {
          e.preventDefault();
          handleNavigate(prevCard.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [card?.id, isClosing, prevCard, nextCard]);

  if (!card) return null;

  const activeTypers = (typingUsers[card.id] || []).filter((u) => u.id !== currentUser.id);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(e.target.value);
    setTyping(card.id, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(card.id, false);
    }, 2000);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setTyping(card.id, false);
    await addComment(card.id, commentText);
    setCommentText('');
  };

  const handleDueDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDueDate(val);
    await updateCard(card.id, { dueDate: val ? new Date(val).toISOString() : null });
  };

  const handleSectionChange = async (newSectionId: string) => {
    await updateCard(card.id, { sectionId: newSectionId });
  };

  const handlePriorityChange = async (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    await updateCard(card.id, { priority });
  };

  // Priority color signal
  const priorityColor =
    card.priority === 'urgent'
      ? 'var(--signal-rose)'
      : card.priority === 'high'
      ? 'var(--signal-amber)'
      : card.priority === 'low'
      ? 'var(--ink-muted)'
      : 'var(--signal-blue)';

  return (
    <div
      className={`card-dossier-backdrop ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`card-dossier-modal ${isClosing ? 'closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Task details: ${card.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Toolbar: Column Context, Card Pagination (J/K) & Actions */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--border-line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            background: 'var(--bg-surface)',
          }}
        >
          {/* Left: Column Breadcrumb & Quick J/K Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                color: 'var(--ink-secondary)',
                fontWeight: 600,
              }}
            >
              <Layers size={14} className="text-muted" />
              <span>{currentSection?.title || 'Board'}</span>
            </div>

            {sectionCards.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  background: 'var(--bg-app)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-line)',
                }}
              >
                <button
                  type="button"
                  disabled={!prevCard}
                  onClick={() => handleNavigate(prevCard?.id ?? null)}
                  className="btn-subtle touch-target"
                  title="Previous card (K / ↑)"
                  style={{
                    padding: 2,
                    opacity: prevCard ? 1 : 0.35,
                    cursor: prevCard ? 'pointer' : 'not-allowed',
                    minWidth: 24,
                    minHeight: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronUp size={14} />
                </button>
                <span
                  className="font-mono tabular"
                  style={{ fontSize: 11, color: 'var(--ink-muted)', padding: '0 4px' }}
                >
                  {currentIndex + 1}/{sectionCards.length}
                </span>
                <button
                  type="button"
                  disabled={!nextCard}
                  onClick={() => handleNavigate(nextCard?.id ?? null)}
                  className="btn-subtle touch-target"
                  title="Next card (J / ↓)"
                  style={{
                    padding: 2,
                    opacity: nextCard ? 1 : 0.35,
                    cursor: nextCard ? 'pointer' : 'not-allowed',
                    minWidth: 24,
                    minHeight: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Right: Delete, Keyboard Hints & Dismiss */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              className="font-mono hide-mobile"
              style={{
                fontSize: 10.5,
                color: 'var(--ink-muted)',
                padding: '2px 6px',
                borderRadius: 3,
                background: 'var(--bg-app)',
                border: '1px solid var(--border-line)',
              }}
            >
              [J/K] CARDS
            </span>

            <button
              onClick={async () => {
                if (confirm('Delete this card?')) {
                  await deleteCard(card.id);
                  handleClose();
                }
              }}
              className="touch-target btn-subtle"
              style={{
                color: 'var(--signal-rose)',
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Delete card"
              title="Delete card"
            >
              <Trash2 size={16} />
            </button>

            <button
              onClick={handleClose}
              className="touch-target btn-subtle"
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink-secondary)',
              }}
              aria-label="Close dialog"
              title="Close (Escape)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body: Title, Modern Property Toolbar, Specs, and Comments */}
        <div
          style={{
            padding: 'clamp(18px, 4vw, 26px)',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Card Title Input */}
          <div>
            <input
              type="text"
              aria-label="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (title !== card.title) updateCard(card.id, { title });
              }}
              placeholder="Task title..."
              style={{
                width: '100%',
                fontSize: 'clamp(18px, 3vw, 22px)',
                fontWeight: 700,
                background: 'transparent',
                border: 'none',
                borderRadius: 0,
                color: 'var(--ink-primary)',
                padding: '2px 0 6px 0',
                borderBottom: '1px solid transparent',
                boxShadow: 'none',
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
              }}
              onFocus={(e) => {
                e.target.style.borderBottom = '1px solid var(--border-focus)';
              }}
            />
          </div>

          {/* 3. Modern Horizontal Property Toolbar (Replaces bulky vertical CRUD form) */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              paddingBottom: 16,
              borderBottom: '1px solid var(--border-line)',
            }}
          >
            {/* Column / Status Pill */}
            <div className="property-pill" title="Column Status">
              <span className="status-pip" style={{ width: 6, height: 6, background: 'var(--signal-blue)' }} />
              <select
                aria-label="Column status"
                value={card.sectionId}
                onChange={(e) => handleSectionChange(e.target.value)}
              >
                {board?.sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Pill */}
            <div className="property-pill" title="Priority Level">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: priorityColor,
                }}
              />
              <select
                aria-label="Card priority"
                value={card.priority || 'medium'}
                onChange={(e) => handlePriorityChange(e.target.value as any)}
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium</option>
                <option value="high">High priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Due Date Pill */}
            <div className="property-pill" title="Due Date">
              <Calendar size={13} style={{ color: 'var(--ink-muted)' }} />
              <input
                type="date"
                aria-label="Due date"
                value={dueDate}
                onChange={handleDueDateChange}
              />
            </div>

            {/* Assignee Avatar Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {MOCK_USERS.map((user) => {
                const isAssigned = card.assignees.some((a) => a.id === user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleAssignee(card.id, user)}
                    className={`property-avatar-btn ${isAssigned ? 'assigned' : 'unassigned'}`}
                    title={isAssigned ? `Assigned to ${user.name} (click to remove)` : `Assign to ${user.name}`}
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span>{user.name.split(' ')[0]}</span>
                    {isAssigned && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Specification / Description Body */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--ink-secondary)',
                }}
              >
                Specification
              </label>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                AUTO-SAVING
              </span>
            </div>
            <textarea
              rows={4}
              aria-label="Card description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                if (description !== (card.description || '')) updateCard(card.id, { description });
              }}
              placeholder="Add technical context, acceptance criteria, or architectural notes..."
              style={{
                width: '100%',
                lineHeight: 1.55,
                padding: '12px 14px',
                fontSize: 13.5,
                minHeight: 100,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-line)',
                color: 'var(--ink-primary)',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 5. Live Discussion & Comments Section */}
          <div style={{ paddingTop: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <MessageSquare size={14} color="var(--ink-secondary)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-primary)' }}>
                  Discussion
                </span>
                <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
                  ({card.comments.length})
                </span>
              </div>

              {/* Real-time typing indicators */}
              {activeTypers.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    color: 'var(--signal-blue)',
                    fontStyle: 'italic',
                  }}
                >
                  <span className="status-pip" style={{ background: 'var(--signal-blue)' }} />
                  <span>
                    {activeTypers.map((u) => u.name.split(' ')[0]).join(', ')} typing...
                  </span>
                </div>
              )}
            </div>

            {/* Comment Thread List */}
            {card.comments.length === 0 ? (
              <div
                style={{
                  padding: '18px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px dashed var(--border-line)',
                  color: 'var(--ink-muted)',
                  fontSize: 12.5,
                  textAlign: 'center',
                  marginBottom: 16,
                }}
              >
                No updates recorded yet. Post an update or note below.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {card.comments.map((comm) => (
                  <div
                    key={comm.id}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-line)',
                    }}
                  >
                    <img
                      src={comm.author.avatarUrl}
                      alt={comm.author.name}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        marginTop: 2,
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-primary)' }}>
                          {comm.author.name}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                          {new Date(comm.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: 'var(--ink-secondary)',
                          lineHeight: 1.45,
                          margin: 0,
                          wordBreak: 'break-word',
                        }}
                      >
                        {comm.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Composer */}
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                aria-label="Write a note or update"
                value={commentText}
                onChange={handleCommentChange}
                placeholder="Post a note or update... (Press Enter to post)"
                style={{
                  flex: 1,
                  fontSize: 13,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                }}
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="btn-solid touch-target"
                style={{
                  minHeight: 38,
                  padding: '0 16px',
                  borderRadius: 'var(--radius-sm)',
                  opacity: commentText.trim() ? 1 : 0.45,
                  cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Send size={14} />
                <span className="hide-mobile" style={{ fontSize: 12.5, fontWeight: 600 }}>
                  Post
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;
