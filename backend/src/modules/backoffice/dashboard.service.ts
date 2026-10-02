import { db } from '../../infra/database/client.js';

export interface FinancialDashboardSummary {
  totalIntentsCount: number;
  totalIntentsAmount: number;
  totalPaidCount: number;
  totalPaidAmount: number;
  totalSettledAmount: number;
  totalPendingExceptionsCount: number;
  activeSubscriptionsCount: number;
  monthlyRecurringVolume: number;
  methodsBreakdown: {
    pixCount: number;
    pixAmount: number;
    cardCount: number;
    cardAmount: number;
  };
  recentDonations: Array<{
    id: string;
    donorName: string;
    amount: number;
    paymentMethod: string;
    frequency: string;
    status: string;
    campaignId: string;
    createdAt: string;
  }>;
}

export class DashboardService {
  static getSummary(): FinancialDashboardSummary {
    const intents = Array.from(db.donationIntents.values());
    const transactions = Array.from(db.paymentTransactions.values());
    const reconItems = Array.from(db.reconciliationItems.values());
    const subscriptions = Array.from(db.recurringSubscriptions.values());

    const totalIntentsCount = intents.length;
    const totalIntentsAmount = intents.reduce((acc, curr) => acc + curr.amount, 0);

    const paidTransactions = transactions.filter((t) => t.transactionType === 'PAYMENT');
    const totalPaidCount = paidTransactions.length;
    const totalPaidAmount = paidTransactions.reduce((acc, curr) => acc + curr.amountPaid, 0);

    const settledItems = reconItems.filter((r) => r.status === 'SETTLED');
    const totalSettledAmount = settledItems.reduce((acc, curr) => acc + curr.actualAmount, 0);

    const pendingExceptions = reconItems.filter(
      (r) => r.status === 'UNDER_REVIEW' || r.status === 'DIVERGENT' || r.status === 'UNMATCHED'
    );

    // Métricas de Recorrência (Fase 2)
    const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
    const activeSubscriptionsCount = activeSubs.length;
    const monthlyRecurringVolume = activeSubs.reduce((acc, curr) => acc + curr.amount, 0);

    // Divisão por método de pagamento
    const pixTxs = paidTransactions.filter((t) => t.paymentMethod === 'PIX');
    const cardTxs = paidTransactions.filter((t) => t.paymentMethod === 'CREDIT_CARD');

    // Mapeia doações recentes
    const recent = intents
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map((i) => {
        const donor = db.findDonorById(i.donorId);
        return {
          id: i.id,
          donorName: donor ? donor.fullName : 'Anônimo',
          amount: i.amount,
          paymentMethod: i.paymentMethod,
          frequency: i.frequency,
          status: i.status,
          campaignId: i.campaignId,
          createdAt: i.createdAt.toISOString(),
        };
      });

    return {
      totalIntentsCount,
      totalIntentsAmount,
      totalPaidCount,
      totalPaidAmount,
      totalSettledAmount,
      totalPendingExceptionsCount: pendingExceptions.length,
      activeSubscriptionsCount,
      monthlyRecurringVolume,
      methodsBreakdown: {
        pixCount: pixTxs.length,
        pixAmount: pixTxs.reduce((acc, curr) => acc + curr.amountPaid, 0),
        cardCount: cardTxs.length,
        cardAmount: cardTxs.reduce((acc, curr) => acc + curr.amountPaid, 0),
      },
      recentDonations: recent,
    };
  }
}
