import type { Metadata } from "next";

import { WorkspaceSettingsScreen } from "../components/workspace-settings-screen";

export const metadata: Metadata = {
  description: "Configurações locais do workspace NexoFlux.",
  title: "Configurações | NexoFlux",
};

export default function WorkspaceSettingsPage() {
  return <WorkspaceSettingsScreen />;
}
