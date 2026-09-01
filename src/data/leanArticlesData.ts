export interface LeanArticle {
  id: string;
  title: string;
  category: 'Fundamentos' | 'Qualidade' | 'Produtividade' | 'Métodos' | 'Manutenção';
  readTimeMinutes: number;
  icon: string;
  summary: string;
  badge?: string;
  isNew?: boolean;
  content: {
    introduction: string;
    keyConcepts: { title: string; description: string }[];
    howToApply: string[];
    factoryExample: string;
    bestPractices: string[];
    quizHint: string;
  };
}

export const LEAN_ARTICLES: LeanArticle[] = [
  {
    id: '8-desperdicios',
    title: 'Os 8 Grandes Desperdícios da Produção (Muda)',
    category: 'Fundamentos',
    readTimeMinutes: 6,
    icon: '🗑️',
    badge: 'Essencial',
    isNew: true,
    summary: 'Aprenda a identificar e eliminar os 8 males que drenam tempo, dinheiro e capacidade no chão de fábrica.',
    content: {
      introduction:
        'No Sistema Toyota de Produção (TPS), desperdício (Muda) é qualquer atividade que consome recursos mas não agrega valor direto percebido pelo cliente final. Eliminar desperdícios é o caminho mais rápido para aumentar a produtividade sem investir milhões em novas máquinas.',
      keyConcepts: [
        {
          title: '1. Superprodução',
          description:
            'Produzir antes ou em quantidade maior do que a etapa seguinte necessita. É considerado o pior dos desperdícios pois esconde todos os outros problemas.',
        },
        {
          title: '2. Espera',
          description:
            'Operadores ou materiais ociosos aguardando liberação de lote, setup, manutenção corretiva ou instruções de trabalho.',
        },
        {
          title: '3. Transporte',
          description:
            'Movimentação desnecessária de materiais, empilhadeiras ou produtos em processo (WIP) entre galpões ou células distantes.',
        },
        {
          title: '4. Processamento Excessivo',
          description:
            'Executar etapas além do que o cliente especificou, como acabamentos redundantes ou inspeções duplicadas por falta de confiança no processo.',
        },
        {
          title: '5. Estoque Excessivo',
          description:
            'Capital congelado em matéria-prima, componentes intermediários e produto acabado ocupando espaço físico e gerando risco de avaria.',
        },
        {
          title: '6. Movimentação',
          description:
            'Deslocamento físico inadequado do operador no posto (caminhadas, flexões, giros de coluna para buscar ferramentas ou caixas).',
        },
        {
          title: '7. Defeitos & Retrabalho',
          description:
            'Peças não conformes que exigem reparo, retrabalho ou descarte como sucata, gerando custo de não conformidade.',
        },
        {
          title: '8. Intelecto Subutilizado',
          description:
            'Não ouvir, valorizar ou implementar as ideias de melhoria contínua sugeridas pelos próprios operadores do Gemba.',
        },
      ],
      howToApply: [
        'Vá ao Gemba (chão de fábrica) com prancheta ou tablet e cronômetro.',
        'Mapeie o posto de trabalho e cronometre o tempo de valor agregado vs tempo de desperdício.',
        'Desenhe o Diagrama de Espaguete para enxergar o desperdício de movimentação e transporte.',
        'Envolva o operador na criação de soluções simples (Kaizen de baixo custo).',
      ],
      factoryExample:
        'Em uma célula de usinagem, o operador caminhava 14 metros a cada 10 peças para buscar pastilhas de corte. Com a instalação de um suporte no ponto de uso (Ponto 5S), economizou-se 48 minutos por turno e R$ 22.000 ao ano.',
      bestPractices: [
        'Nunca culpe o operador pelo desperdício; o foco é sempre na melhoria do processo.',
        'Trabalhe primeiro na eliminação da Superprodução para revelar os gargalos reais.',
        'Use gestão visual para que qualquer desvio ou acúmulo de estoque fique imediatamente evidente.',
      ],
      quizHint:
        'Lembre-se: a Superprodução é considerada o pior desperdício porque gera e mascara todos os demais.',
    },
  },
  {
    id: '5s-metodologia',
    title: 'Metodologia 5S: O Alicerce da Estabilidade Fabril',
    category: 'Qualidade',
    readTimeMinutes: 5,
    icon: '✨',
    badge: 'Fundamento',
    isNew: false,
    summary: 'Como implantar os 5 Sensos (Seiri, Seiton, Seiso, Seiketsu, Shitsuke) para criar um ambiente seguro, ágil e visual.',
    content: {
      introduction:
        'O 5S não é apenas um programa de faxina ou organização estética. Trata-se da disciplina operacional que cria a base estável necessária para que ferramentas avançadas como SMED, Kanban e Trabalho Padronizado possam funcionar sem falhas.',
      keyConcepts: [
        {
          title: '1. Seiri (Senso de Utilização / Descarte)',
          description:
            'Separar o que é útil do que não é. O que não agrega valor diário deve ser descartado, reciclado ou enviado para a área de quarentena (Cartão Vermelho).',
        },
        {
          title: '2. Seiton (Senso de Organização / Ordenação)',
          description:
            'Um lugar para cada coisa e cada coisa em seu lugar. Ferramentas e insumos posicionados por frequência de uso e com demarcação visual rápida.',
        },
        {
          title: '3. Seiso (Senso de Limpeza & Inspeção)',
          description:
            'Limpar inspecionando. Ao limpar a máquina, o operador identifica vazamentos de óleo, parafusos frouxos ou desgastes antes que virem quebras.',
        },
        {
          title: '4. Seiketsu (Senso de Padronização / Saúde)',
          description:
            'Criar padrões visuais, cores, etiquetas e rotinas diárias para manter os 3 primeiros S consolidados.',
        },
        {
          title: '5. Shitsuke (Senso de Autodisciplina)',
          description:
            'Fazer do padrão um hábito diário por meio de auditorias periódicas, reconhecimento e liderança ativa.',
        },
      ],
      howToApply: [
        'Realize o Dia D do 5S com a equipe da célula para descarte do desnecessário.',
        'Crie painéis-sombra para ferramentas e demarque corredores e posições no chão com fitas industriais.',
        'Estabeleça um checklist diário de 5 minutos de limpeza e checagem no início ou final de cada turno.',
        'Promova auditorias semanais com notas públicas para incentivar o senso de dono.',
      ],
      factoryExample:
        'Na linha de montagem de painéis elétricos, o tempo de busca por alicates e parafusadeiras caiu de 4 minutos para 5 segundos após a implantação do painel-sombra e suportes suspensos, aumentando o OEE em 8%.',
      bestPractices: [
        'O Seiso deve ser encarado como a primeira linha de defesa da manutenção autônoma (TPM).',
        'Evite comprar armários fechados que escondam bagunça; prefira carrinhos e estantes abertas e visuais.',
      ],
      quizHint:
        'O 3º S (Seiso) significa limpar como forma de inspeção para antecipar anomalias e quebras.',
    },
  },
  {
    id: 'poka-yoke',
    title: 'Poka-Yoke: Qualidade Assegurada na Fonte',
    category: 'Qualidade',
    readTimeMinutes: 5,
    icon: '🛡️',
    badge: 'Zero Defeitos',
    isNew: true,
    summary: 'Dispositivos à prova de erros mecânicos e elétricos que tornam fisicamente impossível cometer falhas operacionais.',
    content: {
      introduction:
        'Criado pelo engenheiro Shigeo Shingo, o termo Poka-Yoke significa "à prova de erros inadvertidos". O conceito parte do princípio de que os seres humanos são passíveis de esquecimento ou distração, mas o processo deve ser desenhado para impedir que erros se transformem em defeitos.',
      keyConcepts: [
        {
          title: 'Poka-Yoke de Controle (Prevenção Total)',
          description:
            'Mecanismo físico que impede o início da operação ou montagem incorreta (ex: tomada de 3 pinos, pinos guia assimétricos).',
        },
        {
          title: 'Poka-Yoke de Advertência (Alarme / Sensor)',
          description:
            'Sinaliza ao operador por meio de luz (Andon), sinal sonoro ou interrupção quando uma anomalia for detectada antes da peça prosseguir.',
        },
        {
          title: 'Método do Contato Físico',
          description:
            'Uso de gabaritos, sensores indutivos ou formatos geométricos que só permitem encaixe na posição correta.',
        },
        {
          title: 'Método do Valor Fixo (Contagem)',
          description:
            'Dispensadores que liberam exatamente o número de parafusos necessários para o ciclo. Se sobrar parafuso na bandeja, o ciclo não termina.',
        },
      ],
      howToApply: [
        'Identifique operações manuais críticas que geram histórico de refugo ou reclamação de cliente.',
        'Desenvolva dispositivos Kaizen mecânicos de baixo custo com a equipe de manutenção e ferramentaria.',
        'Teste o dispositivo em condições extremas de erro para certificar que o processo realmente trava.',
        'Documente o Poka-Yoke no POP e estabeleça checagem de integridade diária.',
      ],
      factoryExample:
        'Na furação de chapas simétricas, operadores invertiam o lado 3 vezes por semana. Com a soldagem de um pino guia de R$ 15 na base do gabarito, o refugo caiu a zero absoluto há mais de 12 meses.',
      bestPractices: [
        'Priorize Poka-Yokes mecânicos passivos (sem partes elétricas) por serem mais baratos e confiáveis.',
        'Audite os Poka-Yokes periodicamente para garantir que ninguém desativou o sensor.',
      ],
      quizHint:
        'Um Poka-Yoke de controle atua travando fisicamente a operação, impedindo a geração do defeito.',
    },
  },
  {
    id: 'smed-troca-rapida',
    title: 'SMED: Troca Rápida de Ferramentas em Menos de 10 Minutos',
    category: 'Produtividade',
    readTimeMinutes: 7,
    icon: '⚡',
    badge: 'Alta Performance',
    isNew: false,
    summary: 'Metodologia de Shigeo Shingo para reduzir tempos de preparação de máquina, permitindo lotes pequenos e flexibilidade.',
    content: {
      introduction:
        'SMED (Single-Minute Exchange of Die) é a metodologia desenvolvida para reduzir setups de horas para menos de 10 minutos (dígito único). Reduzir setup é o segredo para produzir em pequenos lotes sem perder disponibilidade de máquina.',
      keyConcepts: [
        {
          title: 'Setup Interno (IED)',
          description:
            'Atividades que só podem ser realizadas com a máquina totalmente PARADA (ex: troca de molde na prensa, fixação do cabeçote).',
        },
        {
          title: 'Setup Externo (OED)',
          description:
            'Atividades que podem e DEVEM ser feitas com a máquina ainda RODANDO o lote anterior (ex: pré-aquecer molde, buscar ferramentas, separar matéria-prima).',
        },
        {
          title: 'Conversão de Interno para Externo',
          description:
            'Transformar passos que antes paravam a máquina em tarefas preparadas previamente enquanto a linha produz.',
        },
        {
          title: 'Eliminação de Ajustes',
          description:
            'Substituir parafusos longos por travas rápidas de um toque, calços pré-regulados e posições de engate rápido.',
        },
      ],
      howToApply: [
        'Filme o setup completo do início ao fim sem interrupções.',
        'Reúna a equipe multidisciplinar e cronometre cada microetapa.',
        'Classifique cada tarefa em SETUP INTERNO ou SETUP EXTERNO.',
        'Converta o máximo de passos internos em externos.',
        'Padronize as ferramentas com um carrinho de setup dedicado e treine os preparadores.',
      ],
      factoryExample:
        'Em uma injetora de plástico, o setup demorava 85 minutos. Com a pré-montagem das mangueiras e pré-aquecimento do molde (setup externo), o tempo caiu para 7 minutos e 20 segundos.',
      bestPractices: [
        'Nunca permita que a máquina pare para o preparador ir buscar uma chave Allen ou parafuso.',
        'Use travas de 1/4 de volta em vez de parafusos de rosca inteira.',
      ],
      quizHint:
        'A etapa central do SMED é converter o máximo de atividades internas em atividades externas.',
    },
  },
  {
    id: 'vsm-fluxo-valor',
    title: 'Mapeamento do Fluxo de Valor (VSM): Enxergando o Todo',
    category: 'Métodos',
    readTimeMinutes: 6,
    icon: '🗺️',
    badge: 'Estratégico',
    isNew: false,
    summary: 'Como mapear materiais e informações para identificar gargalos, estoques ocultos e reduzir o Lead Time fabril.',
    content: {
      introduction:
        'O VSM (Value Stream Mapping) é a ferramenta visual que mapeia todos os passos, estoques e fluxos de informação desde o recebimento do pedido até a entrega ao cliente. Ele permite enxergar onde o produto passa mais tempo parado do que sendo transformado.',
      keyConcepts: [
        {
          title: 'Tempo de Processamento (VA - Valor Agregado)',
          description:
            'Tempo real em que o produto está sofrendo transformação física de valor (geralmente medido em segundos ou minutos).',
        },
        {
          title: 'Tempo de Atravessamento (Lead Time Total)',
          description:
            'Tempo total que a peça leva para cruzar a fábrica, somando esperas em estoque, transporte e filas (geralmente dias ou semanas).',
        },
        {
          title: 'Takt Time (Ritmo do Cliente)',
          description:
            'Ritmo necessário de produção para atender a demanda. Calculado como: Tempo Disponível / Demanda do Cliente.',
        },
        {
          title: 'Estado Atual vs Estado Futuro',
          description:
            'Diagnóstico do fluxo cheio de desperdícios (Atual) comparado ao desenho ideal com fluxo contínuo e puxado (Futuro).',
        },
      ],
      howToApply: [
        'Caminhe pelo fluxo no Gemba de trás para frente (da expedição ao recebimento).',
        'Colete dados reais de tempo de ciclo, número de operadores, taxa de refugo e tamanho de estoque.',
        'Desenhe a Linha do Tempo comparando tempo de processamento vs tempo de espera.',
        'Estabeleça o plano Kaizen para implantar o Estado Futuro.',
      ],
      factoryExample:
        'Uma montadora de bombas hidráulicas descobriu que seu tempo de processamento era de 35 minutos, mas o Lead Time total era de 21 dias devido a estoques intermediários. O redesenho do VSM reduziu o Lead Time para 3 dias.',
      bestPractices: [
        'O VSM deve ser desenhado à mão no chão de fábrica antes de passar para o computador.',
        'Foque na redução de estoques intermediários para forçar o fluxo contínuo.',
      ],
      quizHint:
        'O Takt Time é calculado dividindo o tempo líquido disponível de trabalho pela demanda do cliente.',
    },
  },
  {
    id: 'tpm-oee',
    title: 'Manutenção Produtiva Total (TPM) e Cálculo do OEE',
    category: 'Manutenção',
    readTimeMinutes: 7,
    icon: '⚙️',
    badge: 'Disponibilidade',
    isNew: false,
    summary: 'Como engajar operadores na manutenção autônoma e dominar o cálculo da Eficiência Global dos Equipamentos (OEE).',
    content: {
      introduction:
        'A Manutenção Produtiva Total (TPM) tem como meta o Zero Quebras, Zero Acidentes e Zero Defeitos. A métrica global de desempenho é o OEE (Overall Equipment Effectiveness), que mede a real produtividade de uma máquina.',
      keyConcepts: [
        {
          title: 'Os 3 Fatores do OEE',
          description:
            'OEE = Disponibilidade × Desempenho × Qualidade. Mostra a porcentagem do tempo planejado em que a máquina produziu peças boas na velocidade nominal.',
        },
        {
          title: 'Disponibilidade (D)',
          description:
            'Tempo Real de Operação ÷ Tempo Planejado. É impactado por paradas não programadas (quebras, faltas de material, setup demorado).',
        },
        {
          title: 'Desempenho (P)',
          description:
            'Produção Real ÷ Capacidade Teórica na Velocidade Padrão. É impactado por microparadas e operação em velocidade reduzida.',
        },
        {
          title: 'Qualidade (Q)',
          description:
            'Peças Boas Produzidas ÷ Total de Peças Processadas. É impactado por refugo, sucata e retrabalho.',
        },
        {
          title: 'Manutenção Autônoma (Pilar 1 da TPM)',
          description:
            'Capacitação do operador para realizar inspeção diária, limpeza técnica, reapertos e lubrificação básica no seu próprio posto.',
        },
      ],
      howToApply: [
        'Institua o quadro de etiquetas azuis e vermelhas de anomalias no equipamento.',
        'Calcule o OEE diário e estratifique as maiores perdas em um Gráfico de Pareto.',
        'Crie padrões visuais LPP (Lição Ponto a Ponto) para lubrificação e limpeza autônoma.',
      ],
      factoryExample:
        'Uma linha de embalagem com Disponibilidade de 80%, Desempenho de 85% e Qualidade de 95% tem OEE de 64,6% (0,80 × 0,85 × 0,95). Com a TPM autônoma, o OEE saltou para 84,2%.',
      bestPractices: [
        'O padrão mundial de classe mundial (World Class) para OEE é de 85% ou superior.',
        'Não tente esconder paradas curtas; microparadas de 30 segundos são os maiores ladrões de desempenho.',
      ],
      quizHint:
        'A fórmula do OEE multiplica três índices percentuais: Disponibilidade × Desempenho × Qualidade.',
    },
  },
  {
    id: 'trabalho-padronizado-pop',
    title: 'Trabalho Padronizado (POP): A Base da Repetibilidade',
    category: 'Fundamentos',
    readTimeMinutes: 5,
    icon: '📋',
    badge: 'Essencial',
    isNew: false,
    summary: 'Como redigir e manter Procedimentos Operacionais Padrão que garantam segurança, ergonomia e tempo de ciclo estável.',
    content: {
      introduction:
        'Sem padrão, não pode haver melhoria contínua (Kaizen). O Trabalho Padronizado documenta a sequência mais segura, ergonômica e produtiva conhecida até o momento para executar uma atividade.',
      keyConcepts: [
        {
          title: 'Takt Time',
          description:
            'O ritmo de batimento da fábrica sincronizado com a demanda do cliente.',
        },
        {
          title: 'Sequência de Trabalho Padrão',
          description:
            'A ordem exata em que o operador deve pegar materiais, acionar comandos e inspecionar a peça.',
        },
        {
          title: 'Estoque Padrão em Processo (SWIP)',
          description:
            'O número mínimo de peças necessárias na célula para manter o fluxo contínuo sem paradas.',
        },
        {
          title: 'Instrução de Trabalho Visual (POP / SOP)',
          description:
            'Folha com fotos reais, passos principais, pontos críticos de qualidade e alertas de segurança.',
        },
      ],
      howToApply: [
        'Construa o POP junto com os melhores operadores de todos os turnos.',
        'Utilize fotos com setas e círculos destacando o que fazer e o que NÃO fazer.',
        'Fixe o POP visivelmente na altura dos olhos do operador no posto.',
        'Revise o padrão sempre que houver uma melhoria Kaizen.',
      ],
      factoryExample:
        'Em uma célula de solda, a falta de padrão gerava variação de ciclo entre 45 e 90 segundos dependendo do turno. Com o POP visual homologado, o ciclo estabilizou em 48 segundos em todos os turnos.',
      bestPractices: [
        'O POP nunca é estático; ele deve ser atualizado a cada Kaizen implantado.',
        'Use poucas palavras e muitas fotos ilustrativas.',
      ],
      quizHint:
        'O Trabalho Padronizado compõe-se de três elementos principais: Takt Time, Sequência de Trabalho e Estoque Padrão.',
    },
  },
  {
    id: 'pdca-analise-causal',
    title: 'Ciclo PDCA & Análise Causal: 5 Porquês e Ishikawa 6M',
    category: 'Métodos',
    readTimeMinutes: 6,
    icon: '🔄',
    badge: 'Metodologia',
    isNew: false,
    summary: 'Como diagnosticar problemas na raiz com fatos, dados e rigor científico, evitando retrabalho e soluções superficiais.',
    content: {
      introduction:
        'O ciclo PDCA (Plan, Do, Check, Act) é o método científico aplicado à gestão industrial. Para resolver problemas em definitivo, é fundamental investigar no Gemba usando a técnica dos 5 Porquês e o Diagrama de Ishikawa.',
      keyConcepts: [
        {
          title: 'Fase Plan (Planejar & Diagnosticar)',
          description:
            'Definição clara do problema, estratificação por Pareto e investigação da causa raiz com 5 Porquês e Ishikawa.',
        },
        {
          title: 'Os 5 Porquês',
          description:
            'Perguntar sucessivamente "por quê?" para atravessar os sintomas superficiais até atingir a causa raiz no sistema de gestão ou método.',
        },
        {
          title: 'Diagrama de Ishikawa (6M)',
          description:
            'Classificação das causas em Método, Máquina, Material, Mão de Obra, Medição e Meio Ambiente.',
        },
        {
          title: 'Fase Do (Executar 5W2H)',
          description:
            'Plano de ação com responsável, prazo e teste piloto antes do desdobramento total.',
        },
        {
          title: 'Fase Check & Act',
          description:
            'Conferir os resultados nos indicadores e padronizar (POP) e replicar lateralmente (Yokoten).',
        },
      ],
      howToApply: [
        'Nunca aceite a primeira resposta como causa raiz (ex: "erro do operador" não é causa raiz).',
        'Comprove cada porquê com evidência física observada no posto de trabalho.',
        'Desenvolva ações com foco em Trabalho Padronizado ou Poka-Yoke na fase DO.',
      ],
      factoryExample:
        'Mancha de óleo no piso: Por que havia óleo? Junta vazou. Por que vazou? Junta ressecou. Por que ressecou? Especificação térmica errada. Causa Raiz: Falha no procedimento de compras de peças sobressalentes.',
      bestPractices: [
        'A causa raiz deve sempre apontar para uma oportunidade de melhoria no método ou padrão, nunca para culpa pessoal.',
        'Se o 5º porquê for eliminado, o problema nunca mais deve voltar a acontecer.',
      ],
      quizHint:
        'O Diagrama de Ishikawa divide as causas potenciais em 6 categorias (6M): Método, Máquina, Material, Mão de Obra, Medição e Meio Ambiente.',
    },
  },
];
