import "dotenv/config";

import { createConnection } from "node:net";

import { environment } from "../src/environment";

type Dependency = {
  label: string;
  url: string;
};

const dependencies: Dependency[] = [
  { label: "PostgreSQL", url: environment.DATABASE_URL },
  { label: "Redis", url: environment.REDIS_URL },
];

function redactUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  if (url.password) {
    url.password = "***";
  }

  return url.toString();
}

async function canConnect(dependency: Dependency): Promise<boolean> {
  const url = new URL(dependency.url);
  const port = Number(
    url.port || (url.protocol.startsWith("postgres") ? 5432 : 6379),
  );

  return new Promise((resolve) => {
    const socket = createConnection({ host: url.hostname, port });
    const finish = (available: boolean) => {
      socket.destroy();
      resolve(available);
    };

    socket.setTimeout(1_500);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}

async function preflight(): Promise<void> {
  const results = await Promise.all(
    dependencies.map(async (dependency) => ({
      available: await canConnect(dependency),
      dependency,
    })),
  );
  const unavailable = results.filter((result) => !result.available);

  if (unavailable.length > 0) {
    const labels = unavailable
      .map(
        (result) =>
          result.dependency.label + " em " + redactUrl(result.dependency.url),
      )
      .join(", ");
    throw new Error(
      "Infraestrutura indisponível: " +
        labels +
        ". Inicie os serviços com docker compose up -d antes de repetir.",
    );
  }

  console.info("Preflight aprovado: PostgreSQL e Redis estão acessíveis.");
}

void preflight().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
