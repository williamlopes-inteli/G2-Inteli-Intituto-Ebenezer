import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { CampaignsService } from './campaigns-service.js';
import { CreateDonationCheckoutUseCase } from './create-checkout.usecase.js';
import { GetDonationStatusUseCase } from './get-status.usecase.js';
import { db } from '../../infra/database/client.js';

export const donationsRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  const createCheckoutUseCase = new CreateDonationCheckoutUseCase();
  const getStatusUseCase = new GetDonationStatusUseCase();

  // GET /api/v1/campaigns
  server.get('/api/v1/campaigns', async () => {
    return CampaignsService.listActiveCampaigns();
  });

  // POST /api/v1/donations/checkout (Suporta Pix e Cartão de Crédito, Pontual e Recorrente)
  server.post('/api/v1/donations/checkout', async (request, reply) => {
    const result = await createCheckoutUseCase.execute(request.body);
    return reply.status(201).send(result);
  });

  // GET /api/v1/donations/:intentId/status
  server.get('/api/v1/donations/:intentId/status', async (request, reply) => {
    const { intentId } = request.params as { intentId: string };
    const result = await getStatusUseCase.execute(intentId);
    return reply.status(200).send(result);
  });

  // GET /api/v1/subscriptions/:id (Área do doador - Recorrência)
  server.get('/api/v1/subscriptions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const sub = db.findSubscriptionById(id);
    if (!sub) {
      return reply.status(404).send({ message: 'Assinatura recorrente não encontrada.' });
    }
    return reply.status(200).send(sub);
  });

  // POST /api/v1/subscriptions/:id/cancel (Cancelamento voluntário pelo doador)
  server.post('/api/v1/subscriptions/:id/cancel', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const sub = db.cancelSubscription(id);
      return reply.status(200).send({
        message: 'Assinatura cancelada com sucesso.',
        subscription: sub,
      });
    } catch (err: any) {
      return reply.status(404).send({ message: err.message });
    }
  });
};
