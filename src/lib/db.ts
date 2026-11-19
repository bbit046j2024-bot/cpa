import fs from 'fs';
import path from 'path';
import { Supporter, CampaignActivity, CampaignUpdate, CommunicationMessage, SystemSettings, User } from './types';
import seedSupporters from '../data/seed-supporters.json';
import { tidb } from './tidb';

interface DatabaseSchema {
  supporters: Supporter[];
  activities: CampaignActivity[];
  updates: CampaignUpdate[];
  communications: CommunicationMessage[];
  users: User[];
  settings: SystemSettings;
  auditLogs: Array<{
    id: string;
    timestamp: string;
    userId: string;
    action: string;
    details: string;
  }>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

const DEFAULT_SETTINGS: SystemSettings = {
  candidateName: 'Elisha Adera',
  position: 'Super Delegate',
  department: 'Department of Management Science',
  institution: 'Technical University of Mombasa (TUM)',
  campaignPeriod: '2026/2027',
  allianceName: 'CPA – Comrades Project Alliance',
  allianceMotto: 'For Comrades by Comrades',
  slogan: 'Competent Leader',
  availableCourses: [
    'Bachelor of Business and Information Technology',
    'Bachelor of Science in Supply Chain Management',
    'Diploma in Logistics and Transport Management',
    'Diploma in Procurement',
    'Diploma in Supply Chain Management',
    'International Diploma in Logistics and Transport Management',
    'Certificate in Stores Management',
    'Certificate of Logistics and Transport Management',
    'Master of Business Information Systems',
    'Master of Science in Supply Chain Management',
    'Masters of Science in Procurement and Supply Chain Management',
    'Doctor of Philosophy in Supply Chain Management'
  ],
  academicYears: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
  smsProvider: {
    enabled: false,
    providerName: 'africastalking',
    senderId: 'ELISHA2026',
    approvalStatus: 'pending_election_clearance'
  }
};

const DEFAULT_ACTIVITIES: CampaignActivity[] = [
  {
    id: 'act_001',
    title: 'Departmental Comrades Town Hall',
    description: 'Direct interactive engagement with 3rd & 4th year Management Science students regarding student representation and delegate priorities.',
    date: '2026-11-24',
    time: '16:00',
    venue: 'Business Studies Complex Hall A (BSC A)',
    status: 'upcoming',
    category: 'hall_meeting',
    targetAudience: 'All Management Science Comrades',
    createdBy: 'admin'
  },
  {
    id: 'act_002',
    title: 'CPA Campaign Strategy & Mobilization Meeting',
    description: 'Alignment session for course coordinators and volunteer mobilizers across all four academic years.',
    date: '2026-11-21',
    time: '17:30',
    venue: 'Student Center Conference Room 2',
    status: 'upcoming',
    category: 'strategy',
    targetAudience: 'Campaign Coordinators & Mobilizers',
    createdBy: 'admin'
  },
  {
    id: 'act_003',
    title: 'Year 1 & 2 Lecture Hall Briefing Walk-ins',
    description: 'Informative 5-minute introductory sessions in lecture halls during class breaks to explain the delegate election process.',
    date: '2026-11-17',
    time: '10:00',
    venue: 'Lecture Theatres 3 & 4',
    status: 'completed',
    attendanceCount: 140,
    category: 'outreach',
    targetAudience: 'Year 1 & Year 2 Students',
    createdBy: 'admin'
  }
];

const DEFAULT_UPDATES: CampaignUpdate[] = [
  {
    id: 'upd_001',
    title: 'Official Campaign Launch: The Journey Begins',
    content: 'Comrades of Management Science, our journey towards accountable and competent leadership is officially underway. Stand with Elisha Adera for Super Delegate 2026/2027 under CPA - For Comrades by Comrades.',
    date: '2026-11-10',
    category: 'announcement',
    pinned: true
  },
  {
    id: 'upd_002',
    title: 'Supporter Registration Portal is Live',
    content: 'We invite all students within the Department of Management Science to join our verified supporters directory. Registration takes only 30 seconds and requires only 4 essential fields.',
    date: '2026-11-12',
    category: 'message',
    pinned: true
  },
  {
    id: 'upd_003',
    title: 'Town Hall Meeting Scheduled for Nov 24',
    content: 'Join Elisha Adera and the CPA leadership team this coming Tuesday at BSC Hall A from 4:00 PM for an open forum dialogue on student academic welfare.',
    date: '2026-11-18',
    category: 'event',
    pinned: false
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Campaign Administrator',
    username: 'admin',
    role: 'admin',
    createdAt: '2026-11-01T00:00:00.000Z'
  },
  {
    id: 'usr_coordinator',
    name: 'Department Mobilizer',
    username: 'coordinator',
    role: 'coordinator',
    createdAt: '2026-11-05T00:00:00.000Z'
  },
  {
    id: 'usr_dataentry',
    name: 'Data Entry Volunteer',
    username: 'dataentry',
    role: 'data_entry',
    createdAt: '2026-11-08T00:00:00.000Z'
  }
];

function initDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data: DatabaseSchema = JSON.parse(content);
      // Ensure seed data exists if empty
      if (!data.supporters || data.supporters.length === 0) {
        data.supporters = (seedSupporters as unknown) as Supporter[];
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      }
      return data;
    } catch (e) {
      console.error('Error reading DB, re-initializing', e);
    }
  }

  const initialData: DatabaseSchema = {
    supporters: (seedSupporters as unknown) as Supporter[],
    activities: DEFAULT_ACTIVITIES,
    updates: DEFAULT_UPDATES,
    communications: [],
    users: DEFAULT_USERS,
    settings: DEFAULT_SETTINGS,
    auditLogs: [
      {
        id: 'log_001',
        timestamp: new Date().toISOString(),
        userId: 'system',
        action: 'INITIAL_SEED',
        details: 'Seeded 25 registered supporters from official docx loyalty register'
      }
    ]
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

function saveDb(data: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  getSupporters(): Supporter[] {
    const data = initDb();
    return data.supporters;
  },

  getSupporterById(id: string): Supporter | undefined {
    const data = initDb();
    return data.supporters.find(s => s.id === id);
  },

  findSupporterByPhone(phoneNumber: string): Supporter | undefined {
    const data = initDb();
    return data.supporters.find(s => s.phoneNumber === phoneNumber);
  },

  addSupporter(supporter: Omit<Supporter, 'id' | 'registrationDate'>): { supporter?: Supporter; error?: string } {
    const data = initDb();

    // Check duplicate phone
    const existing = data.supporters.find(s => s.phoneNumber === supporter.phoneNumber);
    if (existing) {
      return { error: 'A supporter with this phone number is already registered in the campaign directory.' };
    }

    const newId = `sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: Supporter = {
      ...supporter,
      id: newId,
      registrationDate: new Date().toISOString()
    };

    data.supporters.unshift(newRecord);
    data.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'public_portal',
      action: 'REGISTER_SUPPORTER',
      details: `Registered ${newRecord.fullName} (${newRecord.phoneNumber}) for ${newRecord.course}`
    });

    saveDb(data);
    tidb.addSupporter(newRecord).catch((err) => console.error('[TiDB Sync Error]:', err.message));
    return { supporter: newRecord };
  },

  updateSupporter(id: string, updates: Partial<Supporter>, actorId: string = 'admin'): Supporter | null {
    const data = initDb();
    const index = data.supporters.findIndex(s => s.id === id);
    if (index === -1) return null;

    data.supporters[index] = { ...data.supporters[index], ...updates };
    data.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: actorId,
      action: 'UPDATE_SUPPORTER',
      details: `Updated record ID: ${id}`
    });

    saveDb(data);
    tidb.updateSupporter(id, updates).catch((err) => console.error('[TiDB Sync Error]:', err.message));
    return data.supporters[index];
  },

  deleteSupporter(id: string, actorId: string = 'admin'): boolean {
    const data = initDb();
    const target = data.supporters.find(s => s.id === id);
    if (!target) return false;

    data.supporters = data.supporters.filter(s => s.id !== id);
    data.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: actorId,
      action: 'DELETE_SUPPORTER',
      details: `Deleted ${target.fullName} (${target.phoneNumber})`
    });

    saveDb(data);
    tidb.deleteSupporter(id).catch((err) => console.error('[TiDB Sync Error]:', err.message));
    return true;
  },

  bulkAddSupporters(items: Array<Omit<Supporter, 'id' | 'registrationDate'>>, actorId: string = 'admin'): { addedCount: number; duplicateCount: number; errors: string[] } {
    const data = initDb();
    let addedCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    const existingPhones = new Set(data.supporters.map(s => s.phoneNumber));

    for (const item of items) {
      if (existingPhones.has(item.phoneNumber)) {
        duplicateCount++;
        continue;
      }
      const newId = `sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      data.supporters.push({
        ...item,
        id: newId,
        registrationDate: new Date().toISOString()
      });
      existingPhones.add(item.phoneNumber);
      addedCount++;
    }

    data.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: actorId,
      action: 'BULK_IMPORT',
      details: `Imported ${addedCount} records. Ignored ${duplicateCount} duplicates.`
    });

    saveDb(data);
    return { addedCount, duplicateCount, errors };
  },

  getActivities(): CampaignActivity[] {
    const data = initDb();
    return data.activities;
  },

  addActivity(activity: Omit<CampaignActivity, 'id'>, actorId: string = 'admin'): CampaignActivity {
    const data = initDb();
    const newActivity: CampaignActivity = {
      ...activity,
      id: `act_${Date.now()}`
    };
    data.activities.unshift(newActivity);
    data.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: actorId,
      action: 'ADD_ACTIVITY',
      details: `Created campaign activity: ${newActivity.title}`
    });
    saveDb(data);
    tidb.addActivity(newActivity).catch((err) => console.error('[TiDB Sync Error]:', err.message));
    return newActivity;
  },

  updateActivity(id: string, updates: Partial<CampaignActivity>, actorId: string = 'admin'): CampaignActivity | null {
    const data = initDb();
    const idx = data.activities.findIndex(a => a.id === id);
    if (idx === -1) return null;
    data.activities[idx] = { ...data.activities[idx], ...updates };
    saveDb(data);
    return data.activities[idx];
  },

  deleteActivity(id: string, actorId: string = 'admin'): boolean {
    const data = initDb();
    data.activities = data.activities.filter(a => a.id !== id);
    saveDb(data);
    return true;
  },

  getUpdates(): CampaignUpdate[] {
    const data = initDb();
    return data.updates;
  },

  addUpdate(update: Omit<CampaignUpdate, 'id'>): CampaignUpdate {
    const data = initDb();
    const newUpd: CampaignUpdate = {
      ...update,
      id: `upd_${Date.now()}`
    };
    data.updates.unshift(newUpd);
    saveDb(data);
    return newUpd;
  },

  getCommunications(): CommunicationMessage[] {
    const data = initDb();
    return data.communications;
  },

  addCommunication(comm: Omit<CommunicationMessage, 'id' | 'createdAt'>, actorId: string = 'admin'): CommunicationMessage {
    const data = initDb();
    const newComm: CommunicationMessage = {
      ...comm,
      id: `comm_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    data.communications.unshift(newComm);
    saveDb(data);
    tidb.addCommunication(newComm).catch((err) => console.error('[TiDB Sync Error]:', err.message));
    return newComm;
  },

  getSettings(): SystemSettings {
    const data = initDb();
    return data.settings;
  },

  updateSettings(settings: Partial<SystemSettings>, actorId: string = 'admin'): SystemSettings {
    const data = initDb();
    data.settings = { ...data.settings, ...settings };
    saveDb(data);
    tidb.saveSettings(data.settings).catch((err) => console.error('[TiDB Sync Error]:', err.message));
    return data.settings;
  },

  getAuditLogs() {
    const data = initDb();
    return data.auditLogs;
  },

  getStats() {
    const data = initDb();
    const supporters = data.supporters;

    const total = supporters.length;
    const active = supporters.filter(s => s.status === 'active').length;
    const consented = supporters.filter(s => s.communicationConsent).length;

    // By course
    const courseMap: Record<string, number> = {};
    // By year
    const yearMap: Record<string, number> = {};

    supporters.forEach(s => {
      courseMap[s.course] = (courseMap[s.course] || 0) + 1;
      yearMap[s.yearOfStudy] = (yearMap[s.yearOfStudy] || 0) + 1;
    });

    const byCourse = Object.entries(courseMap).map(([course, count]) => ({ course, count }));
    const byYear = Object.entries(yearMap).map(([year, count]) => ({ year, count }));

    // Recent 10
    const recent = [...supporters].slice(0, 10);

    return {
      total,
      active,
      consented,
      consentRate: total > 0 ? Math.round((consented / total) * 100) : 0,
      byCourse,
      byYear,
      recent
    };
  }
};

