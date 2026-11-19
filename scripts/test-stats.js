const mysql = require('mysql2/promise');
const fs = require('fs');

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

async function run() {
  const conn = await mysql.createConnection({
    host: env.TIDB_HOST || 'gateway01.us-west-2.prod.aws.tidbcloud.com',
    port: parseInt(env.TIDB_PORT || '4000', 10),
    user: env.TIDB_USER || '4CfgwWN4niqXLXF.root',
    password: env.TIDB_PASSWORD,
    database: env.TIDB_DATABASE || 'campus_dive',
    ssl: { rejectUnauthorized: true }
  });

  const [rows] = await conn.query('SELECT yearOfStudy, COUNT(*) as cnt FROM cpa_supporters GROUP BY yearOfStudy');
  console.log('YEAR BREAKDOWN IN TIDB:');
  console.log(rows);

  const [courseRows] = await conn.query('SELECT course, COUNT(*) as cnt FROM cpa_supporters GROUP BY course');
  console.log('COURSE BREAKDOWN IN TIDB:');
  console.log(courseRows);

  const [totalRows] = await conn.query('SELECT COUNT(*) as total FROM cpa_supporters');
  console.log('TOTAL SUPPORTERS IN TIDB:', totalRows[0].total);

  await conn.end();
}

run().catch(console.error);
