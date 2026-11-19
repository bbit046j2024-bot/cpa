const mysql = require('mysql2/promise');
const fs = require('fs');

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const eq = line.indexOf('=');
  if (eq > 0 && !line.startsWith('#')) {
    const key = line.substring(0, eq).trim();
    const val = line.substring(eq + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
});

async function checkTiDB() {
  const conn = await mysql.createConnection({
    host: env.TIDB_HOST || 'gateway01.us-west-2.prod.aws.tidbcloud.com',
    port: parseInt(env.TIDB_PORT || '4000', 10),
    user: env.TIDB_USER || '4CfgwWN4niqXLXF.root',
    password: env.TIDB_PASSWORD,
    database: env.TIDB_DATABASE || 'campus_dive',
    ssl: { rejectUnauthorized: true }
  });

  console.log('Connected to TiDB Cloud successfully.');

  const [rows] = await conn.query(
    'SELECT id, fullName, phoneNumber, course, yearOfStudy, source, registrationDate FROM cpa_supporters ORDER BY registrationDate DESC'
  );

  console.log('\n=== TiDB SUPPORTERS (' + rows.length + ' total) ===\n');
  rows.forEach((r, i) => {
    console.log((i + 1) + '. ' + r.fullName + ' | ' + r.phoneNumber + ' | ' + r.course + ' | ' + r.yearOfStudy + ' | Source: ' + (r.source || 'N/A'));
  });

  // Also check by source
  const [online] = await conn.query("SELECT COUNT(*) as cnt FROM cpa_supporters WHERE source = 'Online Supporter Portal'");
  const [loyalty] = await conn.query("SELECT COUNT(*) as cnt FROM cpa_supporters WHERE source = 'Initial Loyalty Register'");
  const [other] = await conn.query("SELECT COUNT(*) as cnt FROM cpa_supporters WHERE source NOT IN ('Online Supporter Portal', 'Initial Loyalty Register') OR source IS NULL");

  console.log('\n=== BREAKDOWN ===');
  console.log('Online registrations : ' + online[0].cnt);
  console.log('Initial Loyalty List : ' + loyalty[0].cnt);
  console.log('Other / Manual       : ' + other[0].cnt);
  console.log('TOTAL                : ' + rows.length);

  await conn.end();
}

checkTiDB().catch(err => {
  console.error('TiDB connection error:', err.message);
  process.exit(1);
});
