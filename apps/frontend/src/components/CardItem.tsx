import React, { useState } from 'react';
import type { Card } from '../types';
import { useBoard } from '../context/BoardContext';
import { soundService } from '../services/soundService';
import { CardContextMenu } from './CardContextMenu';
import { MessageSquare, Calendar } from 'lucide-react';

interface CardItemProps {
  card: Card;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onDragStart, onDragEnd }) => {
  const { setActiveCardId, activeCardId, remoteUpdatedCardIds, typingUsers } = useBoard();
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const isSelected = activeCardId === card.id;
  const isRemoteUpdated = remoteUpdatedCardIds.has(card.id);
  const typers = typingUsers[card.id] || [];

  // Format Due Date cleanly without fluff
  const dueDateInfo = React.useMemo(() => {
    if (!card.dueDate) return null;
    const due = new Date(card.dueDate);
    const now = new Date();
    const isOverdue = due.getTime() < now.getTime() && Math.abs(due.getTime() - now.getTime()) > 86400000;
    const isToday = due.toDateString() === now.toDateString();

    const formatted = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return {
      text: isToday ? 'Today' : formatted,
      isOverdue,
      isToday,
    };
  }, [card.dueDate]);

  // Priority indicator (Quiet, informative signal)
  const renderPrioritySignal = () => {
    if (!card.priority || card.priority === 'low') return null;

    let dotColor = 'var(--ink-muted)';
    let textColor = 'var(--ink-secondary)';
    let label = 'Medium';

    if (card.priority === 'urgent') {
      dotColor = 'var(--signal-rose)';
      textColor = 'var(--signal-rose)';
      label = 'Urgent';
    } else if (card.priority === 'high') {
      dotColor = 'var(--signal-amber)';
      textColor = 'var(--signal-amber)';
      label = 'High priority';
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: textColor }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: dotColor }} />
        <span>{label}</span>
      </div>
    );
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open card: ${card.title}`}
        draggable
        onDragStart={(e) => onDragStart(e, card.id)}
        onDragEnd={onDragEnd}
        onClick={() => {
          soundService.playClick();
          setActiveCardId(card.id);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenuPos({ x: e.clientX, y: e.clientY });
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            soundService.playClick();
            setActiveCardId(card.id);
          }
        }}
        className={`kanban-card ${isRemoteUpdated ? 'peer-updated' : ''} ${isSelected ? 'active-inspected' : ''}`}
      >
      {/* Priority or Category if relevant */}
      {card.priority && card.priority !== 'low' && (
        <div style={{ marginBottom: 6 }}>
          {renderPrioritySignal()}
        </div>
      )}

      {/* Card Title */}
      <h4 style={{
        fontSize: 13.5,
        fontWeight: 600,
        color: 'var(--ink-primary)',
        lineHeight: 1.45,
        marginBottom: 10,
      }}>
        {card.title}
      </h4>

      {/* Footer: Due date, comments, typing & assignees */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Due date tag */}
          {dueDateInfo && (
            <div
              className="tabular"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11.5,
                fontWeight: 500,
                color: dueDateInfo.isOverdue
                  ? 'var(--signal-rose)'
                  : dueDateInfo.isToday
                  ? 'var(--signal-amber)'
                  : 'var(--ink-muted)',
              }}
            >
              <Calendar size={11} />
              <span>{dueDateInfo.text}</span>
            </div>
          )}

          {/* Comments count */}
          {card.comments.length > 0 && (
            <div
              className="tabular"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3.5,
                fontSize: 11.5,
                color: 'var(--ink-muted)',
                fontWeight: 500,
              }}
            >
              <MessageSquare size={11.5} />
              <span>{card.comments.length}</span>
            </div>
          )}

          {/* Peer typing activity */}
          {typers.length > 0 && (
            <div
              style={{
                fontSize: 11,
                color: 'var(--signal-blue)',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span className="status-pip" style={{ width: 4.5, height: 4.5, backgroundColor: 'var(--signal-blue)' }} />
              <span>{(typers[0]?.name.split(' ')[0]) ?? ''} typing</span>
            </div>
          )}
        </div>

        {/* Assignee Avatars */}
        {card.assignees.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {card.assignees.map((assignee, idx) => (
              <img
                key={assignee.id}
                src={assignee.avatarUrl}
                alt={assignee.name}
                title={assignee.name}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '1.5px solid #ffffff',
                  marginLeft: idx === 0 ? 0 : -5,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    {contextMenuPos && (
      <CardContextMenu
        card={card}
        position={contextMenuPos}
        onClose={() => setContextMenuPos(null)}
      />
    )}
  </>
  );
};
