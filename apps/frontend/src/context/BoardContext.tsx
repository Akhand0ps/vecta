import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Board, Card, Comment, PresenceUser, RealtimeEvent, User } from '../types';
import { MOCK_USERS, resetStoredBoard } from '../services/mockStorage';
import { boardService } from '../services/boardService';
import { realtimeChannel } from '../services/realtimeChannel';

interface BoardContextType {
  board: Board | null;
  loading: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  presenceUsers: PresenceUser[];
  activeCardId: string | null;
  setActiveCardId: (id: string | null) => void;
  typingUsers: Record<string, User[]>; // cardId -> list of typing users
  setTyping: (cardId: string, isTyping: boolean) => void;
  filterAssignedToMe: boolean;
  setFilterAssignedToMe: (val: boolean | ((prev: boolean) => boolean)) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  remoteUpdatedCardIds: Set<string>;
  moveCard: (cardId: string, targetSectionId: string, newOrder: number) => Promise<void>;
  createCard: (sectionId: string, title: string) => Promise<Card | null>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  addComment: (cardId: string, content: string) => Promise<Comment | null>;
  toggleAssignee: (cardId: string, user: User) => Promise<void>;
  isBragOpen: boolean;
  setIsBragOpen: React.Dispatch<React.SetStateAction<boolean>>;
  resetBoard: () => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize persona per tab: check URL param ?user=sam, then sessionStorage, default to Alex
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('user');
      if (userParam === 'sam') return MOCK_USERS[1];
      if (userParam === 'alex') return MOCK_USERS[0];

