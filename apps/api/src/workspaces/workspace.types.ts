import type { WorkspaceRole } from "@nexoflux/contracts";

export type WorkspaceMembership = {
  role: WorkspaceRole;
  userId: string;
  workspaceId: string;
};

export type WorkspaceSummary = {
  createdAt: Date;
  id: string;
  name: string;
  role: WorkspaceRole;
  slug: string;
};

export type WorkspaceMember = {
  createdAt: Date;
  email: string;
  name: string;
  role: WorkspaceRole;
  userId: string;
};
