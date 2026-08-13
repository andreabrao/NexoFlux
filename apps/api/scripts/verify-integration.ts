import "dotenv/config";

import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";

import { runAuthIntegrationSmoke } from "./auth-integration-smoke";

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:3333/api/v1";
const apiDirectory = resolve(__dirname, "..");
const apiEntryPoint = resolve(apiDirectory, "dist", "main.js");

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(apiUrl + "/health/live");
    if (!response.ok) {
      return false;
    }

    const body = (await response.json()) as { service?: string };
    return body.service === "nexoflux-api";
  } catch {
    return false;
  }
}

async function waitForApi(child: ChildProcess): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error("A API encerrou antes de ficar disponível.");
    }
    if (await isApiAvailable()) {
      return;
    }

    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }

  throw new Error("A API não respondeu ao health check em 10 segundos.");
}

async function stopApi(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) {
    return;
  }

  child.kill();
  await new Promise<void>((resolveExit) => {
    const timeout = setTimeout(resolveExit, 2_000);
    child.once("exit", () => {
      clearTimeout(timeout);
      resolveExit();
    });
  });
}

async function verify(): Promise<void> {
  const existingApi = await isApiAvailable();
  let child: ChildProcess | undefined;
  let serverOutput = "";

  try {
    if (!existingApi) {
      child = spawn(process.execPath, [apiEntryPoint], {
        cwd: apiDirectory,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });
      child.stdout?.on("data", (chunk: Buffer) => {
        serverOutput += chunk.toString();
      });
      child.stderr?.on("data", (chunk: Buffer) => {
        serverOutput += chunk.toString();
      });
      await waitForApi(child);
    }

    const summary = await runAuthIntegrationSmoke();
    console.info(
      "Integração aprovada: " +
        summary.checks +
        " verificações no workspace temporário " +
        summary.workspaceId +
        ".",
    );
  } catch (error) {
    if (serverOutput) {
      console.error("Saída da API:\n" + serverOutput);
    }
    throw error;
  } finally {
    if (child) {
      await stopApi(child);
    }
  }
}

void verify().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
