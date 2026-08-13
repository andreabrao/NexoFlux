"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  createDemoRepository,
  demoAccounts,
  DEMO_PASSWORD,
  DemoRepositoryError,
} from "../lib/demo-repository";
import { writeDemoSession } from "../lib/demo-session";

type AuthMode = "login" | "register";

type AuthScreenProps = {
  mode: AuthMode;
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLogin = mode === "login";

  const chooseDemoAccount = (account: (typeof demoAccounts)[number]): void => {
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const repository = createDemoRepository(window.localStorage);
      const result = isLogin
        ? repository.authenticate(email, password)
        : repository.register({
            email,
            name,
            password,
            workspaceName,
          });

      writeDemoSession(window.sessionStorage, result.session);
      router.push("/app");
    } catch (reason) {
      setError(
        reason instanceof DemoRepositoryError
          ? reason.message
          : "Não foi possível concluir a ação no simulador.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="authPage">
      <section className="authIntro">
        <Link className="brand" href="/">
          <span className="brandMark" aria-hidden="true">
            N
          </span>
          <span>NexoFlux</span>
        </Link>
        <div className="authIntroCopy">
          <p className="eyebrow">Marco 03 · Simulação navegável</p>
          <h1>Experimente a operação antes de conectar serviços reais.</h1>
          <p>
            Contas, workspaces e permissões são simulados nesta demonstração.
            Nenhum dado é enviado a um servidor.
          </p>
        </div>
        <div className="demoNote">
          <span aria-hidden="true">◇</span>
          <p>
            Os dados ficam apenas neste navegador e podem ser restaurados na
            área autenticada.
          </p>
        </div>
      </section>

      <section className="authPanel" aria-label="Acesso ao simulador">
        <div className="authPanelHeading">
          <p className="eyebrow">{isLogin ? "Acessar" : "Criar conta"}</p>
          <h2>{isLogin ? "Entre no simulador" : "Comece uma nova operação"}</h2>
          <p>
            {isLogin
              ? "Use uma conta demonstrativa ou suas próprias credenciais locais."
              : "Sua conta e seu primeiro workspace existirão apenas nesta demonstração."}
          </p>
        </div>

        <form className="authForm" onSubmit={submit}>
          {!isLogin ? (
            <>
              <label>
                Seu nome
                <input
                  autoComplete="name"
                  minLength={2}
                  onChange={(event) => setName(event.target.value)}
                  required
                  value={name}
                />
              </label>
              <label>
                Nome do workspace
                <input
                  minLength={2}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  placeholder="Ex.: Operação Aurora"
                  required
                  value={workspaceName}
                />
              </label>
            </>
          ) : null}
          <label>
            E-mail
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@exemplo.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Senha
            <input
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={12}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <p className="formError" role="alert">
              {error}
            </p>
          ) : null}

          <button
            className="primaryButton"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Abrindo…"
              : isLogin
                ? "Entrar no workspace"
                : "Criar workspace"}
          </button>
        </form>

        {isLogin ? (
          <div className="demoAccounts">
            <div>
              <p className="sectionLabel">Contas de demonstração</p>
              <p>
                Todas usam a senha <code>{DEMO_PASSWORD}</code>.
              </p>
            </div>
            <div className="demoAccountGrid">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => chooseDemoAccount(account)}
                  type="button"
                >
                  <span>{account.role}</span>
                  {account.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <p className="authSwitch">
          {isLogin ? "Ainda não tem uma conta local?" : "Já criou uma conta?"}{" "}
          <Link href={isLogin ? "/criar-conta" : "/entrar"}>
            {isLogin ? "Criar workspace" : "Entrar"}
          </Link>
        </p>
      </section>
    </main>
  );
}
