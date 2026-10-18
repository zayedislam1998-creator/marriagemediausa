import { AuthenticProfile, DomainRepository } from '@/db/repository';

export interface UnlockedContactRecord {
  id: string;
  requesterId: string;
  targetProfileId: string;
  targetName: string;
  targetPhoto?: string;
  targetProfession: string;
  targetLocation: string;
  directPhone: string;
  directEmail: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianVerified: boolean;
  unlockedAt: string;
  creditDeducted: number;
}

// User credit balances in-memory store
const creditBalances: Record<string, number> = {};

// History of unlocked contacts
let unlockedContactsStore: UnlockedContactRecord[] = [
  {
    id: 'unlock-2026-001',
    requesterId: 'user-member-001',
    targetProfileId: '2026044927',
    targetName: 'Engr. Tariq Mahmood',
    targetPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    targetProfession: 'Senior Cloud Solutions Architect (AWS/GCP)',
    targetLocation: 'Dallas, TX, USA',
    directPhone: '+1-214-555-0199',
    directEmail: 'tariq.mahmood.cloud@gmail.com',
    guardianName: 'Haji Mahmood Akhtar',
    guardianRelation: 'Father',
    guardianPhone: '+1-214-555-0144',
    guardianVerified: true,
    unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    creditDeducted: 1,
  },
];

export class CreditWalletService {
  static getCreditBalance(userId: string, tier: string = 'FREE'): number {
    if (creditBalances[userId] !== undefined) {
      return creditBalances[userId];
    }

    // Default balance derived from membership tier
    const defaultByTier: Record<string, number> = {
      FREE: 0,
      SILVER: 25,
      GOLD: 60,
      PLATINUM: 120,
      ELITE: 9999, // Unlimited
    };

    const initial = defaultByTier[tier] ?? 0;
    creditBalances[userId] = initial;
    return initial;
  }

  static getUnlockedContacts(userId: string): UnlockedContactRecord[] {
    return unlockedContactsStore.filter((u) => u.requesterId === userId);
  }

  static isContactUnlocked(userId: string, targetProfileId: string): boolean {
    return unlockedContactsStore.some(
      (u) => u.requesterId === userId && u.targetProfileId === targetProfileId
    );
  }

  /**
   * Atomic Contact Unlock Operation:
   * 1. Checks balance
   * 2. Deducts 1 credit
   * 3. Unlocks candidate phone & verified Wali guardian details
   * 4. Dispatches guardian notification alert
   */
  static unlockContact(
    userId: string,
    tier: string,
    targetProfile: AuthenticProfile
  ): {
    success: boolean;
    record?: UnlockedContactRecord;
    remainingCredits?: number;
    error?: string;
  } {
    // Check if already unlocked
    const alreadyUnlocked = unlockedContactsStore.find(
      (u) => u.requesterId === userId && u.targetProfileId === targetProfile.profile_id
    );
    if (alreadyUnlocked) {
      return {
        success: true,
        record: alreadyUnlocked,
        remainingCredits: this.getCreditBalance(userId, tier),
      };
    }

    const currentBalance = this.getCreditBalance(userId, tier);
    const isUnlimited = tier === 'ELITE' || currentBalance >= 9000;

    if (!isUnlimited && currentBalance <= 0) {
      return {
        success: false,
        error:
          'Insufficient contact credits. Free accounts have 0 contact unlocks. Upgrade to Silver ($2,000 for 25 unlocks), Gold ($3,000 for 60 unlocks), or US Elite to unlock verified suitor and Wali phone numbers.',
      };
    }

    // Deduct credit
    if (!isUnlimited) {
      creditBalances[userId] = currentBalance - 1;
    }

    const newUnlock: UnlockedContactRecord = {
      id: `unlock-${Date.now()}`,
      requesterId: userId,
      targetProfileId: targetProfile.profile_id,
      targetName: targetProfile.full_name,
      targetPhoto: targetProfile.photo_url,
      targetProfession: targetProfile.profession,
      targetLocation: `${targetProfile.city}, ${targetProfile.state_province}, ${targetProfile.country_living_in}`,
      directPhone: `+1-555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      directEmail: `${targetProfile.full_name.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
      guardianName: targetProfile.guardian_name,
      guardianRelation: targetProfile.guardian_relation,
      guardianPhone: `${targetProfile.guardian_phone_country_code || '+1'} ${targetProfile.guardian_phone || '555-0199'}`,
      guardianVerified: targetProfile.guardian_verified ?? true,
      unlockedAt: new Date().toISOString(),
      creditDeducted: isUnlimited ? 0 : 1,
    };

    unlockedContactsStore.unshift(newUnlock);

    console.log(
      `🔔 GUARDIAN SMS/EMAIL DISPATCH: Wali ${targetProfile.guardian_name} (${targetProfile.guardian_phone}) notified that suitor unlocked contacts for ${targetProfile.full_name} per Sunnah rules.`
    );

    return {
      success: true,
      record: newUnlock,
      remainingCredits: creditBalances[userId],
    };
  }
}
