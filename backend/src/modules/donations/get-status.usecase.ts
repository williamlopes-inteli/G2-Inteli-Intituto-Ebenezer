import { db } from '../../infra/database/client.js';
import { FinancialStateMachine } from '../../domain/state-machine/financial-state-machine.js';

export interface DonationStatusResult {
  intentId: string;
  status: string;
  amount: number;
  paidAt?: string | null;
  receiptSent: boolean;
}

export class GetDonationStatusUseCase {
  async execute(intentId: string): Promise<DonationStatusResult> {
    const intent = db.findDonationIntentById(intentId);
    if (!intent) {
      throw new Error(`Intenção de doação '${intentId}' não encontrada.`);
    }

    // Se estiver aguardando pagamento mas o tempo limite já passou:
    if (intent.status === 'AWAITING_PAYMENT' && new Date() > intent.expiresAt) {
      const updatedStatus = FinancialStateMachine.transition(intent.status, 'TIME_EXPIRED');
      db.updateDonationIntentStatus(intent.id, updatedStatus);
      intent.status = updatedStatus;
    }

    // Busca transação se houver
    const transaction = Array.from(db.paymentTransactions.values()).find(
      (t) => t.donationIntentId === intent.id && t.transactionType === 'PAYMENT'
    );

    return {
      intentId: intent.id,
      status: intent.status,
      amount: intent.amount,
      paidAt: transaction ? transaction.paidAt.toISOString() : null,
      receiptSent: intent.status === 'PAID',
    };
  }
}
