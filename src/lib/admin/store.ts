import { DomainRepository, Package } from '@/db/repository';

export interface SeatMember {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'EDITOR' | 'MODERATOR';
  scope: string;
  status: 'Active' | 'Suspended';
  assignedDate: string;
}

export interface KycSubmission {
  id: string;
  candidateName: string;
  profileId: string;
  docType: string;
  docUrl: string;
  submittedDate: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  notes?: string;
  verifiedAt?: string;
}

export interface FraudTicket {
  id: string;
  reportedProfileId: string;
  reportedName: string;
  reporterEmail: string;
  reason: string;
  status: 'OPEN' | 'WARNED' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
}

export interface CmsStory {
  id: string;
  title: string;
  couple: string;
  date: string;
  location: string;
  excerpt: string;
  photoUrl: string;
  status: 'PUBLISHED' | 'DRAFT';
}

export interface CmsArticle {
  id: string;
  title: string;
  category: string;
  reads: number;
  publishedDate: string;
  author: string;
  status: 'PUBLISHED' | 'DRAFT';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  ipAddress: string;
  details: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

// In-Memory Global Admin Store (Server state)
class AdminStoreService {
  private seats: SeatMember[] = [
    {
      id: 'SEAT-001',
      name: 'Chief Super Admin',
      email: 'admin@muslimbibah.com',
      role: 'SUPER_ADMIN',
      scope: 'Global Executive & Financial Engine (/admin/*)',
      status: 'Active',
      assignedDate: '2026-01-01',
    },
    {
      id: 'SEAT-002',
      name: 'Content Manager',
      email: 'editor@muslimbibah.com',
      role: 'EDITOR',
      scope: 'CMS Studio, Success Stories & FAQ Guides (/admin/cms/*)',
      status: 'Active',
      assignedDate: '2026-01-15',
    },
    {
      id: 'SEAT-003',
      name: 'Trust & Safety Lead',
      email: 'moderator@muslimbibah.com',
      role: 'MODERATOR',
      scope: 'KYC Vault, Photo Modesty & Fraud Queue (/admin/kyc/*)',
      status: 'Active',
      assignedDate: '2026-02-01',
    },
  ];

  private kycQueue: KycSubmission[] = [
    {
      id: 'KYC-2026-091',
      candidateName: 'Dr. Ayesha Siddiqa',
      profileId: '2026044925',
      docType: 'US Medical License & Passport',
      docUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      submittedDate: '2026-10-10',
      status: 'VERIFIED',
      verifiedAt: '2026-10-10 14:22',
      notes: 'State Medical Board License in TX active. US Passport photo verified.',
    },
    {
      id: 'KYC-2026-088',
      candidateName: 'Shahidur Rahman',
      profileId: '2018054077',
      docType: 'US Passport & Degree Certificate',
      docUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      submittedDate: '2026-10-09',
      status: 'VERIFIED',
      verifiedAt: '2026-10-09 11:05',
      notes: 'NYU Computer Science Masters verified with National Student Clearinghouse.',
    },
    {
      id: 'KYC-2026-094',
      candidateName: 'Rajia Sultana',
      profileId: '2018041017',
      docType: 'Columbia Univ Master Degree & State ID',
      docUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      submittedDate: '2026-10-11',
      status: 'PENDING_REVIEW',
      notes: 'Columbia University School of Social Work degree awaiting registrar confirmation.',
    },
    {
      id: 'KYC-2026-097',
      candidateName: 'Farhan Kabir',
      profileId: '2025091122',
      docType: 'California Driver License & Employment EAD',
      docUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      submittedDate: '2026-10-11',
      status: 'PENDING_REVIEW',
      notes: 'San Jose Silicon Valley software engineer work authorization review.',
    },
  ];

