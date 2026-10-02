import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/infra/database/client.js';
import { ReconciliationService } from '../../src/modules/reconciliation/reconciliation.service.js';
import { ExceptionsHandler } from '../../src/modules/reconciliation/exceptions-handler.js';
import { AuditService } from '../../src/modules/backoffice/audit.service.js';

describe('Reconciliation & Audit Trail Integration Tests', () => {
  beforeEach(() => {
    db.reset();
  });

  it('deve registrar conciliação manual com justificativa e persistir na trilha imutável de auditoria', () => {
    // 1. Cria um item órfão na caixa de exceções
    const orphanItem = ExceptionsHandler.handleOrphanPix('PIX_ORPHAN_TEST_123', 250.0);
    expect(orphanItem.status).toBe('UNMATCHED');

    // 2. Operador financeiro concilia o item com justificativa formal
    const resolved = ReconciliationService.resolveException({
      itemId: orphanItem.id,
      targetStatus: 'SETTLED',
      justification: 'Identificado doador via comprovante manual enviado por WhatsApp para a campanha de Páscoa.',
      userId: 'user_fin_01',
    });

    expect(resolved.status).toBe('SETTLED');
    expect(resolved.resolutionNotes).toContain('WhatsApp');

    // 3. Verifica se a trilha de auditoria contém a ação registrada
    const auditLogs = AuditService.listLogs();
    const event = auditLogs.find((l) => l.action === 'CONCILIATION_RESOLVE');

    expect(event).toBeDefined();
    expect(event?.entityId).toBe(orphanItem.id);
    expect(event?.changesDiff?.justification).toContain('WhatsApp');
  });

  it('deve rejeitar conciliação manual sem justificativa detalhada (mínimo 10 caracteres)', () => {
    const orphanItem = ExceptionsHandler.handleOrphanPix('PIX_ORPHAN_TEST_456', 50.0);

    expect(() => {
      ReconciliationService.resolveException({
        itemId: orphanItem.id,
        targetStatus: 'SETTLED',
        justification: 'ok',
        userId: 'user_fin_01',
      });
    }).toThrow('Justificativa obrigatória com no mínimo 10 caracteres');
  });
});