      const storedUserId = sessionStorage.getItem('vecta_active_user');
      const found = MOCK_USERS.find((u) => u.id === storedUserId);
      if (found) return found;
    }
    return MOCK_USERS[0];
  });

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('vecta_active_user', user.id);
    }
  }, []);

  const [activeCardId, setActiveCardIdState] = useState<string | null>(null);
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceUser>>(new Map());
  const [typingMap, setTypingMap] = useState<Record<string, { user: User; expires: number }[]>>({});
  const [remoteUpdatedCardIds, setRemoteUpdatedCardIds] = useState<Set<string>>(new Set());
  const [isBragOpen, setIsBragOpen] = useState(false);

  // Filters
  const [filterAssignedToMe, setFilterAssignedToMe] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const setActiveCardId = useCallback((id: string | null) => {
    setActiveCardIdState(id);
    realtimeChannel.setActiveCard(id);
  }, []);

  // Fetch initial board
  const loadBoardData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await boardService.fetchBoard();
      setBoard(data);
    } catch (e) {
      console.error('Failed to load board', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  // Start Presence Heartbeat for this tab
  useEffect(() => {
    realtimeChannel.startHeartbeat(currentUser, () => activeCardId);
    return () => {
      realtimeChannel.stopHeartbeat();
    };
  }, [currentUser, activeCardId]);

  // Clean stale presence entries every 2.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setPresenceMap((prev) => {
        let changed = false;
        const next = new Map(prev);
        for (const [key, p] of next.entries()) {
          // Remove if heartbeat wasn't received in last 6 seconds
          if (now - p.lastSeen > 6000) {
            next.delete(key);
            changed = true;
          }
        }
        return changed ? next : prev;
      });

      // Also clean expired typing indicators
      setTypingMap((prev) => {
        let changed = false;
        const next: Record<string, { user: User; expires: number }[]> = {};
        for (const [cardId, list] of Object.entries(prev)) {
          const valid = list.filter((t) => t.expires > now);
          if (valid.length !== list.length) changed = true;
          if (valid.length > 0) next[cardId] = valid;
        }
        return changed ? next : prev;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Listen to Realtime Channel events
  useEffect(() => {
    const unsubscribe = realtimeChannel.subscribe((event: RealtimeEvent) => {
      switch (event.type) {
        case 'CARD_MOVED': {
          const { cardId, targetSectionId, newOrder } = event.payload;
          setBoard((prev) => {
            if (!prev) return prev;
            const updatedCards = prev.cards.map((card) => {
              if (card.id === cardId) {
                return { ...card, sectionId: targetSectionId, order: newOrder };
              }
              return card;
            });
            return { ...prev, cards: updatedCards };
          });

          // Highlight card with subtle glow animation
          setRemoteUpdatedCardIds((prev) => new Set(prev).add(cardId));
          setTimeout(() => {
            setRemoteUpdatedCardIds((prev) => {
              const next = new Set(prev);
              next.delete(cardId);
              return next;
            });
          }, 2000);
          break;
        }

        case 'CARD_CREATED': {
          const { card } = event.payload;
          setBoard((prev) => {
            if (!prev) return prev;
            // Prevent duplicate if created locally
            if (prev.cards.some((c) => c.id === card.id)) return prev;
            return { ...prev, cards: [...prev.cards, card] };
          });
          setRemoteUpdatedCardIds((prev) => new Set(prev).add(card.id));
          setTimeout(() => {
            setRemoteUpdatedCardIds((prev) => {
              const next = new Set(prev);
              next.delete(card.id);
              return next;
            });
          }, 2000);
          break;
        }

        case 'CARD_UPDATED': {
          const { cardId, updates } = event.payload;
          setBoard((prev) => {
            if (!prev) return prev;
            const updatedCards = prev.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c));
            return { ...prev, cards: updatedCards };
          });
          break;
        }

        case 'CARD_DELETED': {
          const { cardId } = event.payload;
          setBoard((prev) => {
            if (!prev) return prev;
            return { ...prev, cards: prev.cards.filter((c) => c.id !== cardId) };
          });
          break;
        }

        case 'COMMENT_ADDED': {
          const { cardId, comment } = event.payload;
          setBoard((prev) => {
            if (!prev) return prev;
            const updatedCards = prev.cards.map((card) => {
              if (card.id === cardId) {
                if (card.comments.some((c) => c.id === comment.id)) return card;
                return { ...card, comments: [...card.comments, comment] };
              }
              return card;
            });
            return { ...prev, cards: updatedCards };
          });
          break;
        }

        case 'USER_TYPING': {
          const { cardId, user, isTyping } = event.payload;
          if (user.id === currentUser.id) break; // ignore own typing
          setTypingMap((prev) => {
            const list = prev[cardId] || [];
            if (isTyping) {
              const filtered = list.filter((t) => t.user.id !== user.id);
              return {
                ...prev,
                [cardId]: [...filtered, { user, expires: Date.now() + 4000 }],
              };
            } else {
              return {
                ...prev,
                [cardId]: list.filter((t) => t.user.id !== user.id),
              };
            }
          });
          break;
        }

        case 'PRESENCE_HEARTBEAT': {
          const { user, activeCardId: userActiveCard, tabId, timestamp } = event.payload;
          setPresenceMap((prev) => {
            const next = new Map(prev);
            next.set(tabId, {
              user,
              tabId,
              lastSeen: timestamp,
              activeCardId: userActiveCard,
            });
            return next;
          });
          break;
        }

        case 'PRESENCE_LEAVE': {
          const { tabId } = event.payload;
          setPresenceMap((prev) => {
            const next = new Map(prev);
            next.delete(tabId);
            return next;
          });
          break;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser.id]);

  // Board Mutators
  const moveCard = useCallback(
    async (cardId: string, targetSectionId: string, newOrder: number) => {
      if (!board) return;
      const targetCard = board.cards.find((c) => c.id === cardId);
      if (!targetCard) return;

      const sourceSectionId = targetCard.sectionId;

      // Optimistic update
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: prev.cards.map((c) =>
            c.id === cardId ? { ...c, sectionId: targetSectionId, order: newOrder } : c
          ),
        };
      });

      try {
        await boardService.moveCard(cardId, sourceSectionId, targetSectionId, newOrder, currentUser);
      } catch (err) {
        console.error('Failed to persist card move, rolling back', err);
        loadBoardData();
      }
    },
    [board, currentUser, loadBoardData]
  );

  const createCard = useCallback(
    async (sectionId: string, title: string) => {
      if (!title.trim()) return null;
      try {
        const newCard = await boardService.createCard(sectionId, title, currentUser);
        setBoard((prev) => (prev ? { ...prev, cards: [...prev.cards, newCard] } : prev));
        return newCard;
      } catch (err) {
        console.error('Failed to create card', err);
        return null;
      }
    },
    [currentUser]
  );

  const updateCard = useCallback(
    async (cardId: string, updates: Partial<Card>) => {
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: prev.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
        };
      });

      try {
        await boardService.updateCard(cardId, updates, currentUser);
      } catch (err) {
        console.error('Failed to update card', err);
        loadBoardData();
      }
    },
    [currentUser, loadBoardData]
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      if (!board) return;
      const card = board.cards.find((c) => c.id === cardId);
      if (!card) return;

      setBoard((prev) => (prev ? { ...prev, cards: prev.cards.filter((c) => c.id !== cardId) } : prev));
      try {
        await boardService.deleteCard(cardId, card.sectionId, currentUser);
      } catch (err) {
        console.error('Failed to delete card', err);
        loadBoardData();
      }
    },
    [board, currentUser, loadBoardData]
  );

  const addComment = useCallback(
    async (cardId: string, content: string) => {
      if (!content.trim()) return null;
      try {
        const comment = await boardService.addComment(cardId, content.trim(), currentUser);
        setBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            cards: prev.cards.map((c) =>
              c.id === cardId ? { ...c, comments: [...c.comments, comment] } : c
            ),
          };
        });
        return comment;
      } catch (err) {
        console.error('Failed to add comment', err);
        return null;
      }
    },
    [currentUser]
  );

  const toggleAssignee = useCallback(
    async (cardId: string, user: User) => {
      if (!board) return;
      const card = board.cards.find((c) => c.id === cardId);
      if (!card) return;

      const exists = card.assignees.some((a) => a.id === user.id);
      const newAssignees = exists
        ? card.assignees.filter((a) => a.id !== user.id)
        : [...card.assignees, user];

      await updateCard(cardId, { assignees: newAssignees });
    },
    [board, updateCard]
  );

  const setTyping = useCallback(
    (cardId: string, isTyping: boolean) => {
      realtimeChannel.publish({
        type: 'USER_TYPING',
        payload: {
          cardId,
          user: currentUser,
          isTyping,
          timestamp: Date.now(),
        },
      });
    },
    [currentUser]
  );

  const resetBoard = useCallback(() => {
    const fresh = resetStoredBoard();
    setBoard(fresh);
    realtimeChannel.publish({
      type: 'CARD_UPDATED',
      payload: {
        cardId: 'all',
        updates: {},
        updatedBy: currentUser,
        timestamp: Date.now(),
      },
    });
  }, [currentUser]);

  // Derived presence list: unique users currently online
  const presenceUsers = useMemo(() => {
    const list: PresenceUser[] = [];
    const seenUserIds = new Set<string>();

    // Put current user first
    list.push({
      user: currentUser,
      tabId: realtimeChannel.tabId,
      lastSeen: Date.now(),
      activeCardId,
    });
    seenUserIds.add(currentUser.id);

    for (const p of presenceMap.values()) {
      if (!seenUserIds.has(p.user.id)) {
        list.push(p);
        seenUserIds.add(p.user.id);
      }
    }
    return list;
  }, [currentUser, activeCardId, presenceMap]);

  // Derived typing users map
  const typingUsers = useMemo(() => {
    const res: Record<string, User[]> = {};
    for (const [cardId, list] of Object.entries(typingMap)) {
      res[cardId] = list.map((t) => t.user);
    }
    return res;
  }, [typingMap]);

  return (
    <BoardContext.Provider
      value={{
        board,
        loading,
        currentUser,
        setCurrentUser,
        presenceUsers,
        activeCardId,
        setActiveCardId,
        typingUsers,
        setTyping,
        filterAssignedToMe,
        setFilterAssignedToMe,
        searchQuery,
        setSearchQuery,
        remoteUpdatedCardIds,
        moveCard,
        createCard,
        updateCard,
        deleteCard,
        addComment,
        toggleAssignee,
        isBragOpen,
        setIsBragOpen,
        resetBoard,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error('useBoard must be used within a BoardProvider');
  return context;
};
