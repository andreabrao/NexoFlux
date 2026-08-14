import type { Metadata } from "next";

import { AuthScreen } from "../components/auth-screen";

export const metadata: Metadata = {
  description: "Redefina a senha local da demonstração da NexoFlux.",
  title: "Recuperar senha | NexoFlux",
};

export default function PasswordRecoveryPage() {
  return <AuthScreen mode="recovery" />;
}
