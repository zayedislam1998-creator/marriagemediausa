'use server';

import { getCurrentSession } from '@/lib/auth/session';
import { ProposalService, ProposalStatus, validateProposalMessage } from './proposals';
import { CreditWalletService } from './credits';
import { ChatLoungeService } from './chat';
import { VisitorRadarService } from './radar';
import { DomainRepository } from '@/db/repository';

export async function sendProposalAction(prevState: any, formData: FormData) {
  const session = await getCurrentSession();
  if (!session) {
    return { success: false, error: 'Please sign in to send a marriage proposal.' };
  }

  const targetProfileId = formData.get('targetProfileId') as string;
  const initialMessage = (formData.get('initialMessage') as string) || '';

  if (!targetProfileId) {
    return { success: false, error: 'Target suitor profile ID is missing.' };
  }

  const targetProfile = DomainRepository.getProfileById(targetProfileId);
  if (!targetProfile) {
    return { success: false, error: 'Suitor profile not found in domain records.' };
  }

  const sender = {
    id: session.userId,
    name: session.fullName,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    profession: 'Verified Matrimonial Member',
    location: 'United States',
    gender: targetProfile.gender === 'FEMALE' ? 'MALE' : ('FEMALE' as 'MALE' | 'FEMALE'),
    age: 27,
  };

  const res = ProposalService.sendProposal(sender, targetProfile, initialMessage);
  return res;
}

export async function updateProposalStatusAction(
  proposalId: string,
  status: ProposalStatus,
  reason?: string
) {
  const session = await getCurrentSession();
  if (!session) {
    return { success: false, error: 'Authentication required.' };
  }

  return ProposalService.updateStatus(proposalId, status, reason);
}

export async function unlockContactAction(targetProfileId: string) {
  const session = await getCurrentSession();
  if (!session) {
    return { success: false, error: 'Please sign in to unlock contact details.' };
  }

  const targetProfile = DomainRepository.getProfileById(targetProfileId);
  if (!targetProfile) {
    return { success: false, error: 'Suitor profile not found in directory.' };
  }

  return CreditWalletService.unlockContact(session.userId, session.tier || 'FREE', targetProfile);
}

export async function sendMessageAction(
  conversationId: string,
  content: string,
  ccWali: boolean = true
) {
  const session = await getCurrentSession();
  if (!session) {
    return { success: false, error: 'Authentication required to send messages.' };
  }

  return ChatLoungeService.sendMessage(
    conversationId,
    session.userId,
    session.fullName,
    content,
    ccWali
  );
}

export async function logProfileViewAction(targetProfileId: string) {
  const session = await getCurrentSession();
  if (!session) return { success: false };

  VisitorRadarService.logProfileView(
    {
      id: session.userId,
      name: session.fullName,
      age: 27,
      profession: 'Member',
      location: 'United States',
      residency: 'US Citizen',
    },
    targetProfileId
  );

  return { success: true };
}
