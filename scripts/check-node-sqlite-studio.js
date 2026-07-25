const requiredMessage = [
  "Drizzle Studio utilise le driver node:sqlite.",
  "Cette version de Node ne fournit pas stmt.setReturnArrays, ce qui provoque l'erreur Studio.",
  "Installe et utilise Node >= 22.16.0, puis relance: npm run db:studio",
].join("\n");

try {
  const { DatabaseSync } = require("node:sqlite");
  const db = new DatabaseSync(":memory:");
  const stmt = db.prepare("select 1");
  const isCompatible = typeof stmt.setReturnArrays === "function";
  db.close();

  if (!isCompatible) {
    console.error(requiredMessage);
    console.error(`Version actuelle: ${process.version}`);
    process.exit(1);
  }
} catch (error) {
  console.error(requiredMessage);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
