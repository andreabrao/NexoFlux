import type { Metadata } from "next";
import Link from "next/link";

const capabilities = [
  {
    detail:
      "Crie uma conta local, um workspace e explore Owner, Admin, Operator e Viewer.",
    name: "Acesso e permissões",
  },
  {
    detail:
      "Agende tarefas, acompanhe eventos e controle o adaptador local do X.",
    name: "Operação demonstrativa",
  },
  {
    detail: "Compare planos, cotas e bloqueios de consumo por workspace.",
    name: "Planos e consumo",
  },
  {
    detail:
      "Simule eventos de cobrança e consulte auditoria no mesmo navegador.",
    name: "Cobrança e auditoria",
  },
];

export const metadata: Metadata = {
  description: "Funcionalidades demonstrativas disponíveis na NexoFlux.",
  title: "Funcionalidades | NexoFlux",
};

export default function FeaturesPage() {
  return (
    <main className="publicPage">
      <nav className="navigation" aria-label="Navegação principal">
        <Link className="brand" href="/" aria-label="NexoFlux - início">
          <span className="brandMark" aria-hidden="true">
            N
          </span>
          <span>NexoFlux</span>
        </Link>
        <div className="navActions">
          <Link className="navLink" href="/planos">
            Planos
          </Link>
          <Link className="navLink" href="/entrar">
            Entrar
          </Link>
        </div>
      </nav>

      <section className="publicHero">
        <p className="eyebrow">Funcionalidades</p>
        <h1>Uma demonstração clara do fluxo antes da infraestrutura real.</h1>
        <p>
          Explore os comportamentos do produto, com limites e estados de
          integração explicitamente identificados em cada etapa.
        </p>
      </section>

      <section className="publicCapabilityGrid" aria-label="Funcionalidades">
        {capabilities.map((capability, index) => (
          <article key={capability.name}>
            <span>0{index + 1}</span>
            <h2>{capability.name}</h2>
            <p>{capability.detail}</p>
          </article>
        ))}
      </section>

      <section className="publicNote">
        <strong>O que ainda não está conectado</strong>
        <p>
          A API oficial do X, API própria, banco de dados, fila e pagamentos
          reais continuam fora do escopo desta simulação local.
        </p>
      </section>
    </main>
  );
}
