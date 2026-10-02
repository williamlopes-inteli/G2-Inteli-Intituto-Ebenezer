import { db, IndicatorRecord, IndicatorStatus } from '../../infra/database/client';

export class IndicatorsService {
  /**
   * Retorna indicadores públicos agregados (RF-009).
   * Sem dados pessoais de beneficiários/crianças, com fontes validadas e evidências protegidas.
   */
  listPublicIndicators() {
    const published = db.listIndicators(true);
    return published.map((ind) => ({
      id: ind.id,
      code: ind.code,
      name: ind.name,
      category: ind.category,
      metricValue: ind.metricValue,
      metricUnit: ind.metricUnit,
      period: ind.period,
      sourceDescription: ind.sourceDescription,
      version: ind.version,
      publishedAt: ind.publishedAt,
    }));
  }

  /**
   * Lista todos os indicadores para gestão no Cofre de Números (RF-010).
   */
  listAllIndicators() {
    const list = db.listIndicators(false);
    return list.map((ind) => {
      const creator = Array.from(db.users.values()).find((u) => u.id === ind.createdByUserId);
      const approver = ind.approvedByUserId
        ? Array.from(db.users.values()).find((u) => u.id === ind.approvedByUserId)
        : null;

      return {
        ...ind,
        creatorEmail: creator?.email || 'Desconhecido',
        approverEmail: approver?.email || null,
      };
    });
  }

  /**
   * Elabora novo indicador no Cofre de Números (Elaborador / Maker).
   */
  createIndicator(
    data: {
      code: string;
      name: string;
      category: string;
      metricValue: number;
      metricUnit: string;
      period: string;
      sourceDescription: string;
      privateEvidenceNotes?: string;
    },
    userId: string,
    ipAddress: string = '127.0.0.1'
  ): IndicatorRecord {
    const existing = Array.from(db.indicators.values()).find(
      (i) => i.code.toLowerCase() === data.code.toLowerCase()
    );
    if (existing) {
      throw new Error(`Já existe um indicador com o código ${data.code}.`);
    }

    const indicator = db.createIndicator({
      ...data,
      status: 'PENDING_APPROVAL', // Entra em fila de validação
      createdByUserId: userId,
      publishedAt: null,
      approvedByUserId: null,
      rejectionReason: null,
    });

    db.recordAuditEvent({
      userId,
      action: 'CREATE_INDICATOR_VAULT',
      entityName: 'indicators',
      entityId: indicator.id,
      changesDiff: { code: indicator.code, metricValue: indicator.metricValue },
      ipAddress,
      userAgent: 'Backoffice',
    });

    return indicator;
  }

  /**
   * Aprovação e Publicação com regra estrita Maker-Checker (RF-010 / DECISÃO-07).
   * O usuário que elaborou a versão NUNCA pode aprovar a si mesmo.
   */
  approveAndPublishIndicator(id: string, approverUserId: string, ipAddress: string = '127.0.0.1'): IndicatorRecord {
    const ind = db.findIndicatorById(id);
    if (!ind) {
      throw new Error(`Indicador ${id} não encontrado.`);
    }

    // Regra Maker-Checker não negociável do PRD:
    if (ind.createdByUserId === approverUserId) {
      throw new Error('Violação de Maker-Checker: O usuário que elaborou o indicador não pode aprovar a sua própria versão.');
    }

    const updated = db.updateIndicator(id, {
      status: 'PUBLISHED',
      approvedByUserId: approverUserId,
      publishedAt: new Date(),
      rejectionReason: null,
    });

    db.recordAuditEvent({
      userId: approverUserId,
      action: 'MAKER_CHECKER_APPROVE_INDICATOR',
      entityName: 'indicators',
      entityId: id,
      changesDiff: { status: 'PUBLISHED', approvedBy: approverUserId },
      ipAddress,
      userAgent: 'Backoffice',
    });

    return updated;
  }

  /**
   * Rejeição com justificativa obrigatória pelo Aprovador.
   */
  rejectIndicator(id: string, approverUserId: string, reason: string, ipAddress: string = '127.0.0.1'): IndicatorRecord {
    if (!reason || reason.trim().length < 5) {
      throw new Error('Justificativa obrigatória para rejeição de indicador.');
    }

    const ind = db.findIndicatorById(id);
    if (!ind) {
      throw new Error(`Indicador ${id} não encontrado.`);
    }

    if (ind.createdByUserId === approverUserId) {
      throw new Error('Violação de Maker-Checker: Ação editorial deve ser executada por um aprovador distinto.');
    }

    const updated = db.updateIndicator(id, {
      status: 'REJECTED',
      approvedByUserId: approverUserId,
      rejectionReason: reason,
    });

    db.recordAuditEvent({
      userId: approverUserId,
      action: 'MAKER_CHECKER_REJECT_INDICATOR',
      entityName: 'indicators',
      entityId: id,
      changesDiff: { status: 'REJECTED', reason },
      ipAddress,
      userAgent: 'Backoffice',
    });

    return updated;
  }
}

export const indicatorsService = new IndicatorsService();
