import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { CardItem } from './CardItem';
import { BoardSkeleton } from './BoardSkeleton';
import type { Section, Card } from '../types';
import { soundService } from '../services/soundService';
import { Kbd } from './ui/Kbd';
import { Plus, Columns, Sparkles, Flame } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { board, loading, createCard, moveCard, filterAssignedToMe, currentUser, searchQuery, setIsBragOpen } = useBoard();

  const [activeNewCardSectionId, setActiveNewCardSectionId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [selectedMobileSectionId, setSelectedMobileSectionId] = useState<string | null>(null);

  if (loading || !board) {
    return <BoardSkeleton />;
  }

  const activeMobileColId = selectedMobileSectionId || (board.sections.length > 0 ? (board.sections[0]?.id ?? null) : null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.classList.add('dragging');
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedCardId(null);
    setDragOverSectionId(null);
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('dragging');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSectionId !== sectionId) {
      setDragOverSectionId(sectionId);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetSectionId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    setDragOverSectionId(null);
    setDraggedCardId(null);

    if (!cardId) return;

    const sectionCards = board.cards
      .filter((c) => c.sectionId === targetSectionId)
      .sort((a, b) => a.order - b.order);

    const maxOrder = sectionCards.length > 0 ? (sectionCards[sectionCards.length - 1]?.order ?? 0) : 0;
    const newOrder = maxOrder + 1000;

    const targetSection = board.sections.find((s) => s.id === targetSectionId);
    if (targetSection?.title.toLowerCase().includes('done')) {
      soundService.playDone();
    } else {
      soundService.playSnap();
    }

    await moveCard(cardId, targetSectionId, newOrder);
  };

  const handleCreateSubmit = async (sectionId: string) => {
    if (!newCardTitle.trim()) return;
    soundService.playClick();
    await createCard(sectionId, newCardTitle);
    setNewCardTitle('');
    setActiveNewCardSectionId(null);
  };

  return (
    <main
      style={{
        padding: 'clamp(12px, 3vw, 24px)',
        width: '100%',
        maxWidth: '100vw',
        minHeight: 'calc(100vh - 54px)',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      {/* Mobile Column Segmented Selector Bar (< 768px, zero horizontal overflow) */}
      <div
        className="show-mobile"
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 16,
          width: '100%',
          overflowX: 'auto',
          paddingBottom: 4,
          WebkitOverflowScrolling: 'touch',
        }}
        role="tablist"
        aria-label="Kanban columns selector"
      >
        {board.sections.map((section: Section) => {
          let count = board.cards.filter((c) => c.sectionId === section.id).length;
          const isSelected = activeMobileColId === section.id;
          return (
            <button
              key={section.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedMobileSectionId(section.id)}
              className="touch-target"
              style={{
                flex: '1 0 auto',
                minHeight: 44,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12.5,
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: isSelected ? 'var(--signal-blue-tint)' : 'var(--bg-surface)',
                border: `1px solid ${isSelected ? 'var(--signal-blue-border)' : 'var(--border-line)'}`,
                color: isSelected ? 'var(--signal-blue)' : 'var(--ink-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{section.title}</span>
              <span
                className="num"
                style={{
                  fontSize: 11,
                  marginLeft: 5,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isSelected ? 'rgba(27, 77, 255, 0.15)' : 'var(--bg-app)',
                  color: isSelected ? 'var(--signal-blue)' : 'var(--ink-muted)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Adaptive Grid: 4 columns on Desktop (1024px+), 2 columns on Tablet (768-1023px), 1 fluid column on Mobile (<768px) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 16,
          alignItems: 'start',
          width: '100%',
        }}
      >
        {board.sections.map((section: Section) => {
          let sectionCards = board.cards
            .filter((c) => c.sectionId === section.id)
            .sort((a, b) => a.order - b.order);

          if (filterAssignedToMe) {
            sectionCards = sectionCards.filter((c) =>
              c.assignees.some((a) => a.id === currentUser.id)
            );
          }

          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            sectionCards = sectionCards.filter(
              (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
            );
          }

          const isOver = dragOverSectionId === section.id;
          const isAdding = activeNewCardSectionId === section.id;
          const isHiddenOnMobile = activeMobileColId !== section.id;

          return (
            <div
              key={section.id}
              className={`${isHiddenOnMobile ? 'hide-mobile' : ''} ${isOver ? 'column-magnetic-active' : ''}`}
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDrop={(e) => handleDrop(e, section.id)}
              style={{
                backgroundColor: isOver ? 'var(--signal-blue-tint)' : 'var(--bg-column)',
                border: isOver ? '1px dashed var(--signal-blue)' : '1px solid var(--border-line)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '480px',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'background-color 120ms ease, border-color 120ms ease',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px 12px 6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-primary)' }}>
                    {section.title}
                  </span>
                  <Kbd size="sm">{sectionCards.length}</Kbd>

                  {section.title.toLowerCase().includes('done') && sectionCards.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundService.playClick();
                        setIsBragOpen(true);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3.5,
                        padding: '1.5px 6px',
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: '#ea580c',
                        backgroundColor: 'rgba(249, 115, 22, 0.12)',
                        border: '1px solid rgba(249, 115, 22, 0.25)',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'pointer',
                        transition: 'all 120ms ease',
                      }}
                      title="Turn this completed sprint into a launch showcase (/brag)"
                    >
                      <Flame size={11} color="#f97316" />
                      <span>/brag</span>
                    </button>
                  )}
                </div>

                {/* Accessible 44px Tap Hitbox on Touchscreens */}
                <button
                  onClick={() => {
                    soundService.playClick();
                    setActiveNewCardSectionId(isAdding ? null : section.id);
                    setNewCardTitle('');
                  }}
                  className="touch-target btn-subtle"
                  style={{
                    borderRadius: 'var(--radius-xs)',
                    minWidth: 40,
                    minHeight: 40,
                  }}
                  aria-label={`Add card to ${section.title}`}
                  title={`Add card to ${section.title}`}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Inline Add Card Box */}
              {isAdding && (
                <div
                  className="inline-card-animate"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-focus)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    marginBottom: 10,
                    boxShadow: '0 2px 8px rgba(27,77,255,0.08)',
                  }}
                >
                  <textarea
                    autoFocus
                    rows={2}
                    aria-label={`New card title for ${section.title}`}
                    placeholder="Task title..."
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCreateSubmit(section.id);
                      }
                      if (e.key === 'Escape') setActiveNewCardSectionId(null);
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      resize: 'none',
                      padding: 0,
                      fontSize: 14,
                      color: 'var(--ink-primary)',
                      outline: 'none',
                      lineHeight: 1.4,
                      boxShadow: 'none',
                      minHeight: 44,
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveNewCardSectionId(null)}
                      className="touch-target btn-subtle"
                      style={{
                        padding: '6px 12px',
                        fontSize: 13,
                        minHeight: 40,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateSubmit(section.id)}
                      className="touch-target btn-solid"
                      style={{
                        padding: '6px 14px',
                        fontSize: 13,
                        minHeight: 40,
                      }}
                      disabled={!newCardTitle.trim()}
                    >
                      Add card
                    </button>
                  </div>
                </div>
              )}

              {/* Cards List */}
              <div style={{ flex: 1, minHeight: 80 }}>
                {/* Magnetic Dropzone indicator when dragging card over this section */}
                {isOver && draggedCardId && (
                  <div className="magnetic-dropzone">
                    <Sparkles size={13} />
                    <span>Drop to move here</span>
                  </div>
                )}

                {sectionCards.map((card: Card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}

                {sectionCards.length === 0 && !isAdding && (
                  <div
                    onClick={() => setActiveNewCardSectionId(section.id)}
                    style={{
                      border: '1px dashed var(--border-line)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '36px 16px',
                      textAlign: 'center',
                      color: 'var(--ink-muted)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      marginTop: 6,
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    + Add card
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