  private fraudTickets: FraudTicket[] = [
    {
      id: 'FRD-102',
      reportedProfileId: '2026044925',
      reportedName: 'Dr. Ayesha Siddiqa',
      reporterEmail: 'inquiry@muslimbibah.com',
      reason: 'Routine verification: requested phone validation for Texas clinic.',
      status: 'WARNED',
      createdAt: '2026-10-08',
    },
    {
      id: 'FRD-105',
      reportedProfileId: '2018054077',
      reportedName: 'Shahidur Rahman',
      reporterEmail: 'wali.review@family.org',
      reason: 'Inquiry regarding dual residency claim in Queens vs Dallas.',
      status: 'OPEN',
      createdAt: '2026-10-11',
    },
  ];

  private stories: CmsStory[] = [
    {
      id: 'STRY-01',
      title: 'Blessed Nikah in Dallas, Texas',
      couple: 'Dr. Tariq & Fatima',
      date: 'August 2025',
      location: 'Dallas, TX',
      excerpt: 'Both sets of parents met via MuslimBibah after Wali verification. Alhamdulillah, solemnized within 6 months.',
      photoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
    },
    {
      id: 'STRY-02',
      title: 'Finding Sunnah Peace in Chicago',
      couple: 'Zayan & Maryam',
      date: 'November 2025',
      location: 'Chicago, IL',
      excerpt: 'Connected under Gold Membership. The Purdah blur photo shield provided full comfort before formal family engagement.',
      photoUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
    },
    {
      id: 'STRY-03',
      title: 'Silicon Valley & New York Doctor Match',
      couple: 'Farhan & Dr. Sarah',
      date: 'January 2026',
      location: 'New York, NY',
      excerpt: 'Direct Wali-to-Wali communication ensured complete transparency and barakah across state lines.',
      photoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
    },
  ];

  private articles: CmsArticle[] = [
    {
      id: 'ART-01',
      title: 'The Sunnah of Choosing a Spouse in Islam',
      category: 'Sunnah Ethics',
      reads: 1420,
      publishedDate: '2026-09-15',
      author: 'Shaykh Matrimonial Advisor',
      status: 'PUBLISHED',
    },
    {
      id: 'ART-02',
      title: 'Rights and Responsibilities of the Wali (Father/Guardian)',
      category: 'Islamic Fiqh',
      reads: 980,
      publishedDate: '2026-09-28',
      author: 'Council of North American Imams',
      status: 'PUBLISHED',
    },
    {
      id: 'ART-03',
      title: 'Navigating US Immigration, Visas & EAD in Matrimony',
      category: 'Diaspora Guide',
      reads: 2150,
      publishedDate: '2026-10-05',
      author: 'Immigration Legal Desk',
      status: 'PUBLISHED',
    },
  ];

  private auditLogs: AuditLog[] = [
    {
      id: 'LOG-901',
      timestamp: '2026-10-11 10:14:22',
      action: 'KYC Document Verified',
      performedBy: 'moderator@muslimbibah.com',
      ipAddress: '74.125.21.18',
      details: 'Approved Texas Medical License for Dr. Ayesha Siddiqa (Badge issued)',
      severity: 'SUCCESS',
    },
    {
      id: 'LOG-900',
      timestamp: '2026-10-11 09:40:11',
      action: 'Contact Credit Unlocked',
      performedBy: 'member_demo_01',
      ipAddress: '68.195.42.112',
      details: 'Deducted 1 credit for Shahidur Rahman contact coordinates',
      severity: 'INFO',
    },
    {
      id: 'LOG-899',
      timestamp: '2026-10-10 22:15:00',
      action: 'Super Admin Seat Inspection',
      performedBy: 'admin@muslimbibah.com',
      ipAddress: '108.45.192.5',
      details: 'Logged into Super Admin Revenue Command Center',
      severity: 'INFO',
    },
    {
      id: 'LOG-898',
      timestamp: '2026-10-10 18:03:45',
      action: 'Purdah Blur Enforced',
      performedBy: 'moderator@muslimbibah.com',
      ipAddress: '74.125.21.18',
      details: 'Enforced 24px Purdah Gaussian modesty shield on newly uploaded avatar',
      severity: 'WARNING',
    },
  ];

  // Seats API
  getSeats(): SeatMember[] {
    return [...this.seats];
  }

