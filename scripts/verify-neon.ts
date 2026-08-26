import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

async function verifyConnection() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing from .env.local");
  }

  const sql = neon(connectionString);
  const [result] = await sql`SELECT 1 AS connected`;

  console.log(result);
}

verifyConnection().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
