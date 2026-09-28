import type { Board, Card, User } from '../types';

export const MOCK_USERS: [User, User] = [
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    email: 'alex@vecta.io',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'ADMIN',
    color: '#6366f1',
  },
  {
    id: 'user_sam',
    name: 'Sam Chen',
    email: 'sam@vecta.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'MEMBER',
    color: '#10b981',
  },
];

const STORAGE_KEY = 'vecta_board_state_v1';

export function getInitialBoard(): Board {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const inThreeDays = new Date(now);
  inThreeDays.setDate(now.getDate() + 3);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  return {
    id: 'board_main',
    title: 'Project Board',
    orgId: 'org_workspace',
    sections: [
      { id: 'sec_backlog', title: 'Backlog', order: 0 },
      { id: 'sec_in_progress', title: 'In Progress', order: 1 },
      { id: 'sec_review', title: 'Review', order: 2 },
      { id: 'sec_done', title: 'Done', order: 3 },
    ],
    cards: [
      {
        id: 'card_1',
        title: 'Design WebSocket message envelopes & state sync',
        description: 'Define exact JSON schema for CARD_MOVED, USER_TYPING, and PRESENCE_HEARTBEAT events.',
        sectionId: 'sec_backlog',
        order: 1000,
        dueDate: inThreeDays.toISOString(),
        priority: 'high',
        assignees: [MOCK_USERS[0]],
        comments: [],
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
      },
      {
        id: 'card_2',
        title: 'Add token rate-limiter for OTP emails',
        description: 'Prevent abuse on auth endpoints using sliding window Redis rate limiting.',
        sectionId: 'sec_backlog',
        order: 2000,
        dueDate: inThreeDays.toISOString(),
        priority: 'medium',
        assignees: [MOCK_USERS[1]],
        comments: [],
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
      },
      {
        id: 'card_3',
        title: 'Implement optimistic drag-and-drop Kanban layout',
        description: 'Zero-latency visual movement when dragging cards between columns. Broadcasts instantly to peers.',
        sectionId: 'sec_in_progress',
        order: 1000,
        dueDate: tomorrow.toISOString(),
        priority: 'urgent',
        assignees: [MOCK_USERS[0], MOCK_USERS[1]],
        comments: [
          {
            id: 'comm_1',
            content: 'Just tested the local drag drop feedback, feels buttery smooth at 60fps!',
            author: MOCK_USERS[0],
            cardId: 'card_3',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'comm_2',
            content: 'Make sure drop targets have a high contrast glowing indicator.',
            author: MOCK_USERS[1],
            cardId: 'card_3',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
        ],
        createdAt: yesterday.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'card_4',
        title: 'Setup Resend email templates for teammate invitations',
        description: 'HTML invite emails with custom workspace branding, token hash, and 7-day expiration.',
        sectionId: 'sec_in_progress',
        order: 2000,
        dueDate: tomorrow.toISOString(),
        priority: 'high',
        assignees: [MOCK_USERS[0]],
        comments: [],
        createdAt: yesterday.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'card_5',
        title: 'Database schema migration for 4 default sections',
        description: 'Replace SectionType enum in Prisma with dynamic titles or updated 4-column enum values.',
        sectionId: 'sec_review',
        order: 1000,
        dueDate: now.toISOString(),
        priority: 'high',
        assignees: [MOCK_USERS[1]],
        comments: [],
        createdAt: yesterday.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'card_6',
        title: 'Product requirements & landing page CTA flow',
        description: 'Creator email input -> OTP verify -> immediate land in populated 4-column project board.',
        sectionId: 'sec_done',
        order: 1000,
        dueDate: yesterday.toISOString(),
        priority: 'medium',
        assignees: [MOCK_USERS[0]],
        comments: [],
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
      },
    ],
  };
}

export function loadStoredBoard(): Board {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialBoard();
      saveStoredBoard(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load board from storage, resetting', e);
    const initial = getInitialBoard();
    saveStoredBoard(initial);
    return initial;
  }
}

export function saveStoredBoard(board: Board): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch (e) {
    console.error('Failed to save board to storage', e);
  }
}

export function resetStoredBoard(): Board {
  const initial = getInitialBoard();
  saveStoredBoard(initial);
  return initial;
}
