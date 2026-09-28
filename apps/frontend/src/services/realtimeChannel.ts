import type { RealtimeEvent, User } from '../types';

const CHANNEL_NAME = 'vecta_realtime_sync';

export class RealtimeChannelService {
  private channel: BroadcastChannel | null = null;
  private subscribers: Set<(event: RealtimeEvent) => void> = new Set();
  public tabId: string;
  private heartbeatTimer: number | null = null;
  private currentUser: User | null = null;
  private currentActiveCardId: string | null = null;

  constructor() {
    this.tabId = this.getOrCreateTabId();
    this.initChannel();
    this.setupUnload();
  }

  private getOrCreateTabId(): string {
    let id = sessionStorage.getItem('vecta_tab_id');
    if (!id) {
      id = 'tab_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('vecta_tab_id', id);
    }
    return id;
  }

  private initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (messageEvent: MessageEvent<RealtimeEvent>) => {
        const event = messageEvent.data;
        this.notifySubscribers(event);
      };
    } else {
      console.warn('BroadcastChannel not supported in this environment, falling back to local only.');
    }
  }

  private notifySubscribers(event: RealtimeEvent) {
    this.subscribers.forEach((callback) => {
      try {
        callback(event);
      } catch (err) {
        console.error('Error in realtime subscriber', err);
      }
    });
  }

  public subscribe(callback: (event: RealtimeEvent) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public publish(event: RealtimeEvent) {
    if (this.channel) {
      this.channel.postMessage(event);
    }
  }

  public startHeartbeat(user: User, getActiveCardId?: () => string | null) {
    this.currentUser = user;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    const sendHeartbeat = () => {
      if (!this.currentUser) return;
      const activeCardId = getActiveCardId ? getActiveCardId() : this.currentActiveCardId;
      this.publish({
        type: 'PRESENCE_HEARTBEAT',
        payload: {
          user: this.currentUser,
          activeCardId,
          tabId: this.tabId,
          timestamp: Date.now(),
        },
      });
    };

    // send immediate
    sendHeartbeat();
    this.heartbeatTimer = window.setInterval(sendHeartbeat, 2500);
  }

  public stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.currentUser) {
      this.publish({
        type: 'PRESENCE_LEAVE',
        payload: {
          userId: this.currentUser.id,
          tabId: this.tabId,
        },
      });
    }
  }

  public setActiveCard(cardId: string | null) {
    this.currentActiveCardId = cardId;
    if (this.currentUser) {
      this.publish({
        type: 'PRESENCE_HEARTBEAT',
        payload: {
          user: this.currentUser,
          activeCardId: cardId,
          tabId: this.tabId,
          timestamp: Date.now(),
        },
      });
    }
  }

  private setupUnload() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stopHeartbeat();
      });
    }
  }
}

export const realtimeChannel = new RealtimeChannelService();
