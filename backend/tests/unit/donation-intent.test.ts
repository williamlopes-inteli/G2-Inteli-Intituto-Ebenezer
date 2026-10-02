import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/infra/database/client.js';
import { FinancialStateMachine, InvalidFinancialTransitionError } from '../../src/domain/state-machine/financial-state-machine.js';

describe('FinancialStateMachine & Donation Intent Unit Tests', () => {
  beforeEach(() => {
    db.reset();
  });

  it('deve realizar a transição normal de CREATED -> AWAITING_PAYMENT -> PAID', () => {
    let status = FinancialStateMachine.transition('CREATED', 'CHARGE_CREATED');
    expect(status).toBe('AWAITING_PAYMENT');

    status = FinancialStateMachine.transition(status, 'PAYMENT_RECEIVED');
    expect(status).toBe('PAID');
  });

  it('deve ser estritamente idempotente quando já estiver PAID e receber novo evento de pagamento', () => {
    const status = FinancialStateMachine.transition('PAID', 'PAYMENT_RECEIVED');
    expect(status).toBe('PAID');
  });

  it('NUNCA deve permitir downgrade de PAID para EXPIRED por evento atrasado fora de ordem', () => {
    const status = FinancialStateMachine.transition('PAID', 'TIME_EXPIRED');
    expect(status).toBe('PAID'); // Permanece PAID, não expira
  });

  it('NUNCA deve descartar dinheiro recebido após expiração: transita para LATE_PAYMENT_REVIEW', () => {
    const status = FinancialStateMachine.transition('EXPIRED', 'PAYMENT_RECEIVED');
    expect(status).toBe('LATE_PAYMENT_REVIEW');
  });

  it('deve permitir aprovação pelo financeiro de LATE_PAYMENT_REVIEW -> PAID', () => {
    const status = FinancialStateMachine.transition('LATE_PAYMENT_REVIEW', 'FINANCE_APPROVE');
    expect(status).toBe('PAID');
  });

  it('deve lançar InvalidFinancialTransitionError em transições proibidas', () => {
    expect(() => {
      FinancialStateMachine.transition('CREATED', 'PAYMENT_RECEIVED');
    }).toThrow(InvalidFinancialTransitionError);
  });

  it('deve salvar doador respeitando o princípio da minimização da LGPD com CPF opcional', () => {
    const donorWithoutCpf = db.createDonor({
      fullName: 'Doador Anônimo Benfeitor',
      email: 'benfeitor@exemplo.com',
      marketingOptIn: false,
    });

    expect(donorWithoutCpf.id).toBeDefined();
    expect(donorWithoutCpf.taxIdCpf).toBeUndefined();
    expect(donorWithoutCpf.marketingOptIn).toBe(false);

    const donorWithCpf = db.createDonor({
      fullName: 'Doador Com Recibo',
      email: 'recibo@exemplo.com',
      taxIdCpf: '123.456.789-00',
      marketingOptIn: true,
    });

    expect(donorWithCpf.taxIdCpf).toBe('123.456.789-00');
    expect(donorWithCpf.marketingOptIn).toBe(true);
  });
});
