import Link from "next/link";

const modules = [
  {
    detail: "Cadastre uma conta e tenha seu primeiro workspace como Owner.",
    name: "Identidade e workspaces",
    number: "01",
  },
  {
    detail:
      "Explore Owner, Admin, Operator e Viewer com as mesmas regras de acesso.",
    name: "Permissões por função",
    number: "02",
  },
  {
    detail: "Teste convites, mudanças de função e proteção do último Owner.",
    name: "Operação simulada",
    number: "03",
  },
];

export default function Home() {
  return (
    <main className="landingPage">
      <nav className="navigation" aria-label="Navegação principal">
        <Link className="brand" href="/" aria-label="NexoFlux - início">
          <span className="brandMark" aria-hidden="true">
            N
          </span>
          <span>NexoFlux</span>
        </Link>
        <div className="navActions">
          <span className="environment">Simulação local</span>
          <Link className="navLink" href="/funcionalidades">
            Funcionalidades
          </Link>
          <Link className="navLink" href="/planos">
            Planos
          </Link>
          <Link className="navLink" href="/entrar">
            Entrar
          </Link>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="heroContent">
          <p className="eyebrow">Marco 03 · Área autenticada</p>
          <h1>Veja a operação ganhar forma, sem depender de infraestrutura.</h1>
          <p>
            Uma demonstração navegável para explorar workspaces, pessoas e
            permissões da NexoFlux antes de conectar serviços reais.
          </p>
          <div className="actions">
            <Link className="primaryButton" href="/entrar">
              Explorar simulação
            </Link>
            <Link className="secondaryLink" href="/criar-conta">
              Criar workspace local <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="heroPreview" aria-label="Resumo da simulação">
          <div className="previewBar">
            <span>N</span>
            <strong>NexoFlux Operações</strong>
            <i />
          </div>
          <div className="previewContent">
            <p>WORKSPACE ATUAL</p>
            <h2>NexoFlux Operações</h2>
            <div className="previewPeople">
              <span>AM</span>
              <span>BL</span>
              <span>CS</span>
              <span>DA</span>
            </div>
            <div className="previewAccess">
              <span>4 participantes</span>
              <strong>OWNER</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="foundation" id="foundation">
        <div className="foundationHeading">
          <p className="eyebrow">O que está disponível</p>
          <h2>
            Uma base segura para validar o fluxo antes da integração real.
          </h2>
        </div>
        <ul>
          {modules.map((module) => (
            <li key={module.number}>
              <span>{module.number}</span>
              <div>
                <strong>{module.name}</strong>
                <p>{module.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="landingFootnote">
        <span aria-hidden="true">◇</span>
        <p>
          Dados de simulação ficam somente no navegador. A API e o banco serão
          conectados numa etapa posterior.
        </p>
      </section>
    </main>
  );
}
