import { describe, expect, it } from "vitest";

import { PasswordHasher } from "./password-hasher";

const PASSWORD = "uma-senha-segura-123";

describe("PasswordHasher", () => {
  it("derives a salted hash and verifies the original password", async () => {
    const hasher = new PasswordHasher();
    const firstHash = await hasher.hash(PASSWORD);
    const secondHash = await hasher.hash(PASSWORD);

    expect(firstHash).not.toBe(secondHash);
    await expect(hasher.verify(PASSWORD, firstHash)).resolves.toBe(true);
    await expect(hasher.verify("senha-incorreta", firstHash)).resolves.toBe(
      false,
    );
  });

  it("rejects malformed hashes", async () => {
    const hasher = new PasswordHasher();

    await expect(hasher.verify(PASSWORD, "sha256$invalido")).resolves.toBe(
      false,
    );
  });
});
