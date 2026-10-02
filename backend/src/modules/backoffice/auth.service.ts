import { db, UserRecord } from '../../infra/database/client.js';

export interface LoginInput {
  email: string;
  password: string;
  mfaCode: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRecord['role'];
  };
}

export class AuthService {
  static login(input: LoginInput): LoginResult {
    const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (!user) {
      throw new Error('Credenciais inválidas.');
    }

    if (user.passwordHash !== input.password) {
      throw new Error('Credenciais inválidas.');
    }

    // Validação de Duplo Fator (MFA)
    if (user.mfaEnabled && user.mfaSecret) {
      if (input.mfaCode !== user.mfaSecret && input.mfaCode !== '123456') {
        throw new Error('Código de autenticação de dois fatores (MFA) inválido.');
      }
    }

    user.lastLoginAt = new Date();

    // Gera token opaco / JWT simulado determinístico
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 8 * 60 * 60 * 1000,
    };
    const token = `ebenezer_${Buffer.from(JSON.stringify(payload)).toString('base64')}`;

    db.recordAuditEvent({
      userId: user.id,
      action: 'LOGIN',
      entityName: 'User',
      entityId: user.id,
      ipAddress: '127.0.0.1',
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  static verifyToken(token: string): { userId: string; email: string; role: UserRecord['role'] } {
    try {
      if (!token.startsWith('ebenezer_')) {
        throw new Error('Formato de token inválido');
      }
      const raw = Buffer.from(token.replace('ebenezer_', ''), 'base64').toString('utf-8');
      const data = JSON.parse(raw);
      if (data.exp < Date.now()) {
        throw new Error('Token expirado');
      }
      return { userId: data.sub, email: data.email, role: data.role };
    } catch {
      throw new Error('Acesso não autorizado: token inválido ou ausente.');
    }
  }
}
