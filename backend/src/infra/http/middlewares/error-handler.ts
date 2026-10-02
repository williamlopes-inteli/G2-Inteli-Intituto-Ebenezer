import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { InvalidFinancialTransitionError } from '../../../domain/state-machine/financial-state-machine.js';

/**
 * Sanitiza objetos para logs removendo ou mascarando dados sensíveis (LGPD e Segredos)
 */
export function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const clone = Array.isArray(data) ? [...data] : { ...data };

  for (const key of Object.keys(clone)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('cpf') || lowerKey.includes('taxid')) {
      clone[key] = '***.***.***-**';
    } else if (
      lowerKey.includes('password') ||
      lowerKey.includes('token') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('authorization') ||
      lowerKey.includes('signature')
    ) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object') {
      clone[key] = sanitizeLogData(clone[key]);
    }
  }

  return clone;
}

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  // Mascara dados do payload na saída de erro
  const safeBody = sanitizeLogData(request.body);
  const safeParams = sanitizeLogData(request.params);

  // 1. Erros de validação do Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      code: 'VALIDATION_ERROR',
      message: 'Dados de requisição inválidos.',
      details: error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // 2. Erros de transição de estado financeiro
  if (error instanceof InvalidFinancialTransitionError) {
    return reply.status(409).send({
      code: 'INVALID_FINANCIAL_TRANSITION',
      message: error.message,
      from: error.from,
      to: error.to,
    });
  }

  // 3. Erro interno não tratado
  const statusCode = error.statusCode || 500;
  console.error('[HTTP_ERROR]', {
    statusCode,
    name: error.name,
    message: error.message,
    url: request.url,
    method: request.method,
    body: safeBody,
    params: safeParams,
  });

  return reply.status(statusCode).send({
    code: 'INTERNAL_SERVER_ERROR',
    message: statusCode === 500 ? 'Ocorreu um erro interno. Tente novamente mais tarde.' : error.message,
  });
}
