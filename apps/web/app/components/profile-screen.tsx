"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import {
  createDemoRepository,
  DemoRepositoryError,
  type DemoSession,
  type DemoUserProfile,
} from "../lib/demo-repository";
import { clearDemoSession, readDemoSession } from "../lib/demo-session";

function messageFrom(reason: unknown): string {
  return reason instanceof DemoRepositoryError
    ? reason.message
    : "Não foi possível atualizar o perfil local.";
}

export function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [profile, setProfile] = useState<DemoUserProfile | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const activeSession = readDemoSession(window.sessionStorage);
    if (!activeSession) {
      router.replace("/entrar");
      return;
    }

    try {
      const user = createDemoRepository(window.localStorage).getUser(
        activeSession.userId,
      );
      setSession(activeSession);
      setProfile(user);
      setName(user.name);
    } catch (reason) {
      clearDemoSession(window.sessionStorage);
      setError(messageFrom(reason));
    }
  }, [router]);

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!session) {
      return;
    }

    setError("");
    setNotice("");
    try {
      const updatedProfile = createDemoRepository(
        window.localStorage,
      ).updateProfile(session.userId, { name });
      setProfile(updatedProfile);
      setName(updatedProfile.name);
      setNotice("Perfil local atualizado e registrado na auditoria.");
    } catch (reason) {
      setError(messageFrom(reason));
    }
  };

  if (!profile) {
    return <main className="appLoading">Preparando seu perfil local…</main>;
  }

  return (
    <main className="profilePage">
      <nav className="navigation" aria-label="Navegação do perfil">
        <Link className="brand" href="/app">
          <span className="brandMark" aria-hidden="true">
            N
          </span>
          <span>NexoFlux</span>
        </Link>
        <Link className="navLink" href="/app">
          Voltar ao workspace
        </Link>
      </nav>

      <section className="profilePanel">
        <p className="eyebrow">Marco 10 · Perfil</p>
        <h1>Seu perfil local</h1>
        <p>
          Atualize como seu nome aparece no workspace. Esta preferência fica
          apenas neste navegador e não altera contas externas.
        </p>

        <form className="authForm" onSubmit={submit}>
          <label>
            Nome exibido
            <input
              autoComplete="name"
              maxLength={80}
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
          <label>
            E-mail local
            <input disabled type="email" value={profile.email} />
          </label>
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
          <button className="primaryButton" type="submit">
            Salvar perfil local
          </button>
        </form>

        <p className="profileLimit">
          Senha, e-mail transacional e identidade externa continuam fora do
          escopo desta simulação.
        </p>
      </section>
    </main>
  );
}
