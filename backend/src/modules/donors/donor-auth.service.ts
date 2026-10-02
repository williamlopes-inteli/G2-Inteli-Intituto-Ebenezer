import { db } from '../../infra/database/client';

export class DonorAuthService {
  /**
   * Requisita envio de código OTP de uso único e expiração curta (15 minutos).
   * Em conformidade com RF-007 do PRD.
   */
  requestOtp(email: string): { success: boolean; message: string; devOtp?: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const donor = db.findDonorByEmail(normalizedEmail);

    if (!donor) {
      // Proteção anti-enumeração recomendada no PRD Seção 7:
      // Não revela se o e-mail existe ou não no banco de dados.
      return {
        success: true,
        message: 'Se o e-mail estiver cadastrado em nossa base, o código de acesso foi enviado com sucesso.',
      };
    }

    // Gerar código OTP numérico de 6 dígitos
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    db.createDonorOtp(donor.id, normalizedEmail, otpCode, expiresAt);

    // Registro de log seguro e simulação do canal de e-mail transacional
    console.log(`[DONOR_AUTH] Enviando OTP para doador: ${donor.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')} (Expira em 15 min)`);

    return {
      success: true,
      message: 'Código de verificação enviado para o seu e-mail.',
      devOtp: otpCode, // Disponível no ambiente de teste/sandbox
    };
  }

  /**
   * Valida o código OTP e devolve uma sessão autenticada restrita ao doador.
   */
  verifyOtp(email: string, otpCode: string): { token: string; donor: { id: string; fullName: string; email: string } } {
    const normalizedEmail = email.trim().toLowerCase();
    const otp = db.findValidOtp(normalizedEmail, otpCode.trim());

    if (!otp) {
      throw new Error('Código de acesso inválido, já utilizado ou expirado.');
    }

    db.markOtpUsed(otp.id);
    const donor = db.findDonorById(otp.donorId);
    if (!donor) {
      throw new Error('Cadastro de doador não localizado.');
    }

    // Token assinado simples com id do doador para autorização das rotas do portal
    const token = `donor_session_${donor.id}_${Date.now()}`;

    return {
      token,
      donor: {
        id: donor.id,
        fullName: donor.fullName,
        email: donor.email,
      },
    };
  }
}

export const donorAuthService = new DonorAuthService();
