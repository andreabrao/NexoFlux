import type { Metadata } from "next";

import { WorkspaceDashboard } from "../components/workspace-dashboard";

export const metadata: Metadata = {
  description: "Área autenticada simulada da NexoFlux.",
  title: "Workspace | NexoFlux",
};

export default function WorkspacePage() {
  return <WorkspaceDashboard />;
}
