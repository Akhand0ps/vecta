export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'ADMIN' | 'MEMBER';
  color: string;
}

export type SectionTitle = 'Backlog' | 'In Progress' | 'Review' | 'Done';

export interface Section {
  id: string;
  title: SectionTitle;
  order: number;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  cardId: string;
  createdAt: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  sectionId: string;
  order: number; // fractional or sequential index for drag & drop
  dueDate?: string | null;
  assignees: User[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Board {
  id: string;
  title: string;
  orgId: string;
  sections: Section[];
  cards: Card[];
}

export interface Organization {
  id: string;
  name: string;
}

export type RealtimeEvent =
  | {
      type: 'CARD_MOVED';
      payload: {
        cardId: string;
        sourceSectionId: string;
        targetSectionId: string;
        newOrder: number;
        movedBy: User;
        timestamp: number;
      };
    }
  | {
      type: 'CARD_CREATED';
      payload: {
        card: Card;
        createdBy: User;
        timestamp: number;
      };
    }
  | {
      type: 'CARD_UPDATED';
      payload: {
        cardId: string;
        updates: Partial<Card>;
        updatedBy: User;
        timestamp: number;
      };
    }
  | {
      type: 'CARD_DELETED';
      payload: {
        cardId: string;
        sectionId: string;
        deletedBy: User;
        timestamp: number;
      };
    }
  | {
      type: 'COMMENT_ADDED';
      payload: {
        cardId: string;
        comment: Comment;
        timestamp: number;
      };
    }
  | {
      type: 'USER_TYPING';
      payload: {
        cardId: string;
        user: User;
        isTyping: boolean;
        timestamp: number;
      };
    }
  | {
      type: 'PRESENCE_HEARTBEAT';
      payload: {
        user: User;
        activeCardId?: string | null;
        tabId: string;
        timestamp: number;
      };
    }
  | {
      type: 'PRESENCE_LEAVE';
      payload: {
        userId: string;
        tabId: string;
      };
    };

export interface PresenceUser {
  user: User;
  tabId: string;
  lastSeen: number;
  activeCardId?: string | null;
}
