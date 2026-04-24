import { Pool } from "pg";

const isLocal = process.env.DB_HOST === "localhost";

export const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: isLocal
    ? false
    : {
        rejectUnauthorized: false,
      },
});