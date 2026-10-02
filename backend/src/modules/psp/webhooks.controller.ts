import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { WebhookIngestionService } from './webhook-ingestion.service.js';

export const webhooksRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  // POST /api/v1/webhooks/psp/:pspName
  server.post('/api/v1/webhooks/psp/:pspName', async (request, reply) => {
    const { pspName } = request.params as { pspName: string };
    const headers = request.headers as Record<string, any>;
    const rawBody = request.body;

    try {
      const result = await WebhookIngestionService.ingestWebhook(pspName, headers, rawBody);
      return reply.status(200).send(result);
    } catch (err: any) {
      if (err.message?.includes('UNAUTHORIZED_WEBHOOK_SIGNATURE')) {
        return reply.status(401).send({
          code: 'UNAUTHORIZED_WEBHOOK_SIGNATURE',
          message: err.message,
        });
      }
      return reply.status(500).send({
        code: 'WEBHOOK_INGESTION_ERROR',
        message: 'Erro interno ao processar notificação do PSP. O parceiro deve retentar.',
      });
    }
  });
};
