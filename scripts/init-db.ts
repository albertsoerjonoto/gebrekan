import { Pool } from "@neondatabase/serverless";
import { SCHEMA_SQL } from "../lib/db";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: url });
  try {
    await pool.query(SCHEMA_SQL);
    console.log("schema applied");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
