import type { Metadata } from "next";

import { ClosedBetaScreen } from "../components/closed-beta-screen";

export const metadata: Metadata = {
  description: "Gestão local de participantes-piloto da NexoFlux.",
  title: "Beta fechado | NexoFlux",
};

export default function ClosedBetaPage() {
  return <ClosedBetaScreen />;
}
