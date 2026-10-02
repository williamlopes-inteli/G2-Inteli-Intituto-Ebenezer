export interface Campaign {
  id: string;
  name: string;
  description: string;
  suggestedAmounts: number[];
  imageUrl?: string;
}

export class CampaignsService {
  private static campaigns: Campaign[] = [
    {
      id: 'acolhimento-infantil',
      name: 'Acolhimento e Educação Infantil',
      description: 'Garante alimentação equilibrada, material pedagógico e acolhimento diário para crianças em vulnerabilidade.',
      suggestedAmounts: [25, 50, 100, 200],
    },
    {
      id: 'alimentacao-comunitaria',
      name: 'Segurança Alimentar e Refeições',
      description: 'Distribuição de cestas de alimentos e preparação de refeições comunitárias para famílias assistidas.',
      suggestedAmounts: [30, 60, 120, 250],
    },
    {
      id: 'capacitacao-jovens',
      name: 'Oficinas e Capacitação de Jovens',
      description: 'Cursos profissionalizantes e apoio educacional para inserção no mercado de trabalho.',
      suggestedAmounts: [50, 100, 150, 300],
    },
  ];

  static listActiveCampaigns(): Campaign[] {
    return this.campaigns;
  }

  static findById(id: string): Campaign | undefined {
    return this.campaigns.find((c) => c.id === id);
  }
}
