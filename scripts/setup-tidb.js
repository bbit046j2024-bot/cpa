const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if present
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const config = {
  host: process.env.TIDB_HOST || 'gateway01.us-west-2.prod.aws.tidbcloud.com',
  port: parseInt(process.env.TIDB_PORT || '4000', 10),
  user: process.env.TIDB_USER || '4CfgwWN4niqXLXF.root',
  password: process.env.TIDB_PASSWORD || '',
  database: process.env.TIDB_DATABASE || 'campus_dive',
  ssl: { rejectUnauthorized: process.env.TIDB_SSL_REJECT_UNAUTHORIZED !== 'false' }
};

async function setup() {
  console.log('Connecting to TiDB Cloud:', config.host);
  const conn = await mysql.createConnection(config);
  console.log('Connected to TiDB successfully!');

  // Create tables
  await conn.query(`
    CREATE TABLE IF NOT EXISTS cpa_supporters (
      id VARCHAR(64) PRIMARY KEY,
      fullName VARCHAR(255) NOT NULL,
      phoneNumber VARCHAR(64) NOT NULL UNIQUE,
      rawPhone VARCHAR(64),
      course VARCHAR(255) NOT NULL,
      yearOfStudy VARCHAR(32) NOT NULL,
      communicationConsent BOOLEAN DEFAULT FALSE,
      consentTimestamp VARCHAR(64),
      registrationDate VARCHAR(64) NOT NULL,
      status VARCHAR(32) DEFAULT 'active',
      source VARCHAR(128)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('cpa_supporters table ready.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS cpa_activities (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      date VARCHAR(32) NOT NULL,
      time VARCHAR(32) NOT NULL,
      venue VARCHAR(255) NOT NULL,
      status VARCHAR(32) NOT NULL,
      category VARCHAR(64) NOT NULL,
      targetAudience VARCHAR(255),
      attendanceCount INT DEFAULT 0,
      createdBy VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('cpa_activities table ready.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS cpa_communications (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      channel VARCHAR(32) NOT NULL,
      targetCourse VARCHAR(255),
      targetYear VARCHAR(32),
      recipientCount INT DEFAULT 0,
      status VARCHAR(32) NOT NULL,
      createdAt VARCHAR(64) NOT NULL,
      sentAt VARCHAR(64),
      createdBy VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('cpa_communications table ready.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS cpa_settings (
      id VARCHAR(32) PRIMARY KEY,
      data JSON NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('cpa_settings table ready.');

  // Seed data if store.json exists
  const storePath = path.join(process.cwd(), 'data', 'store.json');
  if (fs.existsSync(storePath)) {
    const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

    // Check supporters count
    const [existing] = await conn.query('SELECT COUNT(*) as count FROM cpa_supporters;');
    if (existing[0].count === 0 && store.supporters && store.supporters.length > 0) {
      console.log(`Seeding ${store.supporters.length} supporters into TiDB...`);
      for (const s of store.supporters) {
        await conn.query(`
          INSERT IGNORE INTO cpa_supporters 
          (id, fullName, phoneNumber, rawPhone, course, yearOfStudy, communicationConsent, consentTimestamp, registrationDate, status, source)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          s.id, s.fullName, s.phoneNumber, s.rawPhone || '', s.course, s.yearOfStudy,
          s.communicationConsent ? 1 : 0, s.consentTimestamp || '', s.registrationDate,
          s.status || 'active', s.source || ''
        ]);
      }
      console.log('Supporters seeded successfully!');
    } else {
      console.log(`TiDB already has ${existing[0].count} supporters.`);
    }

    // Seed activities
    const [existingActs] = await conn.query('SELECT COUNT(*) as count FROM cpa_activities;');
    if (existingActs[0].count === 0 && store.activities && store.activities.length > 0) {
      console.log(`Seeding ${store.activities.length} activities into TiDB...`);
      for (const a of store.activities) {
        await conn.query(`
          INSERT IGNORE INTO cpa_activities
          (id, title, description, date, time, venue, status, category, targetAudience, attendanceCount, createdBy)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          a.id, a.title, a.description || '', a.date, a.time, a.venue, a.status,
          a.category, a.targetAudience || '', a.attendanceCount || 0, a.createdBy || 'admin'
        ]);
      }
      console.log('Activities seeded successfully!');
    }

    // Seed settings
    if (store.settings) {
      await conn.query(`
        INSERT INTO cpa_settings (id, data) VALUES ('system', ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data)
      `, [JSON.stringify(store.settings)]);
      console.log('Settings synced to TiDB.');
    }
  }

  const [totalSupporters] = await conn.query('SELECT COUNT(*) as total FROM cpa_supporters;');
  console.log(`\nMigration complete! Total supporters verified in TiDB: ${totalSupporters[0].total}`);

  await conn.end();
}

setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
