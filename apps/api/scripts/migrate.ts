import "dotenv/config";

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Pool } from "pg";

import { environment } from "../src/environment";

const migrationsDirectory = resolve(__dirname, "..", "migrations");
const pool = new Pool({ connectionString: environment.DATABASE_URL });

async function migrate(): Promise<void> {
  await pool.query(
    [
      "create table if not exists schema_migrations (",
      "name text primary key,",
      "checksum char(64) not null,",
      "applied_at timestamptz not null default now()",
      ")",
    ].join(" "),
  );

  const migrationFiles = (await readdir(migrationsDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const name of migrationFiles) {
    const sql = await readFile(resolve(migrationsDirectory, name), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = await pool.query<{ checksum: string }>(
      "select checksum from schema_migrations where name = $1",
      [name],
    );

    if (existing.rowCount === 1) {
      if (existing.rows[0]?.checksum !== checksum) {
        throw new Error("A migração aplicada " + name + " foi alterada.");
      }

      continue;
    }

    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into schema_migrations (name, checksum) values ($1, $2)",
        [name, checksum],
      );
      await client.query("commit");
      console.info("Migração aplicada: " + name);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
}

void migrate()
  .finally(async () => pool.end())
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
