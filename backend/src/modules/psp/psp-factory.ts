import { PspGatewayAdapter } from './psp-adapter.interface.js';
import { MockPspAdapter } from './adapters/mock-psp.adapter.js';
import { AsaasPspAdapter } from './adapters/asaas-psp.adapter.js';
import { env } from '../../config/env.js';

export class PspFactory {
  private static adapters: Map<string, PspGatewayAdapter> = new Map<string, PspGatewayAdapter>([
    ['mock', new MockPspAdapter()],
    ['asaas', new AsaasPspAdapter()],
  ]);

  static getAdapter(name?: string): PspGatewayAdapter {
    const pspName = name || env.PSP_ACTIVE_GATEWAY;
    const adapter = this.adapters.get(pspName.toLowerCase());
    if (!adapter) {
      throw new Error(`Adaptador de PSP '${pspName}' não encontrado ou não configurado.`);
    }
    return adapter;
  }

  static registerAdapter(adapter: PspGatewayAdapter) {
    this.adapters.set(adapter.pspName.toLowerCase(), adapter);
  }
}
