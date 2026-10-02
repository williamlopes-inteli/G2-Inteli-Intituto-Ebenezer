import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/infra/database/client.js';
import { AuthService } from '../../src/modules/backoffice/auth.service.js';

describe('AuthService & RBAC Tests', () => {
  beforeEach(() => {
    db.reset();
  });

  it('deve realizar login administrativo com sucesso e validar MFA', () => {
    const result = AuthService.login({
      email: 'financeiro@ebenezer.org.br',
      password: 'fin123',
      mfaCode: '123456',
    });

    expect(result.token).toBeDefined();
    expect(result.user.role).toBe('FINANCE');

    const decoded = AuthService.verifyToken(result.token);
    expect(decoded.role).toBe('FINANCE');
    expect(decoded.email).toBe('financeiro@ebenezer.org.br');
  });

  it('deve rejeitar login com código MFA inválido', () => {
    expect(() => {
      AuthService.login({
        email: 'financeiro@ebenezer.org.br',
        password: 'fin123',
        mfaCode: '999999',
      });
    }).toThrow('Código de autenticação de dois fatores (MFA) inválido.');
  });

  it('deve rejeitar login com senha incorreta', () => {
    expect(() => {
      AuthService.login({
        email: 'financeiro@ebenezer.org.br',
        password: 'senha_errada',
        mfaCode: '123456',
      });
    }).toThrow('Credenciais inválidas.');
  });
});
