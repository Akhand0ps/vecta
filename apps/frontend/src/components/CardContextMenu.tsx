import React, { useEffect, useRef, useState } from 'react';
import type { Card } from '../types';
import { useBoard } from '../context/BoardContext';
import { useToast } from '../context/ToastContext';
import { soundService } from '../services/soundService';
import { MOCK_USERS } from '../services/mockStorage';
import { Kbd } from './ui/Kbd';
import {
  Layers,
  Flag,
  User,
  Trash2,
  Copy,
  ChevronRight,
  Check,
} from 'lucide-react';

export interface CardContextMenuProps {
  card: Card;
  position: { x: number; y: number };
  onClose: () => void;
}

export const CardContextMenu: React.FC<CardContextMenuProps> = ({ card, position, onClose }) => {
  const { board, moveCard, updateCard, deleteCard, createCard, toggleAssignee } = useBoard();
  const { addToast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);

  const [activeSubmenu, setActiveSubmenu] = useState<'section' | 'priority' | 'assignee' | null>(null);

  // Play subtle pop sound on menu summon
  useEffect(() => {
    soundService.playPop();
  }, []);

  // Dismiss on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust coordinates so menu never overflows screen boundaries
  const adjustedX = Math.min(position.x, typeof window !== 'undefined' ? window.innerWidth - 230 : position.x);
  const adjustedY = Math.min(position.y, typeof window !== 'undefined' ? window.innerHeight - 300 : position.y);

  const handleMoveTo = async (targetSectionId: string) => {
    if (targetSectionId === card.sectionId) {
      onClose();
      return;
    }
    soundService.playSnap();
    const sectionCards = (board?.cards || [])
      .filter((c) => c.sectionId === targetSectionId)
      .sort((a, b) => a.order - b.order);
    const maxOrder = sectionCards.length > 0 ? (sectionCards[sectionCards.length - 1]?.order ?? 0) : 0;
    await moveCard(card.id, targetSectionId, maxOrder + 1000);

    const sectionName = board?.sections.find((s) => s.id === targetSectionId)?.title || 'Column';
    addToast({
      title: `Moved to ${sectionName}`,
      description: `"${card.title}"`,
      type: 'info',
    });
    onClose();
  };

  const handleSetPriority = async (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    soundService.playClick();
    await updateCard(card.id, { priority });
    onClose();
  };

  const handleCopyLink = () => {
    soundService.playClick();
    const url = `${window.location.origin}/?board=true&card=${card.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    addToast({
      title: 'Link copied to clipboard',
      type: 'success',
      duration: 3000,
    });
    onClose();
  };

  const handleDeleteWithUndo = async () => {
    soundService.playClick();
    const deletedCardData = { ...card };
    await deleteCard(card.id);
    onClose();

    addToast({
      title: 'Card deleted',
      description: `"${deletedCardData.title}" was removed`,
      type: 'warning',
      duration: 6000,
      action: {
        label: 'Undo',
        onClick: async () => {
          soundService.playSnap();
          await createCard(deletedCardData.sectionId, deletedCardData.title);
          addToast({ title: 'Card restored', type: 'success', duration: 3000 });
        },
      },
    });
  };

  return (
    <div
      ref={menuRef}
      className="card-context-menu"
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        zIndex: 200,
      }}
    >
      {/* 1. Move to Section */}
      <div
        className="context-menu-item"
        onMouseEnter={() => setActiveSubmenu('section')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={14} className="text-muted" />
          <span>Move to...</span>
        </div>
        <ChevronRight size={13} color="var(--ink-muted)" />

        {activeSubmenu === 'section' && (
          <div className="context-submenu">
            {board?.sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                className="context-menu-subitem"
                onClick={() => handleMoveTo(sec.id)}
              >
                <span>{sec.title}</span>
                {sec.id === card.sectionId && <Check size={13} color="var(--signal-blue)" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Set Priority */}
      <div
        className="context-menu-item"
        onMouseEnter={() => setActiveSubmenu('priority')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flag size={14} className="text-muted" />
          <span>Priority</span>
        </div>
        <ChevronRight size={13} color="var(--ink-muted)" />

        {activeSubmenu === 'priority' && (
          <div className="context-submenu">
            {[
              { id: 'low', label: 'Low', color: 'var(--ink-muted)' },
              { id: 'medium', label: 'Medium', color: 'var(--signal-blue)' },
              { id: 'high', label: 'High priority', color: 'var(--signal-amber)' },
              { id: 'urgent', label: 'Urgent', color: 'var(--signal-rose)' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className="context-menu-subitem"
                onClick={() => handleSetPriority(p.id as any)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: p.color }} />
                  <span>{p.label}</span>
                </div>
                {card.priority === p.id && <Check size={13} color="var(--signal-blue)" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Assignees */}
      <div
        className="context-menu-item"
        onMouseEnter={() => setActiveSubmenu('assignee')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={14} className="text-muted" />
          <span>Assign to...</span>
        </div>
        <ChevronRight size={13} color="var(--ink-muted)" />

        {activeSubmenu === 'assignee' && (
          <div className="context-submenu">
            {MOCK_USERS.map((usr) => {
              const isAssigned = card.assignees.some((a) => a.id === usr.id);
              return (
                <button
                  key={usr.id}
                  type="button"
                  className="context-menu-subitem"
                  onClick={() => {
                    soundService.playClick();
                    toggleAssignee(card.id, usr);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <img
                      src={usr.avatarUrl}
                      alt={usr.name}
                      style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span>{usr.name}</span>
                  </div>
                  {isAssigned && <Check size={13} color="var(--signal-blue)" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="context-divider" />

      {/* 4. Copy Link */}
      <button
        type="button"
        className="context-menu-item"
        onMouseEnter={() => setActiveSubmenu(null)}
        onClick={handleCopyLink}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Copy size={14} className="text-muted" />
          <span>Copy card link</span>
        </div>
        <Kbd size="sm">⌘C</Kbd>
      </button>

      {/* 5. Delete Card */}
      <button
        type="button"
        className="context-menu-item danger"
        onMouseEnter={() => setActiveSubmenu(null)}
        onClick={handleDeleteWithUndo}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trash2 size={14} color="var(--signal-rose)" />
          <span>Delete card</span>
        </div>
        <Kbd size="sm">⌫</Kbd>
      </button>
    </div>
  );
};

export default CardContextMenu;
