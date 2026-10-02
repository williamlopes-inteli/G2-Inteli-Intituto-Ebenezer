import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../../../modules/backoffice/auth.service.js';
import { UserRecord } from '../../database/client.js';

export function rbacGuard(allowedRoles: UserRecord['role'][]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        code: 'UNAUTHORIZED',
        message: 'Token de autorização ausente ou malformatado.',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    try {
      const user = AuthService.verifyToken(token);
      (request as any).user = user;

      if (!allowedRoles.includes(user.role)) {
        return reply.status(403).send({
          code: 'FORBIDDEN',
          message: `Acesso negado: seu perfil '${user.role}' não tem permissão para esta operação.`,
        });
      }
    } catch (err: any) {
      return reply.status(401).send({
        code: 'UNAUTHORIZED',
        message: err.message,
      });
    }
  };
}
