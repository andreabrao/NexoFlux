import "dotenv/config";

import { TASK_QUEUE_NAME } from "@nexoflux/contracts";
import { Worker } from "bullmq";
import Redis from "ioredis";
import { z } from "zod";

import { processTask } from "./processor";

const environment = z
  .object({
    REDIS_URL: z.string().default("redis://localhost:6379"),
  })
  .parse(process.env);

const connection = new Redis(environment.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  TASK_QUEUE_NAME,
  async (job) => processTask(job.data),
  {
    connection,
    concurrency: 5,
  },
);

worker.on("completed", (job) => {
  console.info("task completed", { jobId: job.id });
});

worker.on("failed", (job, error) => {
  console.error("task failed", { error: error.message, jobId: job?.id });
});

async function shutdown(): Promise<void> {
  await worker.close();
  await connection.quit();
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
