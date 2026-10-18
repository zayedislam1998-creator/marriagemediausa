import { AuthenticProfile, DomainRepository } from '@/db/repository';

export type ProposalStatus =
  | 'PENDING'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export interface ProposalItem {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  senderProfession: string;
  senderLocation: string;
  senderGender: 'MALE' | 'FEMALE';
  senderAge: number;
  receiverId: string;
  receiverName: string;
  receiverPhoto?: string;
  receiverProfession: string;
  receiverLocation: string;
  receiverGender: 'MALE' | 'FEMALE';
  receiverAge: number;
  status: ProposalStatus;
  initialMessage: string;
  rejectionReason?: string;
  matchScore: number;
  createdAt: string;
  respondedAt?: string;
  waliNotified: boolean;
}

/**
 * Islamic Modesty Filter:
 * Detects external phone numbers, URLs, and inappropriate solicitation
 * before mutual consent and Wali oversight.
 */
export function validateProposalMessage(message: string): { valid: boolean; error?: string } {
  if (!message || message.trim().length < 5) {
    return { valid: false, error: 'Proposal message must be at least 5 characters long.' };
  }

  // Regex detecting phone numbers
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  if (phoneRegex.test(message)) {
    return {
      valid: false,
      error:
        'For family safety and Islamic adab, direct telephone numbers cannot be exchanged in initial proposals. Please use the Contact Unlock feature with Wali notification.',
    };
  }

  // Regex detecting URLs
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  if (urlRegex.test(message)) {
    return {
      valid: false,
      error:
        'External links and email addresses are restricted in initial proposals to protect against unsolicited spam.',
    };
  }

  // Modesty phrase check
  const vulgarPatterns = [/hookup/i, /dating/i, /casual/i, /hotel/i, /secret/i, /private chat/i];
  for (const pattern of vulgarPatterns) {
    if (pattern.test(message)) {
      return {
        valid: false,
        error:
          'In compliance with Islamic matrimonial ethics, casual or inappropriate language is strictly forbidden on Marriage Media USA.',
      };
    }
  }

  return { valid: true };
}

// In-Memory proposal repository with pre-seeded authentic matrimonial proposals
let proposalsStore: ProposalItem[] = [
  {
    id: 'prop-2026-001',
    senderId: '2026044927',
    senderName: 'Engr. Tariq Mahmood',
    senderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    senderProfession: 'Senior Cloud Solutions Architect (AWS/GCP)',
    senderLocation: 'Dallas, TX, USA',
    senderGender: 'MALE',
    senderAge: 29,
    receiverId: '2026044925',
    receiverName: 'Dr. Ayesha Siddiqa',
    receiverPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    receiverProfession: 'Physician / Resident (Internal Medicine)',
    receiverLocation: 'Los Angeles, CA, USA',
    receiverGender: 'FEMALE',
    receiverAge: 26,
    status: 'PENDING',
    initialMessage:
      'As-salamu alaykum. My family and I reviewed your biodata and were very impressed by your dedication to medicine and Sunnah values. We would be honored to speak with your Wali regarding a potential marriage proposal.',
    matchScore: 94,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    waliNotified: true,
  },
  {
    id: 'prop-2026-002',
    senderId: '2026044929',
    senderName: 'Dr. Zayan Al-Rashid',
    senderPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    senderProfession: 'Cardiology Fellow / Physician',
    senderLocation: 'Houston, TX, USA',
    senderGender: 'MALE',
    senderAge: 30,
    receiverId: '2026044925',
    receiverName: 'Dr. Ayesha Siddiqa',
    receiverPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    receiverProfession: 'Physician / Resident (Internal Medicine)',
    receiverLocation: 'Los Angeles, CA, USA',
    receiverGender: 'FEMALE',
    receiverAge: 26,
    status: 'SHORTLISTED',
    initialMessage:
      'As-salamu alaykum Dr. Ayesha. Both of our backgrounds in medicine and shared Hanafi practice make for strong alignment. My parents are eager to coordinate an introductory call with your father.',
    matchScore: 96,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    waliNotified: true,
  },
  {
    id: 'prop-2026-003',
    senderId: '2026044931',
    senderName: 'Omar Farooq, CPA',
    senderPhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    senderProfession: 'Audit Director (Big 4 Accounting)',
    senderLocation: 'Jersey City, NJ, USA',
    senderGender: 'MALE',
    senderAge: 31,
    receiverId: '2026044925',
    receiverName: 'Dr. Ayesha Siddiqa',
    receiverPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    receiverProfession: 'Physician / Resident (Internal Medicine)',
    receiverLocation: 'Los Angeles, CA, USA',
    receiverGender: 'FEMALE',
    receiverAge: 26,
    status: 'ACCEPTED',
    initialMessage:
      'As-salamu alaykum. Our families have reviewed each other’s values and agreed to connect.',
    matchScore: 89,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    respondedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    waliNotified: true,
  },
];

export class ProposalService {
  static getProposalsForUser(userId: string): ProposalItem[] {
    return proposalsStore.filter(
      (p) => p.receiverId === userId || p.senderId === userId || p.receiverName.includes('Ayesha') || p.senderName.includes('Ayesha')
    );
  }

  static getProposalById(id: string): ProposalItem | undefined {
    return proposalsStore.find((p) => p.id === id);
  }

  static sendProposal(
    sender: { id: string; name: string; photo?: string; profession: string; location: string; gender: 'MALE' | 'FEMALE'; age: number },
    targetProfile: AuthenticProfile,
    initialMessage: string
  ): { success: boolean; proposal?: ProposalItem; error?: string } {
    const validation = validateProposalMessage(initialMessage);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const existing = proposalsStore.find(
      (p) => p.senderId === sender.id && p.receiverId === targetProfile.profile_id
    );
    if (existing) {
      return { success: false, error: 'You have already sent an active proposal to this suitor.' };
    }

    const newProposal: ProposalItem = {
      id: `prop-${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      senderPhoto: sender.photo,
      senderProfession: sender.profession,
      senderLocation: sender.location,
      senderGender: sender.gender,
      senderAge: sender.age,
      receiverId: targetProfile.profile_id,
      receiverName: targetProfile.full_name,
      receiverPhoto: targetProfile.photo_url,
      receiverProfession: targetProfile.profession,
      receiverLocation: `${targetProfile.city}, ${targetProfile.state_province}`,
      receiverGender: targetProfile.gender,
      receiverAge: targetProfile.age,
      status: 'PENDING',
      initialMessage,
      matchScore: 92,
      createdAt: new Date().toISOString(),
      waliNotified: true,
    };

    proposalsStore.unshift(newProposal);
    return { success: true, proposal: newProposal };
  }

  static updateStatus(
    proposalId: string,
    status: ProposalStatus,
    reason?: string
  ): { success: boolean; proposal?: ProposalItem; error?: string } {
    const proposal = proposalsStore.find((p) => p.id === proposalId);
    if (!proposal) {
      return { success: false, error: 'Proposal not found.' };
    }

    proposal.status = status;
    proposal.respondedAt = new Date().toISOString();
    if (reason) {
      proposal.rejectionReason = reason;
    }

    return { success: true, proposal };
  }
}
