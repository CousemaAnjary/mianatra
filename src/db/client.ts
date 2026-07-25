import { drizzle } from "drizzle-orm/expo-sqlite";
import type { AnyRelations } from "drizzle-orm";
import { openDatabaseSync } from "expo-sqlite";
import { dbRelations } from "./schema";

const expoDb = openDatabaseSync("mianatra.db");
expoDb.execSync("PRAGMA foreign_keys = ON");
expoDb.execSync("PRAGMA journal_mode = WAL");

export const db = drizzle(expoDb, { relations: dbRelations as AnyRelations });
export { expoDb };
