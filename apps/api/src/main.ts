import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { environment } from "./environment";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  app.enableShutdownHooks();
  app.setGlobalPrefix("api/v1");

  await app.listen(environment.API_PORT, "0.0.0.0");
}

void bootstrap();
