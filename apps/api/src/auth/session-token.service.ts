import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";

export type IssuedSessionToken = {
  hash: string;
  plainText: string;
};

@Injectable()
export class SessionTokenService {
  issue(): IssuedSessionToken {
    const plainText = randomBytes(32).toString("base64url");

    return {
      hash: this.hash(plainText),
      plainText,
    };
  }

  hash(plainText: string): string {
    return createHash("sha256").update(plainText).digest("hex");
  }
}
