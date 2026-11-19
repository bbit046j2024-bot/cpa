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

const TARGET_COURSE = 'Bachelor of Business and Information Technology';
const TARGET_YEAR = 'Year 3';

// 1. Update src/data/seed-supporters.json
const seedPath = path.join(__dirname, '..', 'src', 'data', 'seed-supporters.json');
if (fs.existsSync(seedPath)) {
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const updatedSeed = seed.map(s => ({
    ...s,
    course: TARGET_COURSE,
    yearOfStudy: TARGET_YEAR,
  }));
  fs.writeFileSync(seedPath, JSON.stringify(updatedSeed, null, 2), 'utf8');
  console.log(`Updated ${updatedSeed.length} records in src/data/seed-supporters.json to ${TARGET_COURSE}, ${TARGET_YEAR}.`);
}

// 2. Update data/store.json
const storePath = path.join(__dirname, '..', 'data', 'store.json');
if (fs.existsSync(storePath)) {
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  let updatedCount = 0;
  if (store.supporters && Array.isArray(store.supporters)) {
    store.supporters = store.supporters.map(s => {
      if (s.source === 'Initial Loyalty Register' || (s.id && s.id.startsWith('sup_0'))) {
        updatedCount++;
        return {
          ...s,
          course: TARGET_COURSE,
          yearOfStudy: TARGET_YEAR,
        };
      }
      return s;
    });
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
    console.log(`Updated ${updatedCount} loyalty list records in data/store.json.`);
  }
}

// 3. Update TiDB Cloud
async function updateTiDb() {
  const config = {
    host: process.env.TIDB_HOST || 'gateway01.us-west-2.prod.aws.tidbcloud.com',
    port: parseInt(process.env.TIDB_PORT || '4000', 10),
    user: process.env.TIDB_USER || '4CfgwWN4niqXLXF.root',
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE || 'campus_dive',
    ssl: { rejectUnauthorized: process.env.TIDB_SSL_REJECT_UNAUTHORIZED !== 'false' }
  };

  console.log('Connecting to TiDB Cloud to update loyalty list...');
  const conn = await mysql.createConnection(config);

  const [res] = await conn.query(
    `UPDATE cpa_supporters 
     SET course = ?, yearOfStudy = ? 
     WHERE source = 'Initial Loyalty Register' OR id LIKE 'sup_0%'`,
    [TARGET_COURSE, TARGET_YEAR]
  );
  console.log(`TiDB update completed: affectedRows = ${res.affectedRows}, changedRows = ${res.changedRows}`);

  const [samples] = await conn.query(
    `SELECT id, fullName, course, yearOfStudy, source 
     FROM cpa_supporters 
     WHERE source = 'Initial Loyalty Register' 
     LIMIT 5`
  );
  console.log('Sample updated records from TiDB:', samples);

  await conn.end();
  console.log('All updates finished successfully!');
}

updateTiDb().catch(err => {
  console.error('Error updating TiDB:', err);
  process.exit(1);
});
