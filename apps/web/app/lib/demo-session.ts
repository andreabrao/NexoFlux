import type { DemoSession, StorageLike } from "./demo-repository";

const SESSION_KEY = "nexoflux.demo.session.v1";

export function clearDemoSession(storage: StorageLike): void {
  storage.removeItem(SESSION_KEY);
}

export function readDemoSession(storage: StorageLike): DemoSession | null {
  const rawSession = storage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as DemoSession;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      clearDemoSession(storage);
      return null;
    }

    return session;
  } catch {
    clearDemoSession(storage);
    return null;
  }
}

export function writeDemoSession(
  storage: StorageLike,
  session: DemoSession,
): void {
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}
