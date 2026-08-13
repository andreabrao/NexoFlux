import { describe, expect, it } from "vitest";

import { processTask } from "./processor";

describe("processTask", () => {
  it("preserves the workspace boundary in the result", async () => {
    const result = await processTask({
      accountId: "61accc21-aad3-45cb-86c8-185178d35722",
      id: "95c4b1f1-ecaa-4b60-a308-d8e8dd3eb455",
      scheduledAt: "2026-08-13T15:00:00.000Z",
      type: "PUBLISH_POST",
      workspaceId: "2107406f-5440-4086-a0b0-896d28eef583",
    });

    expect(result).toEqual({
      id: "95c4b1f1-ecaa-4b60-a308-d8e8dd3eb455",
      status: "accepted",
      workspaceId: "2107406f-5440-4086-a0b0-896d28eef583",
    });
  });
});
