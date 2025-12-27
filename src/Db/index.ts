import { Pool } from "pg";

const db: Pool = new Pool({
  host: 'dpg-d3spu6vdiees73cor8s0-a.singapore-postgres.render.com',
  user: 'db_chatchawan_user',
  port: 5432,
  password: '0hLMUMUTDdrHrEcRDE5OCwxjCMf0GpWV',
  database: 'db_chatchawan',
  ssl: {
    rejectUnauthorized: false 
  }
});

db.connect((err: any | null) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to PostgreSQL database!');
  }
});

export default db;
