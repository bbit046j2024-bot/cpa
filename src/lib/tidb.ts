import mysql from 'mysql2/promise';
import { Supporter, CampaignActivity, CampaignUpdate, CommunicationMessage, SystemSettings } from './types';

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
  // Supporters
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

  async updateSupporter(id: string, updates: Partial<Supporter>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.fullName !== undefined) {
      fields.push('fullName = ?');
      values.push(updates.fullName);
    }
    if (updates.phoneNumber !== undefined) {
      fields.push('phoneNumber = ?');
      values.push(updates.phoneNumber);
    }
    if (updates.rawPhone !== undefined) {
      fields.push('rawPhone = ?');
      values.push(updates.rawPhone);
    }
    if (updates.course !== undefined) {
      fields.push('course = ?');
      values.push(updates.course);
    }
    if (updates.yearOfStudy !== undefined) {
      fields.push('yearOfStudy = ?');
      values.push(updates.yearOfStudy);
    }
    if (updates.communicationConsent !== undefined) {
      fields.push('communicationConsent = ?');
      values.push(updates.communicationConsent ? 1 : 0);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }

    if (fields.length > 0) {
      values.push(id);
      await queryTiDb(
        `UPDATE cpa_supporters SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
  },

  async deleteSupporter(id: string): Promise<void> {
    await queryTiDb('DELETE FROM cpa_supporters WHERE id = ?', [id]);
  },

  // Activities
  async getActivities(): Promise<CampaignActivity[]> {
    return await queryTiDb<CampaignActivity>(
      'SELECT * FROM cpa_activities ORDER BY date ASC, time ASC'
    );
  },

  async addActivity(act: CampaignActivity): Promise<void> {
    await queryTiDb(
      `INSERT INTO cpa_activities
       (id, title, description, date, time, venue, status, category, targetAudience, attendanceCount, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        act.id,
        act.title,
        act.description || '',
        act.date,
        act.time,
        act.venue,
        act.status,
        act.category,
        act.targetAudience || '',
        act.attendanceCount || 0,
        act.createdBy || 'admin',
      ]
    );
  },

  // Communications
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
        comm.id,
        comm.title,
        comm.message,
        comm.channel,
        comm.targetCourse || '',
        comm.targetYear || '',
        comm.recipientCount || 0,
        comm.status,
        comm.createdAt,
        comm.sentAt || '',
        comm.createdBy || 'admin',
      ]
    );
  },

  // Settings
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

  // Password helpers – always read/write from TiDB (source of truth)
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
