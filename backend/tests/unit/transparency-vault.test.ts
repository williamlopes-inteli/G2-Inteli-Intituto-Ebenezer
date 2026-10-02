import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/infra/database/client';
import { indicatorsService } from '../../src/modules/transparency/indicators.service';

describe('Cofre de Números & Maker-Checker Tests (RF-009, RF-010, DECISÃO-07)', () => {
  beforeEach(() => {
    db.reset();
  });

  it('deve listar apenas indicadores publicados na rota pública sem vazar evidências privadas de beneficiários', () => {
    const publicIndicators = indicatorsService.listPublicIndicators();
    expect(publicIndicators.length).toBeGreaterThanOrEqual(1);

    for (const ind of publicIndicators) {
      // Evidências privadas e dados internos NÃO devem ser expostos publicamente
      expect((ind as any).privateEvidenceNotes).toBeUndefined();
      expect((ind as any).createdByUserId).toBeUndefined();
      expect(ind.metricValue).toBeGreaterThan(0);
      expect(ind.period).toBeDefined();
      expect(ind.sourceDescription).toBeDefined();
    }
  });

  it('deve impedir estritamente que o elaborador (Maker) aprove o seu próprio indicador (Violação de Maker-Checker)', () => {
    const makerUser = Array.from(db.users.values()).find((u) => u.role === 'COMMUNICATION')!;
    expect(makerUser).toBeDefined();

    // 1. Maker cria um novo indicador
    const indicator = indicatorsService.createIndicator(
      {
        code: 'IND-TEST-OFICINAS',
        name: 'Oficinas Profissionalizantes de Marcenaria',
        category: 'Capacitação Profissional',
        metricValue: 45,
        metricUnit: 'jovens capacitados',
        period: '3º Trimestre 2026',
        sourceDescription: 'Relatório pedagógico e livro de presenças com termos de consentimento.',
        privateEvidenceNotes: 'Fichas individuais protegidas e relatórios com fotos internas.',
      },
      makerUser.id
    );

    expect(indicator.status).toBe('PENDING_APPROVAL');

    // 2. Maker tenta aprovar a si mesmo (Violação do RF-010 / DECISÃO-07)
    expect(() => {
      indicatorsService.approveAndPublishIndicator(indicator.id, makerUser.id);
    }).toThrow(/Violação de Maker-Checker: O usuário que elaborou o indicador não pode aprovar a sua própria versão/i);

    // O indicador continua não publicado
    const checkedInd = db.findIndicatorById(indicator.id);
    expect(checkedInd?.status).toBe('PENDING_APPROVAL');
  });

  it('deve permitir que um usuário aprovador distinto valide e publique o indicador com trilha de auditoria', () => {
    const makerUser = Array.from(db.users.values()).find((u) => u.role === 'COMMUNICATION')!;
    const approverUser = Array.from(db.users.values()).find((u) => u.role === 'APPROVER')!;

    expect(makerUser.id).not.toBe(approverUser.id);

    // 1. Maker cria indicador
    const indicator = indicatorsService.createIndicator(
      {
        code: 'IND-CESTAS-NATAL',
        name: 'Distribuição Especial de Cestas de Fim de Ano',
        category: 'Segurança Alimentar',
        metricValue: 500,
        metricUnit: 'famílias',
        period: 'Dezembro 2026',
        sourceDescription: 'Notas fiscais de compras e recibos de entrega aos chefes de família.',
      },
      makerUser.id
    );

    // 2. Aprovador distinto aprova
    const published = indicatorsService.approveAndPublishIndicator(indicator.id, approverUser.id);
    expect(published.status).toBe('PUBLISHED');
    expect(published.approvedByUserId).toBe(approverUser.id);
    expect(published.publishedAt).toBeDefined();

    // 3. Verifica auditoria imutável
    const audit = db.auditEvents.find((a) => a.action === 'MAKER_CHECKER_APPROVE_INDICATOR');
    expect(audit).toBeDefined();
    expect(audit?.userId).toBe(approverUser.id);

    // 4. Indicador passa a aparecer na lista pública de transparência
    const publicList = indicatorsService.listPublicIndicators();
    const found = publicList.find((i) => i.code === 'IND-CESTAS-NATAL');
    expect(found).toBeDefined();
  });
});
