"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import {
  createDemoRepository,
  DemoRepositoryError,
  type DemoBetaOverview,
  type DemoBetaParticipantStatus,
  type DemoSession,
  type DemoWorkspaceSummary,
} from "../lib/demo-repository";
import { clearDemoSession, readDemoSession } from "../lib/demo-session";

function messageFrom(reason: unknown): string {
  return reason instanceof DemoRepositoryError
    ? reason.message
    : "Não foi possível atualizar o beta fechado local.";
}

export function ClosedBetaScreen() {
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [workspaces, setWorkspaces] = useState<DemoWorkspaceSummary[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [overview, setOverview] = useState<DemoBetaOverview | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === workspaceId,
  );

  const loadOverview = (
    activeSession: DemoSession,
    selectedWorkspaceId: string,
  ): void => {
    setOverview(
      createDemoRepository(window.localStorage).getBetaOverview(
        selectedWorkspaceId,
        activeSession.userId,
      ),
    );
  };

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
      const initialWorkspaceId = availableWorkspaces[0]?.id ?? "";
      setSession(activeSession);
      setWorkspaces(availableWorkspaces);
      setWorkspaceId(initialWorkspaceId);
      if (initialWorkspaceId) {
        loadOverview(activeSession, initialWorkspaceId);
      }
    } catch (reason) {
      clearDemoSession(window.sessionStorage);
      setError(messageFrom(reason));
    }
  }, [router]);

  const selectWorkspace = (nextWorkspaceId: string): void => {
    if (!session) {
      return;
    }
    setWorkspaceId(nextWorkspaceId);
    setError("");
    setNotice("");
    try {
      loadOverview(session, nextWorkspaceId);
    } catch (reason) {
      setError(messageFrom(reason));
    }
  };

  const invite = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!session || !selectedWorkspace) {
      return;
    }

    setError("");
    setNotice("");
    try {
      createDemoRepository(window.localStorage).inviteBetaParticipant(
        session.userId,
        { email, name, workspaceId: selectedWorkspace.id },
      );
      setName("");
      setEmail("");
      loadOverview(session, selectedWorkspace.id);
      setNotice("Participante adicionado à lista local do beta fechado.");
    } catch (reason) {
      setError(messageFrom(reason));
    }
  };

  const updateStatus = (
    participantId: string,
    status: DemoBetaParticipantStatus,
  ): void => {
    if (!session || !selectedWorkspace) {
      return;
    }

    setError("");
    setNotice("");
    try {
      createDemoRepository(window.localStorage).updateBetaParticipantStatus(
        session.userId,
        selectedWorkspace.id,
        participantId,
        status,
      );
      loadOverview(session, selectedWorkspace.id);
      setNotice("Status do participante atualizado.");
    } catch (reason) {
      setError(messageFrom(reason));
    }
  };

  if (!selectedWorkspace || !overview) {
    return <main className="appLoading">Preparando o beta fechado…</main>;
  }

  const canManage = selectedWorkspace.role === "OWNER";

  return (
    <main className="profilePage">
      <nav className="navigation" aria-label="Navegação do beta fechado">
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

      <section className="profilePanel betaPanel">
        <p className="eyebrow">Beta fechado</p>
        <h1>Pessoas-piloto</h1>
        <p>
          Organize quem participa da validação local antes de qualquer operação
          externa.
        </p>

        <label className="betaWorkspaceSelect">
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

        {canManage ? (
          <form className="betaInviteForm" onSubmit={invite}>
            <label>
              Nome
              <input
                maxLength={80}
                minLength={2}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
            <label>
              E-mail
              <input
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <button className="primaryButton" type="submit">
              Adicionar piloto
            </button>
          </form>
        ) : (
          <p className="readOnlyNotice">
            Somente Owners podem administrar a lista local do beta fechado.
          </p>
        )}

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

        <div className="betaList" aria-label="Participantes piloto">
          {overview.participants.map((participant) => (
            <article key={participant.id}>
              <div>
                <strong>{participant.name}</strong>
                <small>{participant.email}</small>
              </div>
              {canManage ? (
                <select
                  aria-label={"Status de " + participant.name}
                  onChange={(event) =>
                    updateStatus(
                      participant.id,
                      event.target.value as DemoBetaParticipantStatus,
                    )
                  }
                  value={participant.status}
                >
                  <option value="INVITED">INVITED</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              ) : (
                <span className={"betaStatus beta" + participant.status}>
                  {participant.status}
                </span>
              )}
            </article>
          ))}
          {overview.participants.length === 0 ? (
            <p className="emptyAdminState">
              Nenhum participante-piloto nesta lista local.
            </p>
          ) : null}
        </div>

        <p className="profileLimit">
          Nenhum convite é enviado e esta lista não concede acesso externo. Ela
          existe apenas para organizar o reteste da demonstração.
        </p>
      </section>
    </main>
  );
}
