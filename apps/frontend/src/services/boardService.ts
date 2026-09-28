import type { Board, Card, Comment, User } from '../types';
import { loadStoredBoard, saveStoredBoard } from './mockStorage';
import { realtimeChannel } from './realtimeChannel';

export interface BoardService {
  fetchBoard(): Promise<Board>;
  createCard(sectionId: string, title: string, user: User): Promise<Card>;
  moveCard(
    cardId: string,
    sourceSectionId: string,
    targetSectionId: string,
    newOrder: number,
    user: User
  ): Promise<void>;
  updateCard(cardId: string, updates: Partial<Card>, user: User): Promise<Card>;
  deleteCard(cardId: string, sectionId: string, user: User): Promise<void>;
  addComment(cardId: string, content: string, author: User): Promise<Comment>;
}

class MockBoardServiceImpl implements BoardService {
  async fetchBoard(): Promise<Board> {
    return loadStoredBoard();
  }

  async createCard(sectionId: string, title: string, user: User): Promise<Card> {
    const board = loadStoredBoard();
    const newCard: Card = {
      id: 'card_' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      description: '',
      sectionId,
      order: Date.now(),
      assignees: [user],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: 'medium',
    };

    board.cards.push(newCard);
    saveStoredBoard(board);

    realtimeChannel.publish({
      type: 'CARD_CREATED',
      payload: {
        card: newCard,
        createdBy: user,
        timestamp: Date.now(),
      },
    });

    return newCard;
  }

  async moveCard(
    cardId: string,
    sourceSectionId: string,
    targetSectionId: string,
    newOrder: number,
    user: User
  ): Promise<void> {
    const board = loadStoredBoard();
    const card = board.cards.find((c) => c.id === cardId);
    if (!card) return;

    card.sectionId = targetSectionId;
    card.order = newOrder;
    card.updatedAt = new Date().toISOString();

    saveStoredBoard(board);

    realtimeChannel.publish({
      type: 'CARD_MOVED',
      payload: {
        cardId,
        sourceSectionId,
        targetSectionId,
        newOrder,
        movedBy: user,
        timestamp: Date.now(),
      },
    });
  }

  async updateCard(cardId: string, updates: Partial<Card>, user: User): Promise<Card> {
    const board = loadStoredBoard();
    const card = board.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');

    Object.assign(card, updates, { updatedAt: new Date().toISOString() });
    saveStoredBoard(board);

    realtimeChannel.publish({
      type: 'CARD_UPDATED',
      payload: {
        cardId,
        updates,
        updatedBy: user,
        timestamp: Date.now(),
      },
    });

    return card;
  }

  async deleteCard(cardId: string, sectionId: string, user: User): Promise<void> {
    const board = loadStoredBoard();
    board.cards = board.cards.filter((c) => c.id !== cardId);
    saveStoredBoard(board);

    realtimeChannel.publish({
      type: 'CARD_DELETED',
      payload: {
        cardId,
        sectionId,
        deletedBy: user,
        timestamp: Date.now(),
      },
    });
  }

  async addComment(cardId: string, content: string, author: User): Promise<Comment> {
    const board = loadStoredBoard();
    const card = board.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');

    const newComment: Comment = {
      id: 'comm_' + Math.random().toString(36).substring(2, 9),
      content,
      author,
      cardId,
      createdAt: new Date().toISOString(),
    };

    card.comments.push(newComment);
    card.updatedAt = new Date().toISOString();
    saveStoredBoard(board);

    realtimeChannel.publish({
      type: 'COMMENT_ADDED',
      payload: {
        cardId,
        comment: newComment,
        timestamp: Date.now(),
      },
    });

    return newComment;
  }
}

// Export singleton adapter. When backend APIs are ready, swap this export with HttpBoardService!
export const boardService: BoardService = new MockBoardServiceImpl();
