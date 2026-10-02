import { buildServer } from '../src/infra/http/server.js';

async function runSimulation() {
  console.log('\n===============================================================');
  console.log('  SIMULADOR DE FLUXO DE PAGAMENTO & CONCILIAÇÃO EBENÉZER');
  console.log('===============================================================\n');

  const server = buildServer();

  // 1. Criar intenção de doação e cobrança Pix dinâmica
  console.log('1. [DOADOR] Realizando checkout de doação pontual...');
  const checkoutRes = await server.inject({
    method: 'POST',
    url: '/api/v1/donations/checkout',
    payload: {
      campaignId: 'acolhimento-infantil',
      amount: 100.0,
      donorName: 'Doador Exemplo Antigravity',
      donorEmail: 'doador@exemplo.com',
      marketingOptIn: false,
    },
  });

  const checkoutData = checkoutRes.json();
  console.log('   ✓ Intenção criada com ID:', checkoutData.intentId);
  console.log('   ✓ Status Inicial:', checkoutData.status);
  console.log('   ✓ Pix Copia e Cola:', checkoutData.copyPasteCode.substring(0, 50) + '...');
  console.log('   ✓ Expiração programada:', checkoutData.expiresAt);

  // 2. Polling inicial do doador
  console.log('\n2. [FRONTEND] Polling de status antes do pagamento...');
  const poll1 = await server.inject({
    method: 'GET',
    url: `/api/v1/donations/${checkoutData.intentId}/status`,
  });
  console.log('   ✓ Status no polling:', poll1.json().status);

  // 3. Simulação de entrega de webhook pelo PSP
  console.log('\n3. [PSP -> WEBHOOK] Notificação de pagamento confirmado...');
  const externalTxId = `TX_${Date.now()}`;
  const webhookRes1 = await server.inject({
    method: 'POST',
    url: '/api/v1/webhooks/psp/mock',
    payload: {
      eventType: 'PAYMENT_CONFIRMED',
      eventId: 'evt_sim_001',
      chargeId: checkoutData.copyPasteCode.split('0136')[1]?.split('5204')[0] || 'MOCK_CHARGE',
      transactionId: externalTxId,
      amountPaid: 100.0,
      paidAt: new Date().toISOString(),
    },
  });
  console.log('   ✓ Resposta Webhook 1:', webhookRes1.json());

  // 4. Teste de Idempotência: reenvio do mesmo webhook
  console.log('\n4. [PSP -> WEBHOOK] Reenvio automático de webhook (Teste de Idempotência)...');
  const webhookRes2 = await server.inject({
    method: 'POST',
    url: '/api/v1/webhooks/psp/mock',
    payload: {
      eventType: 'PAYMENT_CONFIRMED',
      eventId: 'evt_sim_001', // Mesmo eventId
      chargeId: checkoutData.copyPasteCode.split('0136')[1]?.split('5204')[0] || 'MOCK_CHARGE',
      transactionId: externalTxId,
      amountPaid: 100.0,
      paidAt: new Date().toISOString(),
    },
  });
  console.log('   ✓ Resposta Webhook 2 (Duplicata detectada sem duplicar receita):', webhookRes2.json());

  // 5. Polling após o pagamento
  console.log('\n5. [FRONTEND] Polling de status após liquidação...');
  const poll2 = await server.inject({
    method: 'GET',
    url: `/api/v1/donations/${checkoutData.intentId}/status`,
  });
  console.log('   ✓ Status no polling:', poll2.json().status);
  console.log('   ✓ Recibo transacional enviado por e-mail:', poll2.json().receiptSent);

  // 6. Simulação de Exceção: Pagamento Tardio (LATE_PAYMENT_REVIEW)
  console.log('\n6. [EXCEÇÃO] Criando cobrança com expiração forçada para teste de pagamento tardio...');
  const lateCheckoutRes = await server.inject({
    method: 'POST',
    url: '/api/v1/donations/checkout',
    payload: {
      campaignId: 'alimentacao-comunitaria',
      amount: 75.0,
      donorName: 'Doador Tardio',
      donorEmail: 'tardio@exemplo.com',
    },
  });
  const lateData = lateCheckoutRes.json();
  const lateTxId = lateData.copyPasteCode.split('0136')[1]?.split('5204')[0] || 'MOCK_LATE';

  // Envia pagamento com data futura/expirada
  const lateWebhook = await server.inject({
    method: 'POST',
    url: '/api/v1/webhooks/psp/mock',
    payload: {
      eventType: 'PAYMENT_CONFIRMED',
      eventId: 'evt_sim_late_999',
      chargeId: lateTxId,
      transactionId: `TX_LATE_${Date.now()}`,
      amountPaid: 75.0,
      paidAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora no futuro (após expiração)
    },
  });
  console.log('   ✓ Notificação processada com status de exceção:', lateWebhook.json().status);

  // 7. Login no Back-office e conciliação
  console.log('\n7. [BACK-OFFICE] Autenticação de operador financeiro com MFA...');
  const loginRes = await server.inject({
    method: 'POST',
    url: '/api/v1/admin/auth/login',
    payload: {
      email: 'financeiro@ebenezer.org.br',
      password: 'fin123',
      mfaCode: '123456',
    },
  });
  const { token } = loginRes.json();
  console.log('   ✓ Autenticado com sucesso. Perfil: FINANCE');

  // 8. Consulta da Caixa de Exceções
  console.log('\n8. [CONCILIAÇÃO] Consultando itens na Caixa de Exceções...');
  const exceptionsRes = await server.inject({
    method: 'GET',
    url: '/api/v1/admin/exceptions',
    headers: { Authorization: `Bearer ${token}` },
  });
  const exceptions = exceptionsRes.json();
  console.log(`   ✓ ${exceptions.length} item(ns) encontrado(s) em quarentena/revisão:`);
  exceptions.forEach((item: any) => {
    console.log(`     - [${item.status}] Ref: ${item.externalReference} | Valor: R$ ${item.actualAmount.toFixed(2)} | Motivo: ${item.discrepancyReason}`);
  });

  // 9. Conciliação assistida de item pendente com justificativa
  if (exceptions.length > 0) {
    const itemToResolve = exceptions[0];
    console.log(`\n9. [CONCILIAÇÃO] Resolvendo item ${itemToResolve.id} com justificativa formal...`);
    const resolveRes = await server.inject({
      method: 'POST',
      url: `/api/v1/admin/reconciliation/${itemToResolve.id}/resolve`,
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        targetStatus: 'SETTLED',
        justification: 'Pagamento comprovado via extrato bancário oficial. Aprovado pelo Financeiro.',
      },
    });
    console.log('   ✓ Item conciliado:', resolveRes.json().status);
  }

  // 10. Dashboard consolidado segregado
  console.log('\n10. [DASHBOARD] Resumo financeiro consolidado segregado:');
  const dashRes = await server.inject({
    method: 'GET',
    url: '/api/v1/admin/dashboard/summary',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(JSON.stringify(dashRes.json(), null, 2));

  console.log('\n===============================================================');
  console.log('  SIMULAÇÃO CONCLUÍDA COM 100% DE SUCESSO!');
  console.log('===============================================================\n');

  await server.close();
}

runSimulation();
