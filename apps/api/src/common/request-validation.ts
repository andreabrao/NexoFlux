import { BadRequestException } from "@nestjs/common";
import type { z } from "zod";

export function parseRequest<Output>(
  schema: z.ZodType<Output>,
  value: unknown,
): Output {
  const result = schema.safeParse(value);

  if (result.success) {
    return result.data;
  }

  throw new BadRequestException({
    issues: result.error.issues.map((issue) => ({
      message: issue.message,
      path: issue.path.join("."),
    })),
    message: "Os dados enviados são inválidos.",
  });
}
