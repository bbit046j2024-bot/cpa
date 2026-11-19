import mysql from 'mysql2/promise';
import { Supporter, ClassRepresentativeRegistration, ClassRepReviewStatus, CampaignActivity, CampaignUpdate, CommunicationMessage, SystemSettings } from './types';

let pool: mysql.Pool | null = null;

export function getTiDbPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.TIDB_HOST || 'gateway01.us-west-2.prod.aws.tidbcloud.com',
      port: parseInt(process.env.TIDB_PORT || '4000', 10),
      user: process.env.TIDB_USER || '4CfgwWN4niqXLXF.root',
      password: process.env.TIDB_PASSWORD || '',
      database: process.env.TIDB_DATABASE || 'campus_dive',
      ssl: {
        rejectUnauthorized: process.env.TIDB_SSL_REJECT_UNAUTHORIZED !== 'false',
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function queryTiDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getTiDbPool();
  const [rows] = await p.query(sql, params);
  return rows as T[];
}

export const tidb = {
  // ─── SUPPORTERS ───────────────────────────────────────────────────────────

  async getSupporters(): Promise<Supporter[]> {
    const rows = await queryTiDb<any>(
      'SELECT * FROM cpa_supporters ORDER BY registrationDate DESC'
    );
    return rows.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      phoneNumber: r.phoneNumber,
      rawPhone: r.rawPhone,
      course: r.course,
      yearOfStudy: r.yearOfStudy,
      communicationConsent: Boolean(r.communicationConsent),
      consentTimestamp: r.consentTimestamp,
      registrationDate: r.registrationDate,
      status: r.status,
      source: r.source,
    }));
  },

  async getSupporterById(id: string): Promise<Supporter | null> {
    const rows = await queryTiDb<any>(
      'SELECT * FROM cpa_supporters WHERE id = ? LIMIT 1', [id]
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      fullName: r.fullName,
      phoneNumber: r.phoneNumber,
      rawPhone: r.rawPhone,
      course: r.course,
      yearOfStudy: r.yearOfStudy,
      communicationConsent: Boolean(r.communicationConsent),
      consentTimestamp: r.consentTimestamp,
      registrationDate: r.registrationDate,
      status: r.status,
      source: r.source,
    };
  },

  async addSupporter(supporter: Supporter): Promise<void> {
    await queryTiDb(
      `INSERT INTO cpa_supporters
       (id, fullName, phoneNumber, rawPhone, course, yearOfStudy, communicationConsent, consentTimestamp, registrationDate, status, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       fullName = VALUES(fullName),
       course = VALUES(course),
       yearOfStudy = VALUES(yearOfStudy),
       communicationConsent = VALUES(communicationConsent),
       status = VALUES(status)`,
      [
        supporter.id,
        supporter.fullName,
        supporter.phoneNumber,
        supporter.rawPhone || '',
        supporter.course,
        supporter.yearOfStudy,
        supporter.communicationConsent ? 1 : 0,
        supporter.consentTimestamp || '',
        supporter.registrationDate,
        supporter.status || 'active',
        supporter.source || '',
      ]
    );
  },

  async bulkAddSupporters(items: Supporter[]): Promise<{ addedCount: number; duplicateCount: number }> {
    let addedCount = 0;
    let duplicateCount = 0;
    const existing = await queryTiDb<{ phoneNumber: string }>('SELECT phoneNumber FROM cpa_supporters');
    const existingPhones = new Set(existing.map(r => r.phoneNumber));

    for (const item of items) {
      if (existingPhones.has(item.phoneNumber)) {
        duplicateCount++;
        continue;
      }
      await this.addSupporter(item).catch(() => { duplicateCount++; });
      existingPhones.add(item.phoneNumber);
      addedCount++;
    }
    return { addedCount, duplicateCount };
  },

  async updateSupporter(id: string, updates: Partial<Supporter>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.fullName !== undefined) { fields.push('fullName = ?'); values.push(updates.fullName); }
    if (updates.phoneNumber !== undefined) { fields.push('phoneNumber = ?'); values.push(updates.phoneNumber); }
    if (updates.rawPhone !== undefined) { fields.push('rawPhone = ?'); values.push(updates.rawPhone); }
    if (updates.course !== undefined) { fields.push('course = ?'); values.push(updates.course); }
    if (updates.yearOfStudy !== undefined) { fields.push('yearOfStudy = ?'); values.push(updates.yearOfStudy); }
    if (updates.communicationConsent !== undefined) { fields.push('communicationConsent = ?'); values.push(updates.communicationConsent ? 1 : 0); }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }

    if (fields.length > 0) {
      values.push(id);
      await queryTiDb(`UPDATE cpa_supporters SET ${fields.join(', ')} WHERE id = ?`, values);
    }
  },

  async deleteSupporter(id: string): Promise<void> {
    await queryTiDb('DELETE FROM cpa_supporters WHERE id = ?', [id]);
  },

  async getStats(): Promise<{
    total: number;
    active: number;
    consented: number;
    consentRate: number;
    foundationCount: number;
    byCourse: { course: string; count: number }[];
    byYear: { year: string; count: number; pct: number }[];
    recent: Supporter[];
  }> {
    const supporters = await this.getSupporters();
    const total = supporters.length;
    const active = supporters.filter(s => s.status === 'active').length;
    const consented = supporters.filter(s => s.communicationConsent).length;
    const foundationCount = supporters.filter(s => s.source === 'Initial Loyalty Register').length;

    const courseMap: Record<string, number> = {};
    const yearMap: Record<string, number> = {
      'Year 1': 0,
      'Year 2': 0,
      'Year 3': 0,
      'Year 4': 0,
    };

    supporters.forEach(s => {
      courseMap[s.course] = (courseMap[s.course] || 0) + 1;
      const yr = (s.yearOfStudy || '').trim();
      if (yearMap[yr] !== undefined) {
        yearMap[yr] += 1;
      } else if (yr) {
        yearMap[yr] = (yearMap[yr] || 0) + 1;
      }
    });

    const byYear = ['Year 1', 'Year 2', 'Year 3', 'Year 4'].map(year => ({
      year,
      count: yearMap[year] || 0,
      pct: total > 0 ? Math.round(((yearMap[year] || 0) / total) * 100) : 0,
    }));

    const byCourse = Object.entries(courseMap)
      .map(([course, count]) => ({ course, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      active,
      consented,
      consentRate: total > 0 ? Math.round((consented / total) * 100) : 0,
      foundationCount: foundationCount || 25,
      byCourse,
      byYear,
      recent: supporters.slice(0, 10),
    };
  },

  // ─── CLASS REPRESENTATIVE REGISTRATIONS (separate from supporters) ────────

  async addClassRepresentative(registration: Omit<ClassRepresentativeRegistration, 'reviewStatus' | 'reviewedAt'>): Promise<void> {
    await queryTiDb(
      `INSERT INTO cpa_class_representatives
       (id, fullName, contact, contactType, course, yearOfStudy, classRepConfirmed, privacyConsent, consentAt, reviewStatus, registeredAt, reviewedAt, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NULL, ?)`,
      [registration.id, registration.fullName, registration.contact, registration.contactType,
       registration.course, registration.yearOfStudy, registration.classRepConfirmed ? 1 : 0, registration.privacyConsent ? 1 : 0, registration.consentAt, registration.registeredAt, registration.source]
    );
  },

  async getClassRepresentatives(status = ''): Promise<ClassRepresentativeRegistration[]> {
    const validStatus = ['pending', 'verified', 'rejected'].includes(status);
    const rows = validStatus
      ? await queryTiDb<any>(
          'SELECT id, fullName, contact, contactType, course, yearOfStudy, classRepConfirmed, privacyConsent, consentAt, reviewStatus, registeredAt, reviewedAt, source FROM cpa_class_representatives WHERE reviewStatus = ? ORDER BY registeredAt DESC',
          [status]
        )
      : await queryTiDb<any>(
          'SELECT id, fullName, contact, contactType, course, yearOfStudy, classRepConfirmed, privacyConsent, consentAt, reviewStatus, registeredAt, reviewedAt, source FROM cpa_class_representatives ORDER BY registeredAt DESC'
        );
    return rows as ClassRepresentativeRegistration[];
  },

  async reviewClassRepresentative(id: string, status: ClassRepReviewStatus): Promise<boolean> {
    const reviewedAt = status === 'pending' ? null : new Date().toISOString();
    const [result] = await getTiDbPool().query(
      'UPDATE cpa_class_representatives SET reviewStatus = ?, reviewedAt = ? WHERE id = ?',
      [status, reviewedAt, id]
    );
    return (result as mysql.ResultSetHeader).affectedRows > 0;
  },
  // ─── ACTIVITIES ───────────────────────────────────────────────────────────

  async getActivities(): Promise<CampaignActivity[]> {
    return await queryTiDb<CampaignActivity>(
      'SELECT * FROM cpa_activities ORDER BY date ASC, time ASC'
    );
  },

  async addActivity(act: CampaignActivity): Promise<void> {
    await queryTiDb(
      `INSERT INTO cpa_activities
       (id, title, description, date, time, venue, status, category, targetAudience, attendanceCount, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       title = VALUES(title), description = VALUES(description),
       status = VALUES(status), attendanceCount = VALUES(attendanceCount)`,
      [
        act.id, act.title, act.description || '', act.date, act.time,
        act.venue, act.status, act.category, act.targetAudience || '',
        act.attendanceCount || 0, act.createdBy || 'admin',
      ]
    );
  },

  async updateActivity(id: string, updates: Partial<CampaignActivity>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
    if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
    if (updates.date !== undefined) { fields.push('date = ?'); values.push(updates.date); }
    if (updates.time !== undefined) { fields.push('time = ?'); values.push(updates.time); }
    if (updates.venue !== undefined) { fields.push('venue = ?'); values.push(updates.venue); }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.attendanceCount !== undefined) { fields.push('attendanceCount = ?'); values.push(updates.attendanceCount); }
    if (fields.length > 0) {
      values.push(id);
      await queryTiDb(`UPDATE cpa_activities SET ${fields.join(', ')} WHERE id = ?`, values);
    }
  },

  async deleteActivity(id: string): Promise<void> {
    await queryTiDb('DELETE FROM cpa_activities WHERE id = ?', [id]);
  },

  // ─── COMMUNICATIONS ───────────────────────────────────────────────────────

  async getCommunications(): Promise<CommunicationMessage[]> {
    return await queryTiDb<CommunicationMessage>(
      'SELECT * FROM cpa_communications ORDER BY createdAt DESC'
    );
  },

  async addCommunication(comm: CommunicationMessage): Promise<void> {
    await queryTiDb(
      `INSERT INTO cpa_communications
       (id, title, message, channel, targetCourse, targetYear, recipientCount, status, createdAt, sentAt, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        comm.id, comm.title, comm.message, comm.channel,
        comm.targetCourse || '', comm.targetYear || '',
        comm.recipientCount || 0, comm.status, comm.createdAt,
        comm.sentAt || '', comm.createdBy || 'admin',
      ]
    );
  },

  // ─── SETTINGS ─────────────────────────────────────────────────────────────

  async getSettings(): Promise<SystemSettings | null> {
    const rows = await queryTiDb<{ data: SystemSettings }>(
      "SELECT data FROM cpa_settings WHERE id = 'system' LIMIT 1"
    );
    if (rows.length > 0) {
      return typeof rows[0].data === 'string'
        ? JSON.parse(rows[0].data)
        : rows[0].data;
    }
    return null;
  },

  async saveSettings(settings: SystemSettings): Promise<void> {
    await queryTiDb(
      `INSERT INTO cpa_settings (id, data) VALUES ('system', ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data)`,
      [JSON.stringify(settings)]
    );
  },

  // ─── PASSWORD (always TiDB, never memory) ─────────────────────────────────

  async getAdminPassword(): Promise<string> {
    try {
      const settings = await this.getSettings();
      if (settings && settings.adminPassword) {
        return settings.adminPassword;
      }
    } catch (e) {
      console.warn('[TiDB] getAdminPassword fallback to default:', e);
    }
    return 'cpa2026';
  },

  async setAdminPassword(newPassword: string): Promise<void> {
    let settings: SystemSettings | null = null;
    try {
      settings = await this.getSettings();
    } catch (e) {
      console.warn('[TiDB] getSettings error in setAdminPassword:', e);
    }
    const merged = { ...(settings || {}), adminPassword: newPassword } as SystemSettings;
    await this.saveSettings(merged);
  },
};
