import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { donorAuthService } from './donor-auth.service';
import { donorPortalService } from './donor-portal.service';

function extractDonorIdFromAuth(request: FastifyRequest): string {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Autenticação necessária: cabeçalho de autorização não fornecido.');
  }

  const token = authHeader.replace('Bearer ', '').trim();
  // Formato: donor_session_<donorId>_<timestamp>
  if (!token.startsWith('donor_session_')) {
    throw new Error('Token de sessão do doador inválido.');
  }

  const parts = token.split('_');
  if (parts.length < 4) {
    throw new Error('Estrutura de token do doador inválida.');
  }

  const donorId = parts[2];
  return donorId;
}

export async function donorPortalController(app: FastifyInstance) {
  // 1. Solicitar OTP
  app.post('/api/v1/donor/auth/request-otp', async (req: FastifyRequest, reply: FastifyReply) => {
    const schema = z.object({
      email: z.string().email('E-mail inválido'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.format() });
    }

    const res = donorAuthService.requestOtp(parsed.data.email);
    return reply.status(200).send(res);
  });

  // 2. Validar OTP e obter sessão
  app.post('/api/v1/donor/auth/verify-otp', async (req: FastifyRequest, reply: FastifyReply) => {
    const schema = z.object({
      email: z.string().email(),
      otpCode: z.string().min(4).max(10),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.format() });
    }

    try {
      const res = donorAuthService.verifyOtp(parsed.data.email, parsed.data.otpCode);
      return reply.status(200).send(res);
    } catch (err: any) {
      return reply.status(401).send({ error: err.message });
    }
  });

  // 3. Obter dados completos do portal do doador
  app.get('/api/v1/donor/portal', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const donorId = extractDonorIdFromAuth(req);
      const data = donorPortalService.getDonorPortalData(donorId);
      return reply.status(200).send(data);
    } catch (err: any) {
      return reply.status(401).send({ error: err.message });
    }
  });

  // 4. Cancelar assinatura recorrente
  app.post('/api/v1/donor/subscriptions/:id/cancel', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const donorId = extractDonorIdFromAuth(req);
      const subscriptionId = req.params.id;
      const ip = (req.headers['x-forwarded-for'] as string) || req.ip;

      const res = donorPortalService.cancelSubscription(donorId, subscriptionId, ip);
      return reply.status(200).send(res);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // 5. Atualizar consentimento de marketing (LGPD)
  app.post('/api/v1/donor/lgpd/marketing-consent', async (req: FastifyRequest, reply: FastifyReply) => {
    const schema = z.object({
      optIn: z.boolean(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos' });
    }

    try {
      const donorId = extractDonorIdFromAuth(req);
      const ip = (req.headers['x-forwarded-for'] as string) || req.ip;

      const res = donorPortalService.updateMarketingOptIn(donorId, parsed.data.optIn, ip);
      return reply.status(200).send(res);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // 6. Solicitar Anonimização de Dados (LGPD)
  app.post('/api/v1/donor/lgpd/request-anonymization', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const donorId = extractDonorIdFromAuth(req);
      const ip = (req.headers['x-forwarded-for'] as string) || req.ip;

      const res = donorPortalService.requestAnonymization(donorId, ip);
      return reply.status(200).send(res);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
