import { DonationIntentStatus } from '../../infra/database/client.js';

export class InvalidFinancialTransitionError extends Error {
  constructor(public readonly from: DonationIntentStatus, public readonly to: DonationIntentStatus, message?: string) {
    super(message || `Transição financeira proibida: não é permitido transitar de '${from}' para '${to}'.`);
    this.name = 'InvalidFinancialTransitionError';
  }
}

export class FinancialStateMachine {
  /**
   * Valida se uma transição de estado da Intenção de Doação é válida.
   * Respeita o Princípio I da Constituição:
   * - Transições são estritamente unidirecionais
   * - Proibido downgrade de PAID para EXPIRED
   * - Pagamento após EXPIRED transita para LATE_PAYMENT_REVIEW
   * - Eventos repetidos quando já está PAID são idempotentes (permanecem PAID)
   */
  static transition(
    currentStatus: DonationIntentStatus,
    targetEvent: 'CHARGE_CREATED' | 'PAYMENT_RECEIVED' | 'TIME_EXPIRED' | 'USER_CANCELLED' | 'FINANCE_APPROVE'
  ): DonationIntentStatus {
    switch (currentStatus) {
      case 'CREATED':
        if (targetEvent === 'CHARGE_CREATED') return 'AWAITING_PAYMENT';
        if (targetEvent === 'USER_CANCELLED') return 'CANCELLED';
        break;

      case 'AWAITING_PAYMENT':
        if (targetEvent === 'PAYMENT_RECEIVED') return 'PAID';
        if (targetEvent === 'TIME_EXPIRED') return 'EXPIRED';
        if (targetEvent === 'USER_CANCELLED') return 'CANCELLED';
        break;

      case 'EXPIRED':
        // Regra não-negociável: pagamento recebido após expiração NUNCA descarta o dinheiro
        if (targetEvent === 'PAYMENT_RECEIVED') return 'LATE_PAYMENT_REVIEW';
        if (targetEvent === 'TIME_EXPIRED') return 'EXPIRED'; // idempotente
        break;

      case 'LATE_PAYMENT_REVIEW':
        if (targetEvent === 'FINANCE_APPROVE') return 'PAID';
        if (targetEvent === 'PAYMENT_RECEIVED') return 'LATE_PAYMENT_REVIEW'; // idempotente
        break;

      case 'PAID':
        // Idempotência: reenvio de confirmação de pagamento não altera o estado já pago
        if (targetEvent === 'PAYMENT_RECEIVED') return 'PAID';
        // Proibição expressa de downgrade para expirado por evento tardio fora de ordem
        if (targetEvent === 'TIME_EXPIRED') return 'PAID';
        break;

      case 'CANCELLED':
        // Se cancelado pelo usuário mas o pagamento compensou, entra em revisão
        if (targetEvent === 'PAYMENT_RECEIVED') return 'LATE_PAYMENT_REVIEW';
        break;
    }

    throw new InvalidFinancialTransitionError(
      currentStatus,
      targetEvent as any,
      `Evento '${targetEvent}' é inválido para o estado atual '${currentStatus}'.`
    );
  }
}
