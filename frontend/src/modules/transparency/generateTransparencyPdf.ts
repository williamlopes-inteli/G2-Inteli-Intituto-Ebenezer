import { jsPDF } from 'jspdf';

export interface IndicatorData {
  id: string;
  code: string;
  name: string;
  category: string;
  metricValue: number;
  metricUnit: string;
  period: string;
  sourceDescription: string;
  version: number;
  publishedAt: string;
}

export function generateTransparencyPdf(indicators: IndicatorData[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const primaryDark = [16, 22, 37]; // #101625
  const primaryGreen = [0, 100, 0]; // #006400
  const accentLight = [239, 243, 248]; // #EFF3F8
  const textDark = [30, 41, 59]; // slate-800
  const textMuted = [100, 116, 139]; // slate-500
  const borderGray = [226, 232, 240]; // slate-200

  const drawHeader = () => {
    // Faixa superior escura
    doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.rect(margin, y, contentWidth, 24, 'F');

    // Faixa verde de destaque na borda esquerda do cabeçalho
    doc.setFillColor(0, 251, 0); // #00FB00
    doc.rect(margin, y, 3, 24, 'F');

    // Título institucional
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('INSTITUTO DE CULTURA E LAZER EBENÉZER', margin + 6, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('RELATÓRIO OFICIAL DE TRANSPARÊNCIA PÚBLICA & PRESTAÇÃO DE CONTAS', margin + 6, y + 14);

    const now = new Date();
    const emissionDate = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const emissionTime = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.setFontSize(7.5);
    doc.text(`Emissão: ${emissionDate} às ${emissionTime} | Protocolo: EBZ-${now.getTime().toString().slice(-8)}`, margin + 6, y + 19);

    y += 28;
  };

  const drawFooter = () => {
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(
        'Instituto Social Ebenézer • Documento público auditado para doadores e sociedade civil • LGPD Art. 14 / ECA',
        margin,
        pageHeight - 8
      );
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  // Inicializa o primeiro cabeçalho
  drawHeader();

  // 1. Box de Compromisso Legal & LGPD (Art. 14 / ECA)
  doc.setFillColor(accentLight[0], accentLight[1], accentLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('PROTEÇÃO INTEGRAL DE MENORES & PRIVACIDADE (LGPD ART. 14 & ECA)', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const lgpdText =
    'Em estrita conformidade com a Constituição do Instituto e o Estatuto da Criança e do Adolescente, nenhum dado pessoal nominal ou imagem de menores é exposto publicamente. Todos os dados abaixo representam métricas consolidadas auditadas no Cofre Institucional com dupla checagem (Maker-Checker).';
  const splitLgpd = doc.splitTextToSize(lgpdText, contentWidth - 8);
  doc.text(splitLgpd, margin + 4, y + 9);
  y += 22;

  // 2. Seção: Indicadores Homologados
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('1. Indicadores de Impacto Social Homologados', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Valores verificados por notas fiscais, diários de frequência e aprovados pelo Conselho Fiscal.', margin, y);
  y += 6;

  // Renderização de cada indicador
  indicators.forEach((ind) => {
    const cardHeight = 28;
    checkPageBreak(cardHeight + 4);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');

    // Badge Categoria e Período
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.roundedRect(margin + 3, y + 3, 40, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(4, 120, 87); // emerald-700
    doc.text(ind.category.toUpperCase(), margin + 5, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Código: ${ind.code} • Período: ${ind.period} • Versão ${ind.version}`, margin + 46, y + 6.5);

    // Métrica em destaque
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    const metricStr = `${ind.metricValue.toLocaleString('pt-BR')} ${ind.metricUnit}`;
    doc.text(metricStr, margin + 4, y + 14);

    // Nome do Indicador
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(ind.name, margin + 4, y + 19);

    // Fonte Auditada
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    const sourceFormatted = `Fonte Verificada: ${ind.sourceDescription}`;
    const splitSource = doc.splitTextToSize(sourceFormatted, contentWidth - 8);
    doc.text(splitSource[0] || '', margin + 4, y + 24);

    y += cardHeight + 4;
  });

  y += 3;

  // 3. Seção: Honestidade Radical (O que ainda não conseguimos medir • D7 / US-04)
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('2. Compromisso Ético: O Que Ainda Não Conseguimos Medir', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'Demonstração pública de maturidade e rigor estatístico: áreas com limitação metodológica ou orçamentária declaradas.',
    margin,
    y
  );
  y += 6;

  const ethicalItems = [
    {
      num: '01',
      title: 'Impacto Longitudinal Pós-Egresso (3 a 5 anos)',
      aim: 'Progressão de renda e ingresso no ensino superior dos egressos após 5 anos de conclusão.',
      limit: 'Exige equipe dedicada de busca ativa e infraestrutura amostral fora do orçamento atual.',
      status: 'Em estudo com parceria universitária para coorte amostral em 2027.',
    },
    {
      num: '02',
      title: 'Efeito Multiplicador Intrafamiliar Exato',
      aim: 'Impacto nutricional das refeições e cestas em avós e membros da mesma residência.',
      limit: 'Coleta de dados de familiares não cadastrados violaria a minimização da LGPD.',
      status: 'Abordado via questionários qualitativos semestrais não invasivos.',
    },
    {
      num: '03',
      title: 'Isolamento Causal Estrito na Evasão Escolar',
      aim: 'Fração exata de retenção atribuível exclusivamente às oficinas versus políticas públicas.',
      limit: 'Exigiria grupo de controle randomizado (deixar famílias sem auxílio), o que é eticamente inaceitável.',
      status: 'Estimativa conservadora balizada por dados agregados das escolas estaduais.',
    },
  ];

  ethicalItems.forEach((item) => {
    const boxHeight = 22;
    checkPageBreak(boxHeight + 3);

    doc.setFillColor(accentLight[0], accentLight[1], accentLight[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.25);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.text(`[${item.num}] ${item.title}`, margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`Objetivo: ${item.aim}`, margin + 4, y + 10);
    doc.text(`Limitação Atual: ${item.limit}`, margin + 4, y + 14);

    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`Posicionamento: ${item.status}`, margin + 4, y + 18);

    y += boxHeight + 3;
  });

  y += 4;

  // 4. Seção: Conciliação Financeira e Rastreabilidade
  checkPageBreak(26);
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 251, 0); // #00FB00
  doc.text('RASTREABILIDADE FINANCEIRA & AUDITORIA DE RECURSOS', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  const finText =
    '100% das doações recebidas via Pix e Cartão de Crédito são segregadas em contas institucionais dedicadas às causas sociais e reconciliadas em tempo real com o extrato dos arranjos de pagamento bancários. O Instituto mantém prestação de contas contínua sem retenções indevidas.';
  const splitFin = doc.splitTextToSize(finText, contentWidth - 8);
  doc.text(splitFin, margin + 4, y + 11);

  y += 28;

  // Desenha rodapés em todas as páginas geradas
  drawFooter();

  // Salva o arquivo no navegador
  const fileName = `Relatorio-Transparencia-Instituto-Ebenezer-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
