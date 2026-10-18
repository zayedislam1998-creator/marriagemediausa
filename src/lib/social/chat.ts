export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'SUITOR' | 'WALI';
  content: string;
  ccWali: boolean;
  createdAt: string;
  isRead: boolean;
}

export interface ConversationThread {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerPhoto?: string;
  partnerProfession: string;
  partnerLocation: string;
  waliName: string;
  lastMessageSnippet: string;
  lastMessageTime: string;
  unreadCount: number;
  isWaliCcActive: boolean;
}

export const SUNNAH_CANNED_OPENERS = [
  'As-salamu alaykum. My family and I reviewed your biodata and are pleased to connect.',
  'As-salamu alaykum. Could we arrange a short telephone call with your Wali this weekend?',
  'As-salamu alaykum. May I inquire about your vision for Islamic family life and career goals?',
  'As-salamu alaykum. My parents would be honored to speak with your family at your convenience.',
];

// In-Memory conversations and messages store
let conversationsStore: ConversationThread[] = [
  {
    id: 'conv-2026-001',
    partnerId: '2026044927',
    partnerName: 'Engr. Tariq Mahmood',
    partnerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    partnerProfession: 'Senior Cloud Solutions Architect',
    partnerLocation: 'Dallas, TX',
    waliName: 'Haji Mahmood Akhtar (Father)',
    lastMessageSnippet: 'In sha Allah, my father will call Dr. Faruq tomorrow evening after Maghrib.',
    lastMessageTime: '15m ago',
    unreadCount: 0,
    isWaliCcActive: true,
  },
  {
    id: 'conv-2026-002',
    partnerId: '2026044929',
    partnerName: 'Dr. Zayan Al-Rashid',
    partnerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    partnerProfession: 'Cardiology Fellow',
    partnerLocation: 'Houston, TX',
    waliName: 'Sheikh Dr. Al-Rashid (Father)',
    lastMessageSnippet: 'As-salamu alaykum. We would love to arrange a family video introduction.',
    lastMessageTime: '2h ago',
    unreadCount: 1,
    isWaliCcActive: true,
  },
];

let messagesStore: Record<string, ChatMessage[]> = {
  'conv-2026-001': [
    {
      id: 'msg-01',
      conversationId: 'conv-2026-001',
      senderId: '2026044927',
      senderName: 'Engr. Tariq Mahmood',
      senderRole: 'SUITOR',
      content:
        'As-salamu alaykum sister Ayesha. I pray you and your family are in the best of health and iman.',
      ccWali: true,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      isRead: true,
    },
    {
      id: 'msg-02',
      conversationId: 'conv-2026-001',
      senderId: 'user-member-001',
      senderName: 'Dr. Ayesha Siddiqa',
      senderRole: 'SUITOR',
      content:
        'Wa alaykum as-salam brother Tariq. Alhamdulillah, all is well. My father Dr. Faruq reviewed your profile and appreciated your cloud engineering work and prayer commitment.',
      ccWali: true,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      isRead: true,
    },
    {
      id: 'msg-03',
      conversationId: 'conv-2026-001',
      senderId: '2026044927',
      senderName: 'Engr. Tariq Mahmood',
      senderRole: 'SUITOR',
      content:
        'Alhamdulillah! In sha Allah, my father will call Dr. Faruq tomorrow evening after Maghrib to introduce our families.',
      ccWali: true,
      createdAt: new Date(Date.now() - 60000 * 15).toISOString(),
      isRead: true,
    },
  ],
};

export class ChatLoungeService {
  static getConversations(): ConversationThread[] {
    return conversationsStore;
  }

  static getMessages(conversationId: string): ChatMessage[] {
    return messagesStore[conversationId] || [];
  }

  static filterMessageModesty(content: string): { allowed: boolean; violation?: string } {
    if (!content || !content.trim()) {
      return { allowed: false, violation: 'Message cannot be empty.' };
    }

    // Block vulgar or dating words
    const banned = [/dating/i, /hookup/i, /send pics/i, /nude/i, /sexy/i, /hotel/i, /venmo/i, /cashapp/i, /wire money/i];
    for (const re of banned) {
      if (re.test(content)) {
        return {
          allowed: false,
          violation:
            'Message flagged by Islamic Modesty & Anti-Fraud filter. Inappropriate language or financial requests are prohibited.',
        };
      }
    }

    return { allowed: true };
  }

  static sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    ccWali: boolean = true
  ): { success: boolean; message?: ChatMessage; error?: string } {
    const check = this.filterMessageModesty(content);
    if (!check.allowed) {
      return { success: false, error: check.violation };
    }

    if (!messagesStore[conversationId]) {
      messagesStore[conversationId] = [];
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      senderRole: 'SUITOR',
      content: content.trim(),
      ccWali,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    messagesStore[conversationId].push(newMsg);

    // Update conversation snippet
    const conv = conversationsStore.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessageSnippet = newMsg.content;
      conv.lastMessageTime = 'Just now';
      conv.isWaliCcActive = ccWali;
    }

    if (ccWali) {
      console.log(`📡 REAL-TIME WALI ALERT: Guardian CC transcript dispatched for conversation ${conversationId}.`);
    }

    return { success: true, message: newMsg };
  }
}
