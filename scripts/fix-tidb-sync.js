const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: process.env.TIDB_HOST || 'gateway01.us-west-2.prod.aws.tidbcloud.com',
  port: parseInt(process.env.TIDB_PORT || '4000', 10),
  user: process.env.TIDB_USER || '4CfgwWN4niqXLXF.root',
  password: process.env.TIDB_PASSWORD || '9aUnQqJEGUVSRxq7',
  database: process.env.TIDB_DATABASE || 'campus_dive',
  ssl: { rejectUnauthorized: true }
};

async function fix() {
  const conn = await mysql.createConnection(config);
  console.log('Connected to TiDB Cloud!');

  // 1. Remove deleted test records
  await conn.query('DELETE FROM cpa_supporters WHERE id = ? OR phoneNumber = ?', ['sup_1795041953571_a4ia', '+254797844540']);
  console.log('Deleted old test record ELISHA ADERA from TiDB.');

  // 2. Insert Benjamin Kithuka
  await conn.query(`
    INSERT INTO cpa_supporters 
    (id, fullName, phoneNumber, rawPhone, course, yearOfStudy, communicationConsent, consentTimestamp, registrationDate, status, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    fullName = VALUES(fullName), 
    phoneNumber = VALUES(phoneNumber),
    course = VALUES(course), 
    yearOfStudy = VALUES(yearOfStudy);
  `, [
    'sup_benjamin_kithuka',
    'BENJAMIN KITHUKA',
    '+254708342477',
    '0708 342 477',
    'Bachelor of Business and Information Technology',
    'Year 3',
    1,
    new Date().toISOString(),
    new Date().toISOString(),
    'active',
    'Online Supporter Portal'
  ]);
  console.log('Benjamin Kithuka verified and saved in TiDB.');

  const [count] = await conn.query('SELECT COUNT(*) as c FROM cpa_supporters;');
  console.log('Total verified supporters in TiDB:', count[0].c);

  await conn.end();
}

fix().catch(err => {
  console.error('Fix error:', err);
  process.exit(1);
});
