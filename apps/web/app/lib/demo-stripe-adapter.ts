import type {
  DemoBillingCycle,
  DemoBillingStatus,
  DemoPlan,
} from "./demo-repository";

export type DemoStripeWebhookKind =
  "PAYMENT_FAILED" | "PAYMENT_SUCCEEDED" | "SUBSCRIPTION_CANCELED";

export type DemoStripeWebhook = {
  id: string;
  status: DemoBillingStatus;
  type: string;
};

/**
 * Fronteira deliberadamente local do M6. Não usa SDK, chave, cartão, endpoint
 * ou webhook do Stripe; somente devolve um evento sintético e rastreável.
 */
export function createMockStripeWebhook(input: {
  billingCycle: DemoBillingCycle;
  plan: DemoPlan;
  subscriptionId: string;
  type: DemoStripeWebhookKind;
}): DemoStripeWebhook {
  const suffix = input.subscriptionId.slice(0, 8);

  if (input.type === "PAYMENT_FAILED") {
    return {
      id: "evt_mock_payment_failed_" + suffix,
      status: "PAST_DUE",
      type: "invoice.payment_failed",
    };
  }
  if (input.type === "SUBSCRIPTION_CANCELED") {
    return {
      id: "evt_mock_subscription_canceled_" + suffix,
      status: "CANCELED",
      type: "customer.subscription.deleted",
    };
  }

  return {
    id: "evt_mock_invoice_paid_" + suffix,
    status: "ACTIVE",
    type:
      input.billingCycle === "ANNUAL"
        ? "invoice.paid.annual"
        : "invoice.paid.monthly",
  };
}
