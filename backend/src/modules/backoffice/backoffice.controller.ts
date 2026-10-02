import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { AuthService } from './auth.service.js';
import { DashboardService } from './dashboard.service.js';
import { ReconciliationService } from '../reconciliation/reconciliation.service.js';
import { AuditService } from './audit.service.js';
import { rbacGuard } from '../../infra/http/middlewares/rbac-guard.js';
import { db } from '../../infra/database/client.js';

export const backofficeRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  // POST /api/v1/admin/auth/login
  server.post('/api/v1/admin/auth/login', async (request, reply) => {
    const { email, password, mfaCode } = request.body as any;
    const result = AuthService.login({ email, password, mfaCode });
    return reply.status(200).send(result);
  });

  // GET /api/v1/admin/dashboard/summary
  server.get(
    '/api/v1/admin/dashboard/summary',
    { preHandler: [rbacGuard(['ADMIN', 'FINANCE', 'COMMUNICATION', 'APPROVER', 'AUDITOR_READONLY'])] },
    async () => {
      return DashboardService.getSummary();
    }
  );

  // GET /api/v1/admin/crm/dashboard (Ebenézer Recorrente - Painel de Métricas e Gráficos)
  server.get(
    '/api/v1/admin/crm/dashboard',
    { preHandler: [rbacGuard(['ADMIN', 'FINANCE', 'COMMUNICATION', 'APPROVER', 'AUDITOR_READONLY'])] },
    async () => {
      return {
        month: 'Setembro de 2026',
        availableMonths: ['Setembro de 2026', 'Agosto de 2026', 'Julho de 2026', 'Junho de 2026'],
        metrics: {
          monthlyRevenue: 4280.0,
          targetRevenue: 5000.0,
          progressPercent: 85.6,
          recurringPercentage: 31,
          recurringGrowthPercent: 5,
          identifiedDonorsCount: 87,
          retentionRatePercent: 78,
        },
        chartData: [
          { month: 'Abr', recorrente: 800, pontual: 1800, total: 2600 },
          { month: 'Mai', recorrente: 950, pontual: 2100, total: 3050 },
          { month: 'Jun', recorrente: 1100, pontual: 2400, total: 3500 },
          { month: 'Jul', recorrente: 1250, pontual: 2200, total: 3450 },
          { month: 'Ago', recorrente: 1300, pontual: 2600, total: 3900 },
          { month: 'Set', recorrente: 1326, pontual: 2954, total: 4280 },
        ],
        attentionItems: [
          { id: '1', type: 'INVITE_READY', count: 12, label: '12 doadores prontos para convite mensal', actionTab: 'donors', filter: 'ready' },
          { id: '2', type: 'FAILED_RECURRING', count: 3, label: '3 recorrências falharam este mês', actionTab: 'reconciliation', filter: 'divergent' },
          { id: '3', type: 'EXPIRED_VAULT', count: 2, label: '2 números do cofre vencidos', actionTab: 'vault', filter: 'expired' },
        ],
      };
    }
  );

  // GET /api/v1/admin/donors (Lista de Doadores CRM com Filtros)
  server.get(
    '/api/v1/admin/donors',
    { preHandler: [rbacGuard(['ADMIN', 'COMMUNICATION', 'FINANCE', 'AUDITOR_READONLY'])] },
    async () => {
      const donors = db.listCrmDonors();
      return {
        total: 87, // Protótipo completo com base de 87 doadores
        donors,
      };
    }
  );

  // GET /api/v1/admin/donors/:id (Detalhes do Doador, Linha do Tempo e Base Legal LGPD)
  server.get(
    '/api/v1/admin/donors/:id',
    { preHandler: [rbacGuard(['ADMIN', 'COMMUNICATION', 'FINANCE', 'AUDITOR_READONLY'])] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const detail = db.getDonorDetail(id);
        return reply.status(200).send(detail);
      } catch (err: any) {
        return reply.status(404).send({ error: err.message || 'Doador não encontrado' });
      }
    }
  );

  // POST /api/v1/admin/donors/:id/invite (Disparar convite de recorrência via Régua de Relacionamento)
  server.post(
    '/api/v1/admin/donors/:id/invite',
    { preHandler: [rbacGuard(['ADMIN', 'COMMUNICATION'])] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const ip = (request.headers['x-forwarded-for'] as string) || request.ip;
      try {
        const result = db.inviteDonorToRecurring(id, ip);
        return reply.status(200).send(result);
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    }
  );

  // GET /api/v1/admin/donors/:id/invite-preview (Visualizar modelo de e-mail renderizado no Design System)
  server.get(
    '/api/v1/admin/donors/:id/invite-preview',
    { preHandler: [rbacGuard(['ADMIN', 'COMMUNICATION', 'FINANCE', 'AUDITOR_READONLY'])] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const preview = db.getInviteEmailPreview(id);
        return reply.status(200).send(preview);
      } catch (err: any) {
        return reply.status(404).send({ error: err.message || 'Doador não encontrado' });
      }
    }
  );

  // DELETE /api/v1/admin/donors/:id (Eliminação de Dados Pessoais - Art. 18 LGPD)
  server.delete(
    '/api/v1/admin/donors/:id',
    { preHandler: [rbacGuard(['ADMIN'])] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const ip = (request.headers['x-forwarded-for'] as string) || request.ip;
      try {
        const result = db.deleteDonorData(id, ip);
        return reply.status(200).send(result);
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    }
  );

  // GET /api/v1/admin/exceptions
  server.get(
    '/api/v1/admin/exceptions',
    { preHandler: [rbacGuard(['ADMIN', 'FINANCE'])] },
    async () => {
      return ReconciliationService.listExceptions();
    }
  );

  // POST /api/v1/admin/reconciliation/:itemId/resolve
  server.post(
    '/api/v1/admin/reconciliation/:itemId/resolve',
    { preHandler: [rbacGuard(['ADMIN', 'FINANCE'])] },
    async (request, reply) => {
      const { itemId } = request.params as { itemId: string };
      const { targetStatus, justification } = request.body as any;
      const user = (request as any).user;

      const item = ReconciliationService.resolveException({
        itemId,
        targetStatus,
        justification,
        userId: user.userId,
        ipAddress: request.ip,
      });

      return reply.status(200).send(item);
    }
  );

  // GET /api/v1/admin/audit-logs
  server.get(
    '/api/v1/admin/audit-logs',
    { preHandler: [rbacGuard(['ADMIN', 'AUDITOR_READONLY', 'FINANCE'])] },
    async () => {
      return AuditService.listLogs();
    }
  );

  // GET /api/v1/admin/reports/export (RF-005: Exportação Protegida com Auditoria)
  server.get(
    '/api/v1/admin/reports/export',
    { preHandler: [rbacGuard(['ADMIN', 'FINANCE', 'AUDITOR_READONLY'])] },
    async (request, reply) => {
      const user = (request as any).user;
      const ip = (request.headers['x-forwarded-for'] as string) || request.ip;

      const summary = DashboardService.getSummary();

      // Registro imutável da ação de exportação na trilha de auditoria
      AuditService.record({
        userId: user.userId,
        action: 'EXPORT_FINANCIAL_REPORT',
        entityName: 'financial_reports',
        entityId: `EXPORT-${Date.now()}`,
        changesDiff: {
          exportedRows: summary.recentDonations.length,
          totalPaid: summary.totalPaidAmount,
          totalSettled: summary.totalSettledAmount,
        },
        ipAddress: ip,
        userAgent: (request.headers['user-agent'] as string) || 'Backoffice',
      });

      // Gera linhas CSV formatadas
      const headers = ['Data', 'Doador', 'Campanha', 'Metodo', 'Valor Bruto', 'Taxa', 'Valor Liquido', 'Status'];
      const rows = summary.recentDonations.map((d: any) => [
        new Date(d.createdAt).toISOString(),
        `"${d.donorName}"`,
        `"${d.campaignId}"`,
        d.paymentMethod || 'PIX',
        d.amount.toFixed(2),
        (d.amount * 0.01).toFixed(2), // Exemplo taxa estimada
        (d.amount * 0.99).toFixed(2),
        d.status,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');

      reply.header('Content-Type', 'text/csv; charset=utf-8');
      reply.header('Content-Disposition', `attachment; filename="relatorio-financeiro-ebenezer-${new Date().toISOString().split('T')[0]}.csv"`);
      return reply.send(csvContent);
    }
  );
};


