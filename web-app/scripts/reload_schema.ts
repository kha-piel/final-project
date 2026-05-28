import { Client } from 'pg';

const connectionString = `postgresql://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@db.gdnifezsinailiqckwwh.supabase.co:5432/postgres`;

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query("NOTIFY pgrst, 'reload schema'");
  console.log('Schema reloaded!');
  await client.end();
}

main();
