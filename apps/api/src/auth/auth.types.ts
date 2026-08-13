export type AuthenticatedUser = {
  email: string;
  id: string;
  name: string;
};

export type AuthContext = {
  expiresAt: Date;
  sessionId: string;
  user: AuthenticatedUser;
};

export type AuthenticatedRequest = {
  auth?: AuthContext;
  headers: Record<string, string | string[] | undefined>;
};
