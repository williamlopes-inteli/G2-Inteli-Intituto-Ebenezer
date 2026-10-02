import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { errorHandler } from './middlewares/error-handler.js';
import { donationsRoutes } from '../../modules/donations/donations.controller.js';
import { webhooksRoutes } from '../../modules/psp/webhooks.controller.js';
import { backofficeRoutes } from '../../modules/backoffice/backoffice.controller.js';
import { donorPortalController } from '../../modules/donors/donor-portal.controller.js';
import { transparencyRoutes } from '../../modules/transparency/transparency.controller.js';

export function buildServer(): FastifyInstance {
  const server = fastify({
    logger: false, // Usamos logging controlado e mascarado
    disableRequestLogging: true,
  });

  server.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  server.setErrorHandler(errorHandler);

  // Registro das rotas modulares
  server.register(donationsRoutes);
  server.register(webhooksRoutes);
  server.register(backofficeRoutes);
  server.register(donorPortalController);
  server.register(transparencyRoutes);

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'healthy', timestamp: new Date().toISOString(), service: 'ebenezer-recorrente' };
  });


  return server;
}
