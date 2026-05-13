const { Client } = require('pg');

async function test(url, label) {
  console.log(`\nTesting [${label}]: ${url.replace(/:([^:@]+)@/, ':***@')}...`);
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    const result = await client.query('SELECT current_database()');
    console.log("✅ SUCCESS! DB:", result.rows[0].current_database);
    await client.end();
    return true;
  } catch (err) {
    console.error("❌ FAILED:", err.message);
    return false;
  }
}

const pwd = "MicroErp2026";
const ref = "snarbngdjyxfgoixievi";

(async () => {
  await test(`postgresql://postgres.${ref}:${pwd}@aws-1-us-west-2.pooler.supabase.com:6543/postgres`, 'aws-1-us-west-2 pooler');
  await test(`postgresql://postgres.${ref}:${pwd}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`, 'aws-0-us-west-2 pooler');
  await test(`postgresql://postgres:${pwd}@db.${ref}.supabase.co:5432/postgres`, 'direct IPv4');
})();
