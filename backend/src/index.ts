import { buildServer } from './infra/http/server.js';
import { env } from './config/env.js';

async function main() {
  const server = buildServer();

  try {
    const address = await server.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });
    console.log(`[EBENEZER_SERVER] Servidor ativo em ${address}`);
    console.log(`[EBENEZER_SERVER] Modo: ${env.NODE_ENV} | Gateway ativo: ${env.PSP_ACTIVE_GATEWAY}`);
  } catch (err) {
    console.error('[EBENEZER_SERVER] Erro fatal ao iniciar:', err);
    process.exit(1);
  }
}

main();
