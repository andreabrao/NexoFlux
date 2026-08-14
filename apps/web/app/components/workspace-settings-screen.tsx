"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import {
  createDemoRepository,
  DemoRepositoryError,
  type DemoSession,
  type DemoWorkspaceSummary,
} from "../lib/demo-repository";
import { clearDemoSession, readDemoSession } from "../lib/demo-session";

function messageFrom(reason: unknown): string {
  return reason instanceof DemoRepositoryError
    ? reason.message
    : "Não foi possível atualizar a configuração local.";
}

export function WorkspaceSettingsScreen() {
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [workspaces, setWorkspaces] = useState<DemoWorkspaceSummary[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === workspaceId,
  );

  useEffect(() => {
    const activeSession = readDemoSession(window.sessionStorage);
    if (!activeSession) {
      router.replace("/entrar");
      return;
    }

    try {
      const availableWorkspaces = createDemoRepository(
        window.localStorage,
      ).listWorkspaces(activeSession.userId);
      setSession(activeSession);
      setWorkspaces(availableWorkspaces);
      setWorkspaceId(availableWorkspaces[0]?.id ?? "");
      setName(availableWorkspaces[0]?.name ?? "");
    } catch (reason) {
      clearDemoSession(window.sessionStorage);
      setError(messageFrom(reason));
    }
  }, [router]);

  const selectWorkspace = (nextWorkspaceId: string): void => {
    const nextWorkspace = workspaces.find(
      (workspace) => workspace.id === nextWorkspaceId,
    );
    setWorkspaceId(nextWorkspaceId);
    setName(nextWorkspace?.name ?? "");
    setError("");
    setNotice("");
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!session || !selectedWorkspace) {
      return;
    }

    setError("");
    setNotice("");
    try {
      const updatedWorkspace = createDemoRepository(
        window.localStorage,
      ).updateWorkspaceName(session.userId, selectedWorkspace.id, name);
      setWorkspaces((currentWorkspaces) =>
        currentWorkspaces.map((workspace) =>
          workspace.id === updatedWorkspace.id ? updatedWorkspace : workspace,
        ),
      );
      setName(updatedWorkspace.name);
      setNotice("Identificação do workspace atualizada e auditada.");
    } catch (reason) {
      setError(messageFrom(reason));
    }
  };

  if (!selectedWorkspace) {
    return <main className="appLoading">Preparando as configurações…</main>;
  }

  const canEdit = selectedWorkspace.role === "OWNER";

  return (
    <main className="profilePage">
      <nav className="navigation" aria-label="Navegação das configurações">
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
        <p className="eyebrow">Marco 11 · Fundação</p>
        <h1>Configurações do workspace</h1>
        <p>
          Organize a identificação da operação sem alterar a estrutura ou os
          dados externos desta demonstração.
        </p>

        <form className="authForm" onSubmit={submit}>
          <label>
            Workspace
            <select
              onChange={(event) => selectWorkspace(event.target.value)}
              value={workspaceId}
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name} · {workspace.role}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nome exibido
            <input
              disabled={!canEdit}
              maxLength={80}
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
          <label>
            Identificador estável
            <input disabled value={selectedWorkspace.slug} />
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
          {canEdit ? (
            <button className="primaryButton" type="submit">
              Salvar identificação
            </button>
          ) : (
            <p className="readOnlyNotice">
              Somente Owners podem alterar a identificação do workspace.
            </p>
          )}
        </form>

        <p className="profileLimit">
          O identificador permanece estável e não existe sincronização entre
          navegadores nesta simulação local.
        </p>
      </section>
    </main>
  );
}
