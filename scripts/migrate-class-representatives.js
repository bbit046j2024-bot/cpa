import mysql from 'mysql2/promise';
import fs from 'node:fs';
import path from 'node:path';

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const value = line.trim();
    if (!value || value.startsWith('#')) continue;
    const splitAt = value.indexOf('=');
    if (splitAt < 1) continue;
    const key = value.slice(0, splitAt).trim();
    const val = value.slice(splitAt + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

async function migrate() {
  loadLocalEnv();
  const required = ['TIDB_HOST', 'TIDB_USER', 'TIDB_PASSWORD', 'TIDB_DATABASE'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing database environment variables: ${missing.join(', ')}`);
  const connection = await mysql.createConnection({
    host: process.env.TIDB_HOST,
    port: Number(process.env.TIDB_PORT || 4000),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    ssl: { rejectUnauthorized: process.env.TIDB_SSL_REJECT_UNAUTHORIZED !== 'false' },
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cpa_class_representatives (
        id VARCHAR(64) PRIMARY KEY,
        fullName VARCHAR(200) NOT NULL,
        contact VARCHAR(254) NOT NULL,
        contactType VARCHAR(16) NOT NULL,
        course VARCHAR(255) NOT NULL,
        yearOfStudy VARCHAR(20) NOT NULL,
        classRepConfirmed BOOLEAN NOT NULL DEFAULT FALSE,
        privacyConsent BOOLEAN NOT NULL DEFAULT FALSE,
        consentAt VARCHAR(64) NOT NULL,
        reviewStatus VARCHAR(16) NOT NULL DEFAULT 'pending',
        registeredAt VARCHAR(64) NOT NULL,
        reviewedAt VARCHAR(64) NULL,
        source VARCHAR(128) NOT NULL,
        UNIQUE KEY uq_cpa_class_rep_contact (contact),
        KEY idx_cpa_class_rep_status_date (reviewStatus, registeredAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    const [columnRows] = await connection.query(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
      ['cpa_class_representatives']
    );
    const existingColumns = new Set(columnRows.map((column) => column.COLUMN_NAME));
    const optionalColumns = [
      ['classRepConfirmed', 'BOOLEAN NOT NULL DEFAULT FALSE'],
      ['privacyConsent', 'BOOLEAN NOT NULL DEFAULT FALSE'],
      ['consentAt', "VARCHAR(64) NOT NULL DEFAULT ''"],
    ];
    for (const [columnName, definition] of optionalColumns) {
      if (!existingColumns.has(columnName)) {
        await connection.query(`ALTER TABLE cpa_class_representatives ADD COLUMN ${columnName} ${definition}`);
      }
    }    console.log('cpa_class_representatives table is ready. Existing supporter tables were not changed.');
  } finally {
    await connection.end();
  }
}

migrate().catch((error) => {
  console.error('Class representative table migration failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
});
