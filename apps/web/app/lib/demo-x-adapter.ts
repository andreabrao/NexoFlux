export type DemoXExecution = {
  message: string;
  providerEventId: string;
};

export type DemoXTask = {
  content: string;
  id: string;
};

/**
 * Limite intencional do M4: este adaptador não acessa a API do X, não inicia
 * OAuth e não armazena tokens. Ele apenas representa a fronteira que será
 * substituída pelo provedor real quando as permissões forem aprovadas.
 */
export function executeMockXTask(task: DemoXTask): DemoXExecution {
  return {
    message:
      "Publicação simulada pelo adaptador X. Nenhuma chamada externa foi realizada.",
    providerEventId: "mock-x-" + task.id.slice(0, 8),
  };
}
