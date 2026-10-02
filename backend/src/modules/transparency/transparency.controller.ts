import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { indicatorsService } from './indicators.service';
import { rbacGuard } from '../../infra/http/middlewares/rbac-guard';

export const transparencyRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  // 1. Rota pública de indicadores agregados (RF-009)
  server.get('/api/v1/transparency/indicators', async () => {
    return indicatorsService.listPublicIndicators();
  });

  // 2. Rota administrativa para listar todos os indicadores do cofre (RF-010)
  server.get(
    '/api/v1/admin/indicators',
    { preHandler: [rbacGuard(['ADMIN', 'APPROVER', 'COMMUNICATION', 'AUDITOR_READONLY'])] },
    async () => {
      return indicatorsService.listAllIndicators();
    }
  );

  // 3. Elaboração de novo indicador (Maker)
  server.post(
    '/api/v1/admin/indicators',
    { preHandler: [rbacGuard(['ADMIN', 'COMMUNICATION'])] },
    async (request, reply) => {
      const schema = z.object({
        code: z.string().min(3),
        name: z.string().min(5),
        category: z.string().min(3),
        metricValue: z.number().positive(),
        metricUnit: z.string().min(1),
        period: z.string().min(3),
        sourceDescription: z.string().min(5),
        privateEvidenceNotes: z.string().optional(),
      });

      const parsed = schema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.format() });
      }

      const user = (request as any).user;
      const ip = (request.headers['x-forwarded-for'] as string) || request.ip;

      try {
        const result = indicatorsService.createIndicator(parsed.data, user.userId, ip);
        return reply.status(201).send(result);
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    }
  );

  // 4. Aprovação e Publicação Maker-Checker (Checker)
  server.post(
    '/api/v1/admin/indicators/:id/approve',
    { preHandler: [rbacGuard(['ADMIN', 'APPROVER'])] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = (request as any).user;
      const ip = (request.headers['x-forwarded-for'] as string) || request.ip;

      try {
        const result = indicatorsService.approveAndPublishIndicator(id, user.userId, ip);
        return reply.status(200).send(result);
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    }
  );

  // 5. Rejeição com justificativa
  server.post(
    '/api/v1/admin/indicators/:id/reject',
    { preHandler: [rbacGuard(['ADMIN', 'APPROVER'])] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { reason } = request.body as { reason: string };
      const user = (request as any).user;
      const ip = (request.headers['x-forwarded-for'] as string) || request.ip;

      try {
        const result = indicatorsService.rejectIndicator(id, user.userId, reason, ip);
        return reply.status(200).send(result);
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    }
  );
};
