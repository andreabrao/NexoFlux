import type { Metadata } from "next";
import Link from "next/link";

const plans = [
  {
    detail: "Para validar uma operação inicial e acompanhar o consumo local.",
    executions: "500 execuções por ciclo",
    name: "Starter",
    price: "R$ 49/mês",
    retention: "30 dias de histórico",
  },
  {
    detail:
      "Para equipes que precisam simular rotinas recorrentes com mais volume.",
    executions: "3.000 execuções por ciclo",
    name: "Pro",
    price: "R$ 129/mês",
    retention: "90 dias de histórico",
  },
  {
    detail:
      "Para operações com múltiplos workspaces e maior capacidade de teste.",
    executions: "20.000 execuções por ciclo",
    name: "Agência",
    price: "R$ 299/mês",
    retention: "180 dias de histórico",
  },
];

export const metadata: Metadata = {
  description: "Planos e limites demonstrativos da NexoFlux.",
  title: "Planos | NexoFlux",
};

export default function PlansPage() {
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
          <Link className="navLink" href="/funcionalidades">
            Funcionalidades
          </Link>
          <Link className="navLink" href="/entrar">
            Entrar
          </Link>
        </div>
      </nav>

      <section className="publicHero">
        <p className="eyebrow">Planos demonstrativos</p>
        <h1>Escolha a capacidade que deseja validar.</h1>
        <p>
          Estes valores e limites são uma hipótese navegável da NexoFlux. A
          cobrança é simulada no navegador e não gera contratação ou pagamento.
        </p>
      </section>

      <section className="publicPlanGrid" aria-label="Planos NexoFlux">
        {plans.map((plan) => (
          <article key={plan.name}>
            <p>{plan.name}</p>
            <h2>{plan.price}</h2>
            <span>{plan.detail}</span>
            <ul>
              <li>{plan.executions}</li>
              <li>{plan.retention}</li>
              <li>Troca local pelo Owner</li>
            </ul>
            <Link className="primaryButton" href="/entrar">
              Testar no simulador
            </Link>
          </article>
        ))}
      </section>

      <section className="publicNote">
        <strong>Transparência da demonstração</strong>
        <p>
          A NexoFlux ainda não processa pagamentos, não armazena cartões e não
          mantém assinaturas em um servidor nesta versão publicada.
        </p>
      </section>
    </main>
  );
}
