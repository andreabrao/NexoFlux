"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import type { WorkspaceRole } from "@nexoflux/contracts";

import {
  createDemoRepository,
  demoPlans,
  type DemoAdminOverview,
  type DemoBillingOverview,
  type DemoConsumption,
  type DemoIntegrationReadiness,
  type DemoPlan,
  type DemoSession,
  type DemoWorkspaceTask,
  type DemoUserProfile,
  type DemoWorkspaceMember,
  type DemoWorkspaceSummary,
  DemoRepositoryError,
} from "../lib/demo-repository";
import { clearDemoSession, readDemoSession } from "../lib/demo-session";

const roles: WorkspaceRole[] = ["OWNER", "ADMIN", "OPERATOR", "VIEWER"];

type DashboardData = {
  admin: DemoAdminOverview | null;
  billing: DemoBillingOverview;
  consumption: DemoConsumption;
  integration: DemoIntegrationReadiness;
  members: DemoWorkspaceMember[];
  selectedWorkspaceId: string;
  tasks: DemoWorkspaceTask[];
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
  const [taskContent, setTaskContent] = useState("");
  const [taskSchedule, setTaskSchedule] = useState("");
  const [adminSearch, setAdminSearch] = useState("");

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

    const admin = workspaces.some((workspace) => workspace.role === "OWNER")
      ? repository.getAdminOverview(activeSession.userId)
      : null;

    setDashboard({
      admin,
      billing: repository.getBilling(
        selectedWorkspace.id,
        activeSession.userId,
      ),
      consumption: repository.getConsumption(
        selectedWorkspace.id,
        activeSession.userId,
      ),
      integration: repository.getIntegrationReadiness(
        selectedWorkspace.id,
        activeSession.userId,
      ),
      members: repository.listMembers(
        selectedWorkspace.id,
        activeSession.userId,
      ),
      selectedWorkspaceId: selectedWorkspace.id,
      tasks: repository.listTasks(selectedWorkspace.id, activeSession.userId),
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

  const createTask = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!taskContent.trim() || !taskSchedule) {
      setError("Informe o conteúdo e a data da tarefa para agendar.");
      setNotice("");
      return;
    }

    updateDashboard((activeSession, selectedWorkspaceId) => {
      createDemoRepository(window.localStorage).createTask(
        activeSession.userId,
        {
          content: taskContent,
          scheduledAt: taskSchedule,
          workspaceId: selectedWorkspaceId,
        },
      );
      setTaskContent("");
      setTaskSchedule("");
    }, "Tarefa adicionada à agenda local.");
  };

  const runTask = (taskId: string): void => {
    updateDashboard((activeSession, selectedWorkspaceId) => {
      createDemoRepository(window.localStorage).runTask(
        activeSession.userId,
        selectedWorkspaceId,
        taskId,
      );
    }, "Tarefa executada pelo adaptador simulado.");
  };

  const cancelTask = (taskId: string): void => {
    if (!window.confirm("Cancelar esta tarefa agendada?")) {
      return;
    }

    updateDashboard((activeSession, selectedWorkspaceId) => {
      createDemoRepository(window.localStorage).cancelTask(
        activeSession.userId,
        selectedWorkspaceId,
        taskId,
      );
    }, "Tarefa cancelada.");
  };

  const changePlan = (plan: DemoPlan): void => {
    updateDashboard((activeSession, selectedWorkspaceId) => {
      createDemoRepository(window.localStorage).changePlan(
        activeSession.userId,
        selectedWorkspaceId,
        plan,
      );
    }, "Plano atualizado somente para esta demonstração.");
  };

  const simulateBillingWebhook = (
    kind: "PAYMENT_FAILED" | "PAYMENT_SUCCEEDED" | "SUBSCRIPTION_CANCELED",
  ): void => {
    const messages = {
      PAYMENT_FAILED: "Falha de cobrança simulada e reconciliada.",
      PAYMENT_SUCCEEDED: "Pagamento simulado e assinatura regularizada.",
      SUBSCRIPTION_CANCELED: "Cancelamento simulado e reconciliado.",
    };
    updateDashboard((activeSession, selectedWorkspaceId) => {
      createDemoRepository(window.localStorage).simulateBillingWebhook(
        activeSession.userId,
        selectedWorkspaceId,
        kind,
      );
    }, messages[kind]);
  };

  const setXMockExecutionEnabled = (enabled: boolean): void => {
    updateDashboard(
      (activeSession, selectedWorkspaceId) => {
        createDemoRepository(window.localStorage).setXMockExecutionEnabled(
          activeSession.userId,
          selectedWorkspaceId,
          enabled,
        );
      },
      enabled
        ? "Adaptador local do X reativado."
        : "Adaptador local do X desativado; execuções simuladas estão bloqueadas.",
    );
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
  const canChangePlan = selectedWorkspace.role === "OWNER";
  const canConfigureIntegrations = selectedWorkspace.role === "OWNER";
  const canOperateTasks =
    selectedWorkspace.role === "OWNER" ||
    selectedWorkspace.role === "ADMIN" ||
    selectedWorkspace.role === "OPERATOR";
  const scheduledTasks = dashboard.tasks.filter(
    (task) => task.status === "SCHEDULED",
  );
  const adminQuery = adminSearch.trim().toLocaleLowerCase("pt-BR");
  const adminWorkspaces =
    dashboard.admin?.workspaces.filter((workspace) =>
      [
        workspace.name,
        workspace.slug,
        workspace.plan,
        workspace.subscriptionStatus,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(adminQuery),
    ) ?? [];
  const adminUsers =
    dashboard.admin?.users.filter((user) =>
      [user.name, user.email]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(adminQuery),
    ) ?? [];

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
          <Link className="textButton" href="/perfil">
            Perfil
          </Link>
          <Link className="textButton" href="/configuracoes">
            Configurações
          </Link>
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
            <p>Horários e eventos usam a data e hora deste navegador.</p>
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
            <span>Agenda</span>
            <strong>{scheduledTasks.length}</strong>
            <p>tarefas aguardando execução</p>
          </article>
          <article>
            <span>Consumo do plano</span>
            <strong>
              {dashboard.consumption.used}/
              {dashboard.consumption.executionLimit}
            </strong>
            <p>
              {demoPlans[selectedWorkspace.plan].label} · execuções no ciclo
            </p>
          </article>
        </div>

        <section className="planArea">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">Marco 05 · Planos e consumo</p>
              <h2>Uso controlado por workspace</h2>
              <p>
                Cada execução concluída consome uma cota local. Ao atingir o
                limite, novas execuções são bloqueadas e os dados são
                preservados.
              </p>
            </div>
          </div>
          <div className="consumptionMeter">
            <div>
              <strong>
                {dashboard.consumption.used} de{" "}
                {dashboard.consumption.executionLimit} execuções
              </strong>
              <span>
                {dashboard.consumption.remaining} disponíveis neste ciclo
              </span>
            </div>
            <div
              aria-label={
                dashboard.consumption.percentage + "% da cota utilizada"
              }
              className="meterTrack"
              role="progressbar"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={dashboard.consumption.percentage}
            >
              <span style={{ width: dashboard.consumption.percentage + "%" }} />
            </div>
          </div>
          <div className="planGrid" role="list" aria-label="Planos simulados">
            {(Object.keys(demoPlans) as DemoPlan[]).map((plan) => {
              const definition = demoPlans[plan];
              const isActive = selectedWorkspace.plan === plan;
              return (
                <article
                  className={isActive ? "planCard planCardActive" : "planCard"}
                  key={plan}
                  role="listitem"
                >
                  <div>
                    <strong>{definition.label}</strong>
                    <span>R$ {definition.monthlyPrice}/mês</span>
                  </div>
                  <p>
                    {definition.executionLimit.toLocaleString("pt-BR")}{" "}
                    execuções/mês
                  </p>
                  <small>{definition.retentionDays} dias de logs</small>
                  {canChangePlan ? (
                    <button
                      className={
                        isActive ? "selectedPlanButton" : "secondaryButton"
                      }
                      disabled={isBusy || isActive}
                      onClick={() => changePlan(plan)}
                      type="button"
                    >
                      {isActive ? "Plano atual" : "Simular plano"}
                    </button>
                  ) : isActive ? (
                    <span className="currentPlanLabel">Plano atual</span>
                  ) : null}
                </article>
              );
            })}
          </div>
          <p className="planDisclaimer">
            Valores e limites são hipóteses do kickoff. Não há cobrança, Stripe
            ou alteração contratual nesta simulação.
          </p>
        </section>

        <section className="billingArea">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">Marco 06 · Cobrança sandbox</p>
              <h2>Assinatura e reconciliação simuladas</h2>
              <p>
                Eventos abaixo representam webhooks do Stripe em modo local.
                Nenhum cartão, chave, endpoint ou cobrança real é utilizado.
              </p>
            </div>
            <strong
              className={
                "billingStatus billing" + dashboard.billing.subscription.status
              }
            >
              {dashboard.billing.subscription.status}
            </strong>
          </div>
          <div className="billingSummary">
            <article>
              <span>Plano atual</span>
              <strong>
                {demoPlans[dashboard.billing.subscription.plan].label}
              </strong>
              <p>
                {dashboard.billing.subscription.billingCycle === "ANNUAL"
                  ? "cobrança anual simulada"
                  : "cobrança mensal simulada"}
              </p>
            </article>
            <article>
              <span>Próximo ciclo</span>
              <strong>
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "medium",
                }).format(
                  new Date(dashboard.billing.subscription.currentPeriodEnd),
                )}
              </strong>
              <p>data informativa do simulador</p>
            </article>
          </div>
          {canChangePlan ? (
            <div className="webhookActions">
              <span>Simular webhook:</span>
              <button
                className="secondaryButton"
                disabled={isBusy}
                onClick={() => simulateBillingWebhook("PAYMENT_SUCCEEDED")}
                type="button"
              >
                Pagamento aprovado
              </button>
              <button
                className="secondaryButton"
                disabled={isBusy}
                onClick={() => simulateBillingWebhook("PAYMENT_FAILED")}
                type="button"
              >
                Falha de pagamento
              </button>
              <button
                className="dangerButton"
                disabled={isBusy}
                onClick={() => simulateBillingWebhook("SUBSCRIPTION_CANCELED")}
                type="button"
              >
                Cancelar assinatura
              </button>
            </div>
          ) : (
            <p className="readOnlyNotice">
              Somente o Owner pode simular eventos de cobrança nesta
              demonstração.
            </p>
          )}
          <ol className="billingEvents" aria-label="Histórico de cobrança">
            {dashboard.billing.events.map((event) => (
              <li key={event.id}>
                <span className={"eventDot event" + event.status} />
                <div>
                  <div>
                    <strong>{event.type}</strong>
                    <time dateTime={event.createdAt}>
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(event.createdAt))}
                    </time>
                  </div>
                  <p>{event.detail}</p>
                  <small>{event.providerEventId}</small>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {dashboard.admin ? (
          <section className="adminArea">
            <div className="sectionHeading">
              <div>
                <p className="eyebrow">Marco 07 · Administração</p>
                <h2>Visão central da demonstração</h2>
                <p>
                  Consulte usuários, workspaces, planos, assinaturas e ações
                  sensíveis registradas neste navegador.
                </p>
              </div>
            </div>
            <div className="adminStats">
              <article>
                <span>Usuários locais</span>
                <strong>{dashboard.admin.totalUsers}</strong>
              </article>
              <article>
                <span>Workspaces locais</span>
                <strong>{dashboard.admin.totalWorkspaces}</strong>
              </article>
              <article>
                <span>Eventos auditados</span>
                <strong>{dashboard.admin.auditEvents.length}</strong>
              </article>
            </div>
            <label className="adminSearch">
              Pesquisar administração
              <input
                onChange={(event) => setAdminSearch(event.target.value)}
                placeholder="Nome, e-mail, workspace, plano ou status"
                type="search"
                value={adminSearch}
              />
            </label>
            <div className="adminGrid">
              <div className="adminTable">
                <h3>Workspaces e assinaturas</h3>
                {adminWorkspaces.map((workspace) => (
                  <article key={workspace.workspaceId}>
                    <div>
                      <strong>{workspace.name}</strong>
                      <small>{workspace.slug}</small>
                    </div>
                    <span>
                      {workspace.memberCount}{" "}
                      {workspace.memberCount === 1 ? "pessoa" : "pessoas"}
                    </span>
                    <span>{demoPlans[workspace.plan].label}</span>
                    <strong
                      className={
                        "billingStatus billing" + workspace.subscriptionStatus
                      }
                    >
                      {workspace.subscriptionStatus}
                    </strong>
                  </article>
                ))}
                {adminWorkspaces.length === 0 ? (
                  <p className="emptyAdminState">
                    Nenhum workspace encontrado.
                  </p>
                ) : null}
              </div>
              <div className="adminTable">
                <h3>Usuários</h3>
                {adminUsers.map((user) => (
                  <article key={user.id}>
                    <div>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                  </article>
                ))}
                {adminUsers.length === 0 ? (
                  <p className="emptyAdminState">Nenhum usuário encontrado.</p>
                ) : null}
              </div>
            </div>
            <div className="auditTrail">
              <h3>Trilha de auditoria</h3>
              <ol>
                {dashboard.admin.auditEvents.slice(0, 8).map((event) => (
                  <li key={event.id}>
                    <span className="eventDot" />
                    <div>
                      <strong>{event.action}</strong>
                      <p>{event.detail}</p>
                      <small>
                        {event.actorName} ·{" "}
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(event.createdAt))}
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <p className="planDisclaimer">
              Esta é uma visão local de administração. Não representa acesso de
              suporte, dados de clientes reais ou uma permissão global de
              produção.
            </p>
          </section>
        ) : null}

        <section className="integrationArea">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">Marco 08 · Prontidão</p>
              <h2>Integrações sob controle</h2>
              <p>
                Este painel separa o que é simulado do que continua pendente.
                Nenhuma integração externa é ativada por esta tela.
              </p>
            </div>
          </div>
          <div className="integrationGrid">
            {dashboard.integration.integrations.map((integration) => (
              <article key={integration.name}>
                <div>
                  <strong>{integration.name}</strong>
                  <span
                    className={
                      "integrationStatus integration" + integration.status
                    }
                  >
                    {integration.status}
                  </span>
                </div>
                <p>{integration.detail}</p>
              </article>
            ))}
          </div>
          {canConfigureIntegrations ? (
            <div className="integrationControl">
              <div>
                <strong>Adaptador local do X</strong>
                <p>
                  {dashboard.integration.xMockExecutionEnabled
                    ? "Ativo: tarefas continuam inteiramente no navegador."
                    : "Desativado: novas execuções simuladas são bloqueadas."}
                </p>
              </div>
              <button
                className={
                  dashboard.integration.xMockExecutionEnabled
                    ? "secondaryButton"
                    : "primaryButton"
                }
                disabled={isBusy}
                onClick={() =>
                  setXMockExecutionEnabled(
                    !dashboard.integration.xMockExecutionEnabled,
                  )
                }
                type="button"
              >
                {dashboard.integration.xMockExecutionEnabled
                  ? "Desativar simulador"
                  : "Reativar simulador"}
              </button>
            </div>
          ) : (
            <p className="readOnlyNotice">
              Somente Owners podem alterar esta configuração de demonstração.
            </p>
          )}
        </section>

        <section className="taskArea">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">Marco 04 · Operação</p>
              <h2>Agenda de tarefas permitidas</h2>
              <p>
                A execução usa um adaptador local do X. Nenhuma conta, token ou
                publicação real é utilizada nesta demonstração.
              </p>
            </div>
          </div>

          {canOperateTasks ? (
            <form className="taskForm" onSubmit={createTask}>
              <label>
                Conteúdo da tarefa
                <textarea
                  maxLength={280}
                  onChange={(event) => setTaskContent(event.target.value)}
                  placeholder="Escreva uma atualização de demonstração…"
                  required
                  value={taskContent}
                />
                <small>{taskContent.length}/280 caracteres</small>
              </label>
              <label>
                Agendar para
                <input
                  onChange={(event) => setTaskSchedule(event.target.value)}
                  required
                  type="datetime-local"
                  value={taskSchedule}
                />
              </label>
              <button className="primaryButton" disabled={isBusy} type="submit">
                Agendar tarefa
              </button>
            </form>
          ) : (
            <p className="readOnlyNotice">
              Sua função pode acompanhar a agenda e os logs, mas não criar,
              executar ou cancelar tarefas.
            </p>
          )}

          <div className="taskList" role="list" aria-label="Tarefas da agenda">
            {dashboard.tasks.map((task) => {
              const canActOnTask =
                canOperateTasks && task.status === "SCHEDULED";
              return (
                <article className="taskCard" key={task.id}>
                  <div className="taskCardHeader">
                    <strong className={"taskStatus status" + task.status}>
                      {task.status}
                    </strong>
                    <time dateTime={task.scheduledAt}>
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(task.scheduledAt))}
                    </time>
                  </div>
                  <p>{task.content}</p>
                  <div className="taskMeta">
                    <span>Criada por {task.createdByName}</span>
                    <span>{task.events.length} eventos no log</span>
                  </div>
                  <ol className="taskEvents">
                    {task.events.map((taskEvent) => (
                      <li key={taskEvent.id}>
                        <span className={"eventDot event" + taskEvent.status} />
                        <div>
                          <strong>{taskEvent.status}</strong>
                          <p>{taskEvent.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {canActOnTask ? (
                    <div className="taskActions">
                      <button
                        className="secondaryButton"
                        disabled={isBusy}
                        onClick={() => runTask(task.id)}
                        type="button"
                      >
                        Executar simulação
                      </button>
                      <button
                        className="dangerButton"
                        disabled={isBusy}
                        onClick={() => cancelTask(task.id)}
                        type="button"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

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
