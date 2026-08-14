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

type AuthMode = "login" | "register" | "recovery";

type AuthScreenProps = {
  mode: AuthMode;
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLogin = mode === "login";
  const isRecovery = mode === "recovery";

  const chooseDemoAccount = (account: (typeof demoAccounts)[number]): void => {
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setError("");
    setNotice("");
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      const repository = createDemoRepository(window.localStorage);
      if (isRecovery) {
        if (password !== passwordConfirmation) {
          throw new DemoRepositoryError("As senhas informadas não coincidem.");
        }

        repository.recoverPassword(email, password);
        setPassword("");
        setPasswordConfirmation("");
        setNotice(
          "Senha local redefinida. Entre com a nova senha nesta demonstração.",
        );
        setIsSubmitting(false);
        return;
      }
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
          <p className="eyebrow">Simulação navegável</p>
          <h1>
            {isRecovery
              ? "Recupere o acesso local à demonstração."
              : "Experimente a operação antes de conectar serviços reais."}
          </h1>
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
          <p className="eyebrow">
            {isRecovery
              ? "Recuperar acesso"
              : isLogin
                ? "Acessar"
                : "Criar conta"}
          </p>
          <h2>
            {isRecovery
              ? "Redefinir senha local"
              : isLogin
                ? "Entre no simulador"
                : "Comece uma nova operação"}
          </h2>
          <p>
            {isRecovery
              ? "Este fluxo não envia e-mail nem altera contas externas. Ele só atualiza os dados deste navegador."
              : isLogin
                ? "Use uma conta demonstrativa ou suas próprias credenciais locais."
                : "Sua conta e seu primeiro workspace existirão apenas nesta demonstração."}
          </p>
        </div>

        <form className="authForm" onSubmit={submit}>
          {!isLogin && !isRecovery ? (
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
          {isRecovery ? (
            <label>
              Confirmar nova senha
              <input
                autoComplete="new-password"
                minLength={12}
                onChange={(event) =>
                  setPasswordConfirmation(event.target.value)
                }
                required
                type="password"
                value={passwordConfirmation}
              />
            </label>
          ) : null}

          {error ? (
            <p className="formError" role="alert">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="successMessage" role="status">
              {notice}
            </p>
          ) : null}

          <button
            className="primaryButton"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Processando…"
              : isRecovery
                ? "Redefinir senha local"
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
          {isRecovery
            ? "Já lembra sua senha local?"
            : isLogin
              ? "Ainda não tem uma conta local?"
              : "Já criou uma conta?"}{" "}
          <Link href={isLogin ? "/criar-conta" : "/entrar"}>
            {isLogin ? "Criar workspace" : "Entrar"}
          </Link>
        </p>
        {isLogin ? (
          <p className="authSwitch authRecoveryLink">
            <Link href="/recuperar-senha">Esqueci minha senha local</Link>
          </p>
        ) : null}
      </section>
    </main>
  );
}