  inviteSeat(name: string, email: string, role: 'SUPER_ADMIN' | 'EDITOR' | 'MODERATOR'): SeatMember {
    const scopeMap = {
      SUPER_ADMIN: 'Global Executive & Financial Engine (/admin/*)',
      EDITOR: 'CMS Studio, Success Stories & FAQ Guides (/admin/cms/*)',
      MODERATOR: 'KYC Vault, Photo Modesty & Fraud Queue (/admin/kyc/*)',
    };
    const newSeat: SeatMember = {
      id: `SEAT-00${this.seats.length + 1}`,
      name,
      email,
      role,
      scope: scopeMap[role],
      status: 'Active',
      assignedDate: new Date().toISOString().split('T')[0],
    };
    this.seats.push(newSeat);
    this.addAuditLog('Seat Invitation Created', 'admin@muslimbibah.com', `Created ${role} seat for ${email}`);
    return newSeat;
  }

  toggleSeatStatus(seatId: string): SeatMember | null {
    const seat = this.seats.find((s) => s.id === seatId);
    if (!seat) return null;
    seat.status = seat.status === 'Active' ? 'Suspended' : 'Active';
    this.addAuditLog('Seat Status Updated', 'admin@muslimbibah.com', `${seat.email} set to ${seat.status}`);
    return seat;
  }

  // KYC API
  getKycQueue(): KycSubmission[] {
    return [...this.kycQueue];
  }

  updateKycStatus(submissionId: string, status: 'VERIFIED' | 'REJECTED', notes?: string): KycSubmission | null {
    const sub = this.kycQueue.find((k) => k.id === submissionId);
    if (!sub) return null;
    sub.status = status;
    if (notes) sub.notes = notes;
    if (status === 'VERIFIED') sub.verifiedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.addAuditLog(
      status === 'VERIFIED' ? 'KYC Document Approved' : 'KYC Document Rejected',
      'moderator@muslimbibah.com',
      `${sub.candidateName} (${sub.id}) marked as ${status}`
    );
    return sub;
  }

  // Fraud API
  getFraudTickets(): FraudTicket[] {
    return [...this.fraudTickets];
  }

  updateFraudStatus(ticketId: string, status: 'OPEN' | 'WARNED' | 'SUSPENDED' | 'BANNED'): FraudTicket | null {
    const ticket = this.fraudTickets.find((t) => t.id === ticketId);
    if (!ticket) return null;
    ticket.status = status;
    this.addAuditLog('Fraud Ticket Action', 'moderator@muslimbibah.com', `${ticket.id} (${ticket.reportedName}) status changed to ${status}`);
    return ticket;
  }

  // CMS Stories & Articles API
  getStories(): CmsStory[] {
    return [...this.stories];
  }

  addStory(story: Omit<CmsStory, 'id'>): CmsStory {
    const newStory: CmsStory = {
      ...story,
      id: `STRY-0${this.stories.length + 1}`,
    };
    this.stories.unshift(newStory);
    this.addAuditLog('CMS Story Published', 'editor@muslimbibah.com', `Published story: "${newStory.title}"`);
    return newStory;
  }

  getArticles(): CmsArticle[] {
    return [...this.articles];
  }

  addArticle(article: Omit<CmsArticle, 'id' | 'reads'>): CmsArticle {
    const newArticle: CmsArticle = {
      ...article,
      id: `ART-0${this.articles.length + 1}`,
      reads: 1,
    };
    this.articles.unshift(newArticle);
    this.addAuditLog('CMS Article Published', 'editor@muslimbibah.com', `Published guide: "${newArticle.title}"`);
    return newArticle;
  }

  // Audit Logs API
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  addAuditLog(action: string, performedBy: string, details: string, severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL' = 'INFO') {
    const log: AuditLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      performedBy,
      ipAddress: '192.168.0.61',
      details,
      severity,
    };
    this.auditLogs.unshift(log);
  }
}

// Global Singleton
const globalForAdmin = global as unknown as { adminStore?: AdminStoreService };
export const AdminStore = globalForAdmin.adminStore || new AdminStoreService();
if (process.env.NODE_ENV !== 'production') globalForAdmin.adminStore = AdminStore;
