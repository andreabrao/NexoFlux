import type { Metadata } from "next";

import { AuthScreen } from "../components/auth-screen";

export const metadata: Metadata = {
  description: "Crie uma conta local para a demonstração da NexoFlux.",
  title: "Criar conta | NexoFlux",
};

export default function RegisterPage() {
  return <AuthScreen mode="register" />;
}
