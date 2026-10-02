import { db } from '../../infra/database/client.js';
import { PspFactory } from './psp-factory.js';
import { EventProcessorService } from './event-processor.service.js';

export interface WebhookIngestionResult {
  received: boolean;
  duplicate: boolean;
  eventId: string;
  status?: string;
}

export class WebhookIngestionService {
  static async ingestWebhook(
    pspName: string,
    headers: Record<string, any>,
    rawBody: any
  ): Promise<WebhookIngestionResult> {
    const adapter = PspFactory.getAdapter(pspName);

    // 1. Validação de autenticidade / assinatura digital
    const isValid = adapter.verifyWebhookSignature(headers, rawBody);
    if (!isValid) {
      throw new Error(`UNAUTHORIZED_WEBHOOK_SIGNATURE: Assinatura ou token inválido para o provedor '${pspName}'.`);
    }

    // 2. Normalização do payload do PSP
    const normalized = adapter.parseWebhookPayload(headers, rawBody);

    // 3. Persistência durável atômica ANTES do processamento de negócio
    const { event, isNew } = db.savePspEventIfNew({
      pspName: adapter.pspName,
      externalEventId: normalized.externalEventId,
      eventType: normalized.eventType,
      rawPayload: rawBody,
      headers: headers,
      processingStatus: 'PENDING',
    });

    // 4. Se for duplicata de rede, devolve sucesso imediato sem duplicar processamento contábil
    if (!isNew) {
      return {
        received: true,
        duplicate: true,
        eventId: event.externalEventId,
        status: 'DUPLICATE_ACKNOWLEDGED',
      };
    }

    // 5. Processamento assíncrono / desacoplado do evento financeiro
    try {
      const processResult = await EventProcessorService.processNormalizedEvent(normalized);
      db.updatePspEventStatus(event.id, 'PROCESSED');

      return {
        received: true,
        duplicate: false,
        eventId: event.externalEventId,
        status: processResult.status,
      };
    } catch (err: any) {
      db.updatePspEventStatus(event.id, 'FAILED');
      console.error(`[WEBHOOK_PROCESSING_FAILED] Evento ${event.id}:`, err);
      throw err;
    }
  }
}
