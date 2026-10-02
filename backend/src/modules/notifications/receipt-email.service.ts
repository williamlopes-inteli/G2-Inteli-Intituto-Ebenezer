export interface SendReceiptInput {
  intentId: string;
  donorEmail: string;
  donorName: string;
  amount: number;
  paidAt: Date;
  transactionId: string;
}

export class ReceiptEmailService {
  private static sentReceipts = new Set<string>(); // Rastreio de chave única (idempotência)

  /**
   * Envia o comprovante transacional de agradecimento com garantia de envio único.
   * Não dispara múltiplos e-mails mesmo se o webhook for reenviado.
   */
  static async sendDonationReceipt(input: SendReceiptInput): Promise<{ sent: boolean; reason?: string }> {
    const idempotencyKey = `RECEIPT_${input.intentId}_${input.transactionId}`;

    if (this.sentReceipts.has(idempotencyKey)) {
      return { sent: false, reason: 'Comprovante já despachado anteriormente (idempotente)' };
    }

    // Simulação do envio de e-mail seguro via SMTP/Resend
    console.log(`[EMAIL_TRANSACTIONAL] Enviando recibo para ${input.donorEmail} - Valor: R$ ${input.amount.toFixed(2)}`);

    this.sentReceipts.add(idempotencyKey);
    return { sent: true };
  }

  static isReceiptSent(intentId: string): boolean {
    return Array.from(this.sentReceipts).some((key) => key.startsWith(`RECEIPT_${intentId}_`));
  }

  static reset() {
    this.sentReceipts.clear();
  }
}
