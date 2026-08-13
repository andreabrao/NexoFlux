const modules = [
  "Autenticação e workspaces",
  "Contas X por OAuth",
  "Fila idempotente",
  "Consumo e auditoria",
];

export default function Home() {
  return (
    <main>
      <nav className="navigation" aria-label="Navegação principal">
        <a className="brand" href="#top" aria-label="NexoFlux - início">
          <span className="brandMark" aria-hidden="true">
            N
          </span>
          <span>NexoFlux</span>
        </a>
        <span className="environment">Ambiente de desenvolvimento</span>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow">Fundação técnica do MVP</div>
        <h1>Automatize sua operação no X sem perder o controle.</h1>
        <p>
          Conecte contas autorizadas, agende tarefas e acompanhe cada execução
          com limites claros, segurança e rastreabilidade.
        </p>
        <div className="actions">
          <a className="primaryAction" href="#foundation">
            Ver fundação
          </a>
          <span>Somente capacidades permitidas pela API oficial.</span>
        </div>
      </section>

      <section className="foundation" id="foundation">
        <div>
          <div className="eyebrow">Baseline em construção</div>
          <h2>Serviços mínimos preparados para evoluir com segurança.</h2>
        </div>
        <ul>
          {modules.map((module, index) => (
            <li key={module}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {module}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
