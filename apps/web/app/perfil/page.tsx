import type { Metadata } from "next";

import { ProfileScreen } from "../components/profile-screen";

export const metadata: Metadata = {
  description: "Perfil local da demonstração da NexoFlux.",
  title: "Perfil | NexoFlux",
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
