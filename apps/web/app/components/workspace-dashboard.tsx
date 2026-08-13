"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import type { WorkspaceRole } from "@nexoflux/contracts";

import {
  createDemoRepository,
  type DemoSession,
  type DemoUserProfile,
  type DemoWorkspaceMember,
  type DemoWorkspaceSummary,
  DemoRepositoryError,
} from "../lib/demo-repository";
import { clearDemoSession, readDemoSession } from "../lib/demo-session";

const roles: WorkspaceRole[] = ["OWNER", "ADMIN", "OPERATOR", "VIEWER"];

type DashboardData = {
  members: DemoWorkspaceMember[];
  selectedWorkspaceId: string;
  user: DemoUserProfile;
  workspaces: DemoWorkspaceSummary[];
};

function messageFrom(reason: unknown): string {
  return reason instanceof DemoRepositoryError
    ? reason.message
    : "Não foi possível concluir esta ação no simulador.";
}

export function WorkspaceDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<WorkspaceRole>("VIEWER");

  const refreshDashboard = (
    activeSession: DemoSession,
    preferredWorkspaceId?: string,
  ): void => {
    const repository = createDemoRepository(window.localStorage);
    const user = repository.getUser(activeSession.userId);
    const workspaces = repository.listWorkspaces(activeSession.userId);
    const selectedWorkspace =
      workspaces.find((workspace) => workspace.id === preferredWorkspaceId) ??
      workspaces[0];

    if (!selectedWorkspace) {
      throw new DemoRepositoryError(
        "Sua conta local ainda não possui um workspace.",
      );
    }

    setDashboard({
      members: repository.listMembers(
        selectedWorkspace.id,
        activeSession.userId,
      ),
      selectedWorkspaceId: selectedWorkspace.id,
      user,
      workspaces,
    });
  };

  useEffect(() => {
    try {
      const activeSession = readDemoSession(window.sessionStorage);
      if (!activeSession) {
        return;
      }

      setSession(activeSession);
      refreshDashboard(activeSession);
    } catch (reason) {
      clearDemoSession(window.sessionStorage);
      setError(messageFrom(reason));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDashboard = (
    action: (activeSession: DemoSession, workspaceId: string) => void,
    successMessage: string,
  ): void => {
    if (!session || !dashboard) {
      return;
    }

    setError("");
    setNotice("");
    setIsBusy(true);

    try {
      action(session, dashboard.selectedWorkspaceId);
      refreshDashboard(session, dashboard.selectedWorkspaceId);
      setNotice(successMessage);
    } catch (reason) {
      setError(messageFrom(reason));
    } finally {
      setIsBusy(false);
    }
  };

  const selectWorkspace = (workspaceId: string): void => {
    if (!session) {
      return;
    }

    setError("");
    setNotice("");
    try {
      refreshDashboard(session, workspaceId);
    } catch (reason) {
      setError(messageFrom(reason));
    }
  };

  const createWorkspace = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!session || !workspaceName.trim()) {
      return;
    }

    setError("");
    setNotice("");
    setIsBusy(true);
    try {
      const workspace = createDemoRepository(
        window.localStorage,
      ).createWorkspace(session.userId, workspaceName);
      setWorkspaceName("");
      refreshDashboard(session, workspace.id);
      setNotice("Novo workspace criado como Owner.");
    } catch (reason) {
      setError(messageFrom(reason));
    } finally {
      setIsBusy(false);
    }
  };

  const addMember = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!memberEmail.trim()) {
      return;
    }

    updateDashboard((activeSession, selectedWorkspaceId) => {
      createDemoRepository(window.localStorage).addMember(
        activeSession.userId,
        {
          email: memberEmail,
          role: memberRole,
          workspaceId: selectedWorkspaceId,
        },
      );
      setMemberEmail("");
      setMemberRole("VIEWER");
    }, "Pessoa adicionada ao workspace.");
  };

  const changeMemberRole = (
    targetUserId: string,
    role: WorkspaceRole,
  ): void => {
    updateDashboard((activeSession, selectedWorkspaceId) => {
      createDemoRepository(window.localStorage).updateMemberRole(
        activeSession.userId,
        selectedWorkspaceId,
        targetUserId,
        role,
      );
    }, "Função atualizada.");
  };

  const removeMember = (targetUserId: string, memberName: string): void => {
    if (!window.confirm("Remover " + memberName + " deste workspace?")) {
      return;
    }

    updateDashboard((activeSession, selectedWorkspaceId) => {
      createDemoRepository(window.localStorage).removeMember(
        activeSession.userId,
        selectedWorkspaceId,
        targetUserId,
      );
    }, "Pessoa removida do workspace.");
  };

  const logout = (): void => {
    clearDemoSession(window.sessionStorage);
    router.push("/entrar");
  };

  const resetSimulation = (): void => {
    if (
      !window.confirm(
        "Restaurar as contas e workspaces iniciais deste navegador?",
      )
    ) {
      return;
    }

    createDemoRepository(window.localStorage).reset();
    clearDemoSession(window.sessionStorage);
    router.push("/entrar");
  };

  if (isLoading) {
    return (
      <main className="appLoading">
        <span className="loadingMark" aria-hidden="true">
          N
        </span>
        <p>Preparando o workspace simulado…</p>
      </main>
    );
  }

  if (!session || !dashboard) {
    return (
      <main className="accessRequired">
        <Link className="brand" href="/">
          <span className="brandMark" aria-hidden="true">
            N
          </span>
          <span>NexoFlux</span>
        </Link>
        <div>
          <p className="eyebrow">Área autenticada</p>
          <h1>Escolha uma conta para continuar.</h1>
          <p>
            A sessão desta simulação é mantida apenas na aba atual do navegador.
          </p>
          {error ? (
            <p className="formError" role="alert">
              {error}
            </p>
          ) : null}
          <Link className="primaryButton" href="/entrar">
            Entrar no simulador
          </Link>
        </div>
      </main>
    );
  }

  const selectedWorkspace = dashboard.workspaces.find(
    (workspace) => workspace.id === dashboard.selectedWorkspaceId,
  );
  if (!selectedWorkspace) {
    return null;
  }

  const canInvite =
    selectedWorkspace.role === "OWNER" || selectedWorkspace.role === "ADMIN";
  const canChangeRoles = selectedWorkspace.role === "OWNER";

  return (
    <main className="appShell">
      <aside className="appSidebar">
        <Link className="brand" href="/">
          <span className="brandMark" aria-hidden="true">
            N
          </span>
          <span>NexoFlux</span>
        </Link>

        <div className="workspaceNavigation">
          <div className="sidebarLabelRow">
            <p className="sectionLabel">Seus workspaces</p>
            <span>{dashboard.workspaces.length}</span>
          </div>
          <div className="workspaceList" role="list">
            {dashboard.workspaces.map((workspace) => (
              <button
                aria-current={
                  workspace.id === selectedWorkspace.id ? "page" : undefined
                }
                className={
                  workspace.id === selectedWorkspace.id
                    ? "workspaceOption workspaceOptionActive"
                    : "workspaceOption"
                }
                key={workspace.id}
                onClick={() => selectWorkspace(workspace.id)}
                type="button"
              >
                <span>{workspace.name.slice(0, 1).toUpperCase()}</span>
                <strong>{workspace.name}</strong>
                <small>{workspace.role}</small>
              </button>
            ))}
          </div>
        </div>

        <form className="newWorkspaceForm" onSubmit={createWorkspace}>
          <label htmlFor="new-workspace">Novo workspace</label>
          <div>
            <input
              id="new-workspace"
              minLength={2}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="Nome da operação"
              required
              value={workspaceName}
            />
            <button
              aria-label="Criar workspace"
              disabled={isBusy}
              title="Criar workspace"
              type="submit"
            >
              +
            </button>
          </div>
        </form>

        <div className="sidebarFooter">
          <div className="profileSummary">
            <span>{dashboard.user.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{dashboard.user.name}</strong>
              <small>{dashboard.user.email}</small>
            </div>
          </div>
          <button className="textButton" onClick={logout} type="button">
            Sair
          </button>
        </div>
      </aside>

      <section className="workspaceMain">
        <header className="workspaceHeader">
          <div>
            <p className="eyebrow">Workspace atual</p>
            <h1>{selectedWorkspace.name}</h1>
            <p>{selectedWorkspace.slug}</p>
          </div>
          <div className="headerRole">
            <span>Sua função</span>
            <strong className={"roleBadge role" + selectedWorkspace.role}>
              {selectedWorkspace.role}
            </strong>
          </div>
        </header>

        <section className="simulationBanner">
          <span aria-hidden="true">✦</span>
          <div>
            <strong>Ambiente de simulação</strong>
            <p>
              As ações abaixo existem somente neste navegador. As regras de
              permissão reproduzem a API do projeto.
            </p>
          </div>
          <button onClick={resetSimulation} type="button">
            Restaurar dados
          </button>
        </section>

        {error ? (
          <p className="formError pageMessage" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="successMessage pageMessage" role="status">
            {notice}
          </p>
        ) : null}

        <div className="workspaceStats">
          <article>
            <span>Participantes</span>
            <strong>{dashboard.members.length}</strong>
            <p>em {selectedWorkspace.name}</p>
          </article>
          <article>
            <span>Seu nível</span>
            <strong>{selectedWorkspace.role}</strong>
            <p>controle definido pelo workspace</p>
          </article>
          <article>
            <span>Dados</span>
            <strong>Local</strong>
            <p>sem banco de dados ou servidor</p>
          </article>
        </div>

        <section className="memberArea">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">Controle de acesso</p>
              <h2>Pessoas do workspace</h2>
              <p>
                Owner e Admin podem incluir membros; somente Owner altera
                funções.
              </p>
            </div>
          </div>

          {canInvite ? (
            <form className="inviteForm" onSubmit={addMember}>
              <label>
                E-mail de uma conta existente
                <input
                  onChange={(event) => setMemberEmail(event.target.value)}
                  placeholder="pessoa@nexoflux.demo"
                  required
                  type="email"
                  value={memberEmail}
                />
              </label>
              <label>
                Função
                <select
                  onChange={(event) =>
                    setMemberRole(event.target.value as WorkspaceRole)
                  }
                  value={memberRole}
                >
                  {roles.map((role) => (
                    <option
                      disabled={
                        role === "OWNER" && selectedWorkspace.role !== "OWNER"
                      }
                      key={role}
                      value={role}
                    >
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <button className="primaryButton" disabled={isBusy} type="submit">
                Adicionar
              </button>
            </form>
          ) : (
            <p className="readOnlyNotice">
              Sua função permite visualizar a equipe, mas não administrar
              acessos.
            </p>
          )}

          <div className="memberTable" role="region" aria-label="Membros">
            <div className="memberTableHeading" aria-hidden="true">
              <span>Pessoa</span>
              <span>Função</span>
              <span>Ação</span>
            </div>
            {dashboard.members.map((member) => {
              const canRemove =
                canInvite &&
                !(
                  selectedWorkspace.role === "ADMIN" && member.role === "OWNER"
                );

              return (
                <article className="memberRow" key={member.userId}>
                  <div className="memberIdentity">
                    <span>{member.name.slice(0, 1).toUpperCase()}</span>
                    <div>
                      <strong>
                        {member.name}
                        {member.userId === dashboard.user.id ? " · você" : ""}
                      </strong>
                      <small>{member.email}</small>
                    </div>
                  </div>
                  <div className="memberRole">
                    {canChangeRoles ? (
                      <label className="selectLabel">
                        <span className="visuallyHidden">
                          Função de {member.name}
                        </span>
                        <select
                          disabled={isBusy}
                          onChange={(event) =>
                            changeMemberRole(
                              member.userId,
                              event.target.value as WorkspaceRole,
                            )
                          }
                          value={member.role}
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <strong className={"roleBadge role" + member.role}>
                        {member.role}
                      </strong>
                    )}
                  </div>
                  <div className="memberActions">
                    {canRemove ? (
                      <button
                        className="dangerButton"
                        disabled={isBusy}
                        onClick={() => removeMember(member.userId, member.name)}
                        type="button"
                      >
                        Remover
                      </button>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
