import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type RuntimeEnv = {
  DB?: D1Database;
};

declare global {
  var __ADT_RUNTIME_ENV__: RuntimeEnv | undefined;
}

export function getDb() {
  const db = globalThis.__ADT_RUNTIME_ENV__?.DB;

  if (!db) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(db, { schema });
}

export function getD1() {
  const db = globalThis.__ADT_RUNTIME_ENV__?.DB;

  if (!db) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return db;
}
