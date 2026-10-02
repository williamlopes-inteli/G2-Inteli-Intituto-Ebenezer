import { db, ReconciliationItemRecord, ReconciliationStatus } from '../../infra/database/client.js';

export interface ResolveExceptionInput {
  itemId: string;
  targetStatus: 'SETTLED' | 'UNDER_REVIEW';
  justification: string;
  userId: string;
  ipAddress?: string;
}

export class ReconciliationService {
  static listExceptions(): ReconciliationItemRecord[] {
    return Array.from(db.reconciliationItems.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  static resolveException(input: ResolveExceptionInput): ReconciliationItemRecord {
    if (!input.justification || input.justification.trim().length < 10) {
      throw new Error('Justificativa obrigatória com no mínimo 10 caracteres para conciliação manual.');
    }

    const item = db.resolveReconciliationItem(input.itemId, input.targetStatus, input.justification, input.userId);

    // Registra trilha de auditoria imutável (Princípio I e III)
    db.recordAuditEvent({
      userId: input.userId,
      action: 'CONCILIATION_RESOLVE',
      entityName: 'ReconciliationItem',
      entityId: item.id,
      changesDiff: {
        previousStatus: item.status,
        newStatus: input.targetStatus,
        justification: input.justification,
      },
      ipAddress: input.ipAddress || '127.0.0.1',
    });

    return item;
  }
}
