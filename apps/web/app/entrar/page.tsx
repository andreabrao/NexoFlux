import type { Metadata } from "next";

import { AuthScreen } from "../components/auth-screen";

export const metadata: Metadata = {
  description: "Acesse a demonstração da área autenticada da NexoFlux.",
  title: "Entrar | NexoFlux",
};

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}
