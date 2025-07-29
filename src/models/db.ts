import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'your_database',
  password: process.env.PGPASSWORD || 'admin',
  port: Number(process.env.PGPORT) || 5432,
});

export default pool; 