import { AIService, Gemma4ApiProvider, loadAIConfig } from "../server/ai";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadServerEnvFile() {
  const envPath = join(process.cwd(), "server", ".env");
  if (!existsSync(envPath)) {
    return {};
  }

  const values: Record<string, string> = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 1) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    values[key] = value;
  }
  return values;
}

async function main() {
  const config = loadAIConfig({ ...process.env, ...loadServerEnvFile() });
  const provider = new Gemma4ApiProvider({ config });
  const service = new AIService(provider);
  const status = await service.getStatus();

  const shouldGenerate = process.argv.includes("--generate");
  let generationOk: boolean | null = null;
  if (shouldGenerate && status.available && status.modelAvailable) {
    const response = await service.generateText({ prompt: "Reply with one short word." }, { timeoutMs: config.GEMMA_TIMEOUT_MS });
    generationOk = response.text.length > 0;
  }

  process.stdout.write(
    JSON.stringify(
      {
        provider: status.provider,
        model: status.model,
        available: status.available,
        modelAvailable: status.modelAvailable,
        latencyMs: status.latencyMs,
        result: status.errorCode ?? (generationOk === false ? "GENERATION_FAILED" : "OK"),
      },
      null,
      2,
    ),
  );
  process.stdout.write("\n");

  if (!status.available || !status.modelAvailable || generationOk === false) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const code = error instanceof Error ? error.name : "UnknownError";
  process.stderr.write(`${code}\n`);
  process.exitCode = 1;
});
