export interface ExamQuestion {
  id: number;
  question: string;
  category:
    | 'Fundamentos TPS & Lean'
    | '8 Desperdícios & Gemba'
    | '5S & Padronização Avançada'
    | 'Poka-Yoke & Jidoka'
    | 'SMED & Engenharia de Setup'
    | 'VSM & Fluxo Contínuo'
    | 'TPM, Confiabilidade & OEE'
    | 'PDCA & Causalidade Científica'
    | 'Engenharia Financeira & ROI Lean'
    | 'Kanban, Supermercados & Heijunka';
  options: [string, string, string, string, string];
  correctOptionIndex: number; // 0=A, 1=B, 2=C, 3=D, 4=E
  explanation: string;
}

export const LEAN_EXAM_QUESTIONS: ExamQuestion[] = [
  // 1 a 5: Fundamentos TPS & Lean
  {
    id: 1,
    question:
      'No Sistema Toyota de Produção (TPS), a estabilidade operacional básica é pré-requisito mandatório para a implementação do Just-in-Time e do Jidoka. Segundo a casa do TPS de Fujio Cho, qual tríade sustenta a base da estabilidade?',
    category: 'Fundamentos TPS & Lean',
    options: [
      'Trabalho Padronizado, Gestão Visual (5S) e Nivelamento da Produção (Heijunka)',
      'Manutenção Corretiva Imediata, Estoque de Pulmão e Turnos Extras',
      'Inspeção por Amostragem AQL, Lotes Econômicos de Compra e Automação 4.0',
      'Planilhas de Custo Médio, Bonificação por Peça e Auditorias Anuais',
      'Produção Empurrada por MRP, Troca Lenta de Matrizes e Células Isoladas',
    ],
    correctOptionIndex: 0,
    explanation:
      'A base da Casa do TPS é composta pela Estabilidade através do Trabalho Padronizado, 5S/Gestão Visual e Heijunka (nivelamento de volume e mix), sem as quais o JIT e o Jidoka colapsam.',
  },
  {
    id: 2,
    question:
      'Durante um Gemba Walk em uma linha de montagem, um Especialista Lean observa operadores realizando movimentos não sincronizados e máquinas acumulando estoques intermediários intermitentes. Ao categorizar as perdas estruturais, a relação entre Mura, Muri e Muda estabelece que:',
    category: 'Fundamentos TPS & Lean',
    options: [
      'Muda (Desperdício) é a causa primária que gera Mura (Oscilação) e Muri (Sobrecarga)',
      'Mura (Variabilidade/Instabilidade no ritmo) gera Muri (Sobrecarga de pessoas e máquinas), os quais inevitavelmente resultam em Muda (Desperdícios)',
      'Muri é exclusivo de manutenção e não tem qualquer impacto no fluxo de materiais',
      'Os três conceitos são sinônimos e não possuem relação de causa e efeito',
      'Mura deve ser combatido apenas com aumento de horas extras no fechamento mensal',
    ],
    correctOptionIndex: 1,
    explanation:
      'A teoria do TPS ensina que Mura (variabilidade no fluxo/demanda) sobrecarrega o sistema (Muri), criando quebras, fadiga e refugos, que geram os 8 desperdícios (Muda).',
  },
  {
    id: 3,
    question:
      'Uma fábrica opera com 2 turnos de 8 horas (480 minutos brutos cada). Há 30 minutos de refeição e 10 minutos de parada programada por turno. Se a demanda diária consolidada do cliente é de 880 peças, qual é o Takt Time exato do processo?',
    category: 'Fundamentos TPS & Lean',
    options: [
      '60,0 segundos por peça',
      '54,5 segundos por peça',
      '65,4 segundos por peça',
      '48,0 segundos por peça',
      '72,0 segundos por peça',
    ],
    correctOptionIndex: 0,
    explanation:
      'Tempo líquido disponível por turno: 480 - 30 - 10 = 440 minutos. Em 2 turnos: 440 × 2 = 880 minutos = 52.800 segundos. Takt Time = 52.800 s ÷ 880 peças = 60,0 segundos por peça.',
  },
  {
    id: 4,
    question:
      'Em uma célula Lean com fluxo contínuo balanceado, se o Tempo de Ciclo (TC) de um posto for de 52 segundos e o Takt Time (TT) for de 60 segundos, qual decisão de engenharia de manufatura é a mais correta?',
    category: 'Fundamentos TPS & Lean',
    options: [
      'Acelerar a velocidade da máquina para que o operador produza peças além da demanda',
      'Manter o ritmo conforme a demanda puxada e utilizar o tempo de folga operacional para rotinas de 5S, inspeção autônoma ou Kaizen',
      'Deslocar o operador imediatamente para outro setor a cada 10 minutos',
      'Aumentar o estoque intermediário de segurança entre as estações para 500 peças',
      'Desligar o sensor de parada automática da linha',
    ],
    correctOptionIndex: 1,
    explanation:
      'Produzir mais rápido que o Takt Time gera superprodução. O operador deve respeitar o ritmo puxado e usar a capacidade excedente em manutenção autônoma e melhoria contínua.',
  },
  {
    id: 5,
    question:
      'O conceito de "Yokoten" (橫展) no ecossistema de maturidade Lean representa:',
    category: 'Fundamentos TPS & Lean',
    options: [
      'O descarte obrigatório de máquinas com mais de 5 anos de uso',
      'A disseminação e replicação horizontal padronizada de soluções Kaizen bem-sucedidas para linhas, postos e plantas irmãs similares',
      'A cobrança de penalidades contratuais de fornecedores com atraso de entrega',
      'A terceirização completa de serviços de ferramentaria e usinagem',
      'O método de cálculo de depreciação acelerada de moldes industriais',
    ],
    correctOptionIndex: 1,
    explanation:
      'Yokoten é o aprendizado compartilhado lateralmente na organização para que uma melhoria comprovada em uma linha seja rapidamente adotada em todos os processos análogos.',
  },

  // 6 a 10: 8 Desperdícios & Gemba
  {
    id: 6,
    question:
      'Em uma linha de usinagem CNC, peças usinadas são empilhadas em paletes e transportadas para uma área de quarentena a 60 metros, onde aguardam 48 horas para inspeção dimensional por amostragem. Quais desperdícios primários estão ocorrendo simultaneamente?',
    category: '8 Desperdícios & Gemba',
    options: [
      'Superprodução, Espera, Transporte desnecessário e Estoque em processo (WIP)',
      'Apenas Intelecto Subutilizado',
      'Apenas Desperdício de Movimentação do Operador',
      'Somente Processamento Excessivo',
      'Nenhum desperdício, pois a quarentena é etapa de valor agregado obrigatória no Lean',
    ],
    correctOptionIndex: 0,
    explanation:
      'O lote empilhado gera estoque intermediário (WIP), o deslocamento de 60m é transporte, as 48 horas paradas configuram espera e o loteamento mascara a superprodução.',
  },
  {
    id: 7,
    question:
      'Qual é o impacto sistêmico do desperdício de "Superprodução Quantitativa e Antecipada" sobre o fluxo de caixa e o Lead Time de uma fábrica?',
    category: '8 Desperdícios & Gemba',
    options: [
      'Aumenta o giro de estoque e reduz a necessidade de capital de giro',
      'Congela capital de giro em matéria-prima e mão de obra, infla o Lead Time (Lei de Little) e oculta causas raízes de quebras e refugos',
      'Reduz o custo contábil de depreciação das injetoras',
      'Elimina a necessidade de manutenção preventiva nas prensas',
      'Garante a entrega no prazo mesmo com 50% de refugo na montagem',
    ],
    correctOptionIndex: 1,
    explanation:
      'Segundo a Lei de Little (Lead Time = WIP / Throughput), quanto maior o estoque de superprodução, maior será o Lead Time fabril e o capital de giro retido.',
  },
  {
    id: 8,
    question:
      'Durante a montagem de um motor, o operador realiza constantes rotações de tronco de 180° e estende os braços acima da linha dos ombros para alcançar ferramentas pneumáticas. A análise ergonômica Lean classifica essa perda como:',
    category: '8 Desperdícios & Gemba',
    options: [
      'Desperdício de Movimentação por não-conformidade com a Economia de Movimentos de Gilbreth',
      'Desperdício de Transporte de Carga Pesada',
      'Desperdício de Superprocessamento de Fixadores',
      'Desperdício de Espera Passiva',
      'Valor Agregado Físico de Montagem',
    ],
    correctOptionIndex: 0,
    explanation:
      'Movimentos fora da zona de alcance ergonômico ótimo (área áurea de trabalho) geram desperdício de movimentação e risco de lesão osteomuscular.',
  },
  {
    id: 9,
    question:
      'A Engenharia de Produto especificou tolerância dimensional de ±0,02 mm em uma face sem contato mecânico, exigindo passe extra de retífica que consome 35 segundos por peça. Sob a ótica do Lean, como essa operação deve ser tratada?',
    category: '8 Desperdícios & Gemba',
    options: [
      'Como Processamento Excessivo (Superprocessamento), devendo ser aberto um Kaizen de Engenharia de Valor para flexibilizar a tolerância e eliminar o passe extra',
      'Como etapa de alta qualidade que deve ser mantida a qualquer custo',
      'Como falha de manutenção autônoma da retífica',
      'Como um Poka-Yoke de acabamento estético',
      'Como desperdício de transporte entre centros de usinagem',
    ],
    correctOptionIndex: 0,
    explanation:
      'Executar etapas ou tolerâncias mais rígidas do que a função do produto exige e sem percepção de valor pelo cliente é a definição técnica de Superprocessamento.',
  },
  {
    id: 10,
    question:
      'Qual métrica operacional reflete com maior precisão a eliminação dos 8 desperdícios em um processo manufatureiro?',
    category: '8 Desperdícios & Gemba',
    options: [
      'Índice de Eficiência de Ciclo do Processo (PCE = Tempo de Valor Agregado ÷ Lead Time Total × 100)',
      'Quantidade total de peças no almoxarifado central',
      'Número de horas extras realizadas pela equipe no mês',
      'Volume de papel impresso nas ordens de produção',
      'Consumo total de óleo hidráulico por máquina',
    ],
    correctOptionIndex: 0,
    explanation:
      'A Eficiência de Ciclo do Processo (PCE / Process Cycle Efficiency) mede a proporção real de tempo em que valor físico é gerado sobre o tempo total de permanência.',
  },

  // 11 a 15: 5S & Padronização Avançada
  {
    id: 11,
    question:
      'Na implementação do 1º Senso (Seiri - Utilização), qual é a metodologia padrão utilizada para itens de uso duvidoso ou sem movimentação nos últimos 30 dias?',
    category: '5S & Padronização Avançada',
    options: [
      'Esconder os itens sob bancadas para aprovação na auditoria',
      'Aplicação de Cartão Vermelho (Red Tag), transferência para área de quarentena visual e destinação formal (descarte, venda ou realocação)',
      'Pintar os itens de verde para indicar que pertencem ao posto',
      'Dividir os itens igualmente entre todos os operadores do turno',
      'Aguardar o final do ano fiscal para qualquer tomada de decisão',
    ],
    correctOptionIndex: 1,
    explanation:
      'A etiquetagem com Cartão Vermelho (Red Tagging) com prazo determinado e área de quarentena é a técnica padrão do Seiri para expurgar itens desnecessários.',
  },
  {
    id: 12,
    question:
      'No 2º Senso (Seiton - Ordenação), o princípio de disposição de ferramentas segundo a frequência de utilização dita que:',
    category: '5S & Padronização Avançada',
    options: [
      'Itens de uso a cada ciclo ou hora devem estar na zona de alcance imediato (área primária); itens de uso diário na célula; itens ocasionais no armário compartilhado identificado',
      'Todas as ferramentas devem ficar guardadas juntas na caixa trancada do líder de turno',
      'As ferramentas mais pesadas devem ficar suspensas acima da cabeça do operador',
      'A ordenação deve priorizar a cor da ferramenta e não a sua frequência de uso',
      'O posto não deve possuir nenhuma identificação visual para testar a memória dos operadores',
    ],
    correctOptionIndex: 0,
    explanation:
      'A regra de ouro do Seiton é posicionar recursos em camadas concêntricas de distância conforme a frequência de acesso: segundos (mão), minutos (bancada), horas (célula), dias (almoxarifado).',
  },
  {
    id: 13,
    question:
      'Em uma auditoria 5S de classe mundial, por que o 3º Senso (Seiso - Limpeza) é considerado a primeira barreira contra a quebra de máquinas?',
    category: '5S & Padronização Avançada',
    options: [
      'Porque a limpeza com panos reduz o custo de terceirização predial',
      'Porque limpar com método é inspecionar minuciosamente o equipamento, permitindo a detecção precoce de folgas, trincas, vazamentos e fontes de contaminação',
      'Porque máquinas limpas consomem 50% menos energia elétrica da rede',
      'Porque dispensa a lubrificação de guias e mancais',
      'Porque impede que o operador utilize ferramentas manuais',
    ],
    correctOptionIndex: 1,
    explanation:
      'No Lean e na TPM, "Limpeza é Inspeção". Ao higienizar e tocar os pontos críticos, o operador detecta as anomalias microscópicas antes que se tornem paradas funcionais.',
  },
  {
    id: 14,
    question:
      'Uma Instrução de Trabalho Padronizado (POP / SOP) eficaz deve conter obrigatoriamente quais elementos para garantir repetibilidade operacional?',
    category: '5S & Padronização Avançada',
    options: [
      'Sequência exata dos passos operacionais, Tempo de Ciclo / Takt Time, Estoque Padrão em Processo (SWIP), Pontos Críticos de Qualidade e Alertas de Segurança com fotos reais',
      'Apenas a assinatura do diretor industrial e a data de emissão',
      'Texto corrido de 15 páginas sem imagens para evitar custos de impressão colorida',
      'A fórmula matemática de cálculo do ROI anual do equipamento',
      'A relação de fornecedores de matéria-prima homologados',
    ],
    correctOptionIndex: 0,
    explanation:
      'Os três pilares técnicos do Trabalho Padronizado Toyota são: Takt Time, Sequência de Trabalho Padrão e Estoque Padrão em Processo (SWIP), combinados com alertas de segurança e qualidade.',
  },
  {
    id: 15,
    question:
      'O 5º Senso (Shitsuke - Autodisciplina e Sustentabilidade) é auditado e sustentado no chão de fábrica principalmente por meio de:',
    category: '5S & Padronização Avançada',
    options: [
      'Punições disciplinares automáticas comunicadas por alto-falante',
      'Auditorias escalonadas por camadas de liderança (Kamishibai / LPA), quadros de gestão à vista e feedback formativo contínuo',
      'Premiação em dinheiro para quem não utilizar o banheiro no turno',
      'Instalação de cancelas com biometria nos corredores da fábrica',
      'Suspensão de reuniões diárias de 5 minutos',
    ],
    correctOptionIndex: 1,
    explanation:
      'O sistema Kamishibai (quadro de auditoria visual por camadas) e as Auditorias por Processo em Camadas (LPA) garantem a sustentabilidade do padrão sem coerção punitiva.',
  },

  // 16 a 20: Poka-Yoke & Jidoka
  {
    id: 16,
    question:
      'Em uma prensa de estampagem, uma peça pode ser inserida invertida pelo operador, gerando colisão do estampo e prejuízo de R$ 40.000. Qual solução de Poka-Yoke atinge o nível mais elevado de confiabilidade (Nível 1 - Prevenção na Origem)?',
    category: 'Poka-Yoke & Jidoka',
    options: [
      'Instalação de uma placa de aviso "ATENÇÃO: Não inverta a chapa"',
      'Modificação geométrica do gabarito com pinos guia assimétricos que tornam fisicamente impossível o fechamento da prensa caso a chapa esteja invertida',
      'Treinamento teórico de 2 horas sobre atenção e foco no trabalho',
      'Inspeção por amostragem de 1 peça a cada 50 na saída da prensa',
      'Substituição do operador a cada 30 minutos',
    ],
    correctOptionIndex: 1,
    explanation:
      'Poka-Yoke de Nível 1 (Design Mecânico Poka-Yoke) torna fisicamente impossível o erro acontecer, sendo 100% superior a avisos, treinamentos ou inspeções posteriores.',
  },
  {
    id: 17,
    question:
      'Qual é a diferença funcional entre os conceitos de "Jidoka" (Autonomação) e "Automação Simples" no contexto da manufatura enxuta?',
    category: 'Poka-Yoke & Jidoka',
    options: [
      'Automação simples apenas substitui o esforço físico; Jidoka dota a máquina de inteligência para parar automaticamente na detecção da primeira anomalia e chamar socorro (Andon)',
      'Jidoka significa que os robôs trabalham sem energia elétrica',
      'Automação simples é mais avançada e elimina a necessidade de controle de qualidade',
      'Não há diferença; são termos idênticos traduzidos do alemão',
      'Jidoka proíbe o uso de sensores fotoelétricos na fábrica',
    ],
    correctOptionIndex: 0,
    explanation:
      'Jidoka ("Automação com toque humano" / Ninben no aru Jidoka) confere à máquina a capacidade de distinguir condições normais de anormais, parando instantaneamente.',
  },
  {
    id: 18,
    question:
      'Ao acionar a corda ou botão de parada de linha do sistema "Andon", qual protocolo de liderança e suporte deve ser executado no chão de fábrica?',
    category: 'Poka-Yoke & Jidoka',
    options: [
      'O operador deve ser advertido por atrasar a produção diária',
      'O líder de equipe/suporte deve comparecer ao posto em menos de 1 Takt Time, aplicar contenção imediata, investigar o desvio no Gemba e retomar o fluxo seguro',
      'A fábrica inteira deve ser evacuada até o próximo turno',
      'O supervisor deve alterar a meta de produção do mês no sistema ERP',
      'A luz do Andon deve ser desligada sem verificar a causa para manter o indicador verde',
    ],
    correctOptionIndex: 1,
    explanation:
      'O Andon não serve para punir; é um chamado de socorro para que a liderança vá imediatamente ao Gemba e apoie o operador antes que o defeito se propague.',
  },
  {
    id: 19,
    question:
      'O dispositivo Poka-Yoke baseado no "Método do Valor Fixo" (Fixed-Value Method) caracteriza-se por:',
    category: 'Poka-Yoke & Jidoka',
    options: [
      'Garantir que um número exato pré-determinado de movimentos ou componentes (ex: 4 parafusos de uma bandeja kitting) seja consumido antes do ciclo ser liberado',
      'Manter o preço de venda do produto fixo por 12 meses',
      'Operar o motor em rotação fixa de 1.800 RPM',
      'Medir o peso do palete no final da expedição',
      'Exigir que o operador bata o ponto sempre no mesmo minuto',
    ],
    correctOptionIndex: 0,
    explanation:
      'O método do valor fixo valida a quantidade exata de ações ou itens consumidos no ciclo (ex: contagem de apertos por parafusadeira controlada).',
  },
  {
    id: 20,
    question:
      'Segundo Shigeo Shingo, o controle de qualidade zero defeitos (ZQC - Zero Quality Control) é atingido pela combinação de:',
    category: 'Poka-Yoke & Jidoka',
    options: [
      'Inspeção na Fonte (Poka-Yoke na origem) + Auto-inspeção imediata pelo operador + Feedback instantâneo do sistema',
      'Inspeção estatística no laboratório de qualidade após 7 dias de produção',
      'Aumento do lote de refugo tolerado para 5%',
      'Contratação de 1 auditor de qualidade para cada 2 operadores',
      'Eliminação total dos testes de bancada',
    ],
    correctOptionIndex: 0,
    explanation:
      'O modelo ZQC de Shigeo Shingo combina inspeção na fonte (verificar condições antes do processamento) com Poka-Yokes e feedback instantâneo.',
  },

  // 21 a 25: SMED & Engenharia de Setup
  {
    id: 21,
    question:
      'Em um projeto SMED (Troca Rápida de Ferramentas), o tempo de setup é cronometrado rigorosamente entre quais marcos operacionais?',
    category: 'SMED & Engenharia de Setup',
    options: [
      'Do momento em que a máquina é desligada até o momento em que a nova ferramenta é parafusada',
      'Desde a última peça boa produzida do lote anterior até a PRIMEIRA peça boa produzida na velocidade nominal do novo lote',
      'Do início do turno da manhã até o horário do almoço',
      'Apenas o tempo em que o ferramenteiro está com a chave de boca na mão',
      'Do momento em que a ordem de produção é impressa até a separação no estoque',
    ],
    correctOptionIndex: 1,
    explanation:
      'A definição internacional de setup no SMED vai da última peça boa do produto A até a primeira peça boa confirmada do produto B na cadência padrão.',
  },
  {
    id: 22,
    question:
      'Na Fase 2 do SMED, qual é a ação de maior impacto técnico para reduzir o tempo de máquina parada?',
    category: 'SMED & Engenharia de Setup',
    options: [
      'Contratar 4 operadores adicionais para empurrar o molde',
      'Converter atividades de Setup Interno (feitas com máquina parada) em Setup Externo (preparadas com a máquina ainda operando o lote anterior)',
      'Substituir o óleo do cárter durante o setup',
      'Aumentar o tamanho do lote de produção para evitar setups frequentes',
      'Comprar uma prensa nova idêntica',
    ],
    correctOptionIndex: 1,
    explanation:
      'A conversão de Setup Interno em Externo (pré-aquecimento, pré-montagem, alinhamento prévio) é o coração da redução drástica de tempo de parada no SMED.',
  },
  {
    id: 23,
    question:
      'Durante o setup de uma linha de extrusão, o preparador gasta 22 minutos girando parafusos de rosca longa com chave fixa. Qual contramedida SMED de Classe Mundial elimina esse tempo?',
    category: 'SMED & Engenharia de Setup',
    options: [
      'Substituir por fixadores rápidos de 1/4 de volta, grampos pneumáticos, calços em U e roscas interrompidas (Fixação de Um Toque)',
      'Utilizar parafusos com o dobro do comprimento para dar mais segurança',
      'Soldar a matriz definitivamente na mesa da máquina',
      'Treinar o preparador para girar a chave duas vezes mais rápido',
      'Aumentar o torque de aperto em 50%',
    ],
    correctOptionIndex: 0,
    explanation:
      'O SMED preconiza mecanismos de fixação rápida (clamping de um toque, porcas em U, cunhas e travas de 90°), onde apenas a última volta de torque realiza o aperto.',
  },
  {
    id: 24,
    question:
      'Um dos maiores vilões do setup é o tempo gasto com "Ajustes e Tentativas" (trial and error) para acertar a primeira peça. Como o SMED elimina os ajustes?',
    category: 'SMED & Engenharia de Setup',
    options: [
      'Através de padrões numéricos fixos, gabaritos de calibração prévia, batentes mecânicos fixos e marcações visuais padronizadas (Princípio da Menor Graduação)',
      'Produzindo 100 peças de teste e descartando-as como refugo de rotina',
      'Aumentando a tolerância do desenho técnico do cliente',
      'Pedindo para o operador mais experiente fazer o ajuste "de ouvido"',
      'Desligando o controle de temperatura do processo',
    ],
    correctOptionIndex: 0,
    explanation:
      'Ajustes são frutos de incerteza e graduação contínua. Ao usar batentes fixos, pinos de centralização e calços padronizados, o ajuste é eliminado e a primeira peça já sai perfeita.',
  },
  {
    id: 25,
    question:
      'Qual é o impacto estratégico direto da redução do tempo de setup de 90 minutos para 8 minutos em uma fábrica que adota a filosofia Lean?',
    category: 'SMED & Engenharia de Setup',
    options: [
      'Permite produzir em lotes pequenos com alta frequência de trocas (mix flexível), reduzindo drasticamente o Lead Time e o estoque em processo (WIP) sem perda de capacidade',
      'Obriga a fábrica a demitir os preparadores de máquina',
      'Aumenta o consumo de ar comprimido da estamparia',
      'Elimina a necessidade de ordens de serviço de manutenção preventiva',
      'Reduz a vida útil dos estampos e moldes',
    ],
    correctOptionIndex: 0,
    explanation:
      'O objetivo supremo do SMED não é apenas ganhar tempo de máquina, mas viabilizar a produção de pequenos lotes (fluxo puxado flexível) sem penalizar a capacidade produtiva.',
  },

  // 26 a 30: VSM & Fluxo Contínuo
  {
    id: 26,
    question:
      'No Mapeamento do Fluxo de Valor (VSM), a "Linha do Tempo" desenhada na base do mapa divide o fluxo em duas linhas de dados. O que elas comparam?',
    category: 'VSM & Fluxo Contínuo',
    options: [
      'A linha superior representa o Tempo de Espera em Estoque (Lead Time / Não Valor Agregado) e a linha inferior representa o Tempo de Ciclo de Processamento (Valor Agregado)',
      'O horário de entrada e saída dos turnos de trabalho',
      'O consumo de eletricidade na ponta vs fora de ponta',
      'A idade das máquinas vs o custo de manutenção',
      'A quantidade de operadores contratados vs demitidos',
    ],
    correctOptionIndex: 0,
    explanation:
      'A escala temporal (Sawtooth Timeline) do VSM compara visualmente os dias de Lead Time retidos em estoques (dentes altos) contra os segundos de valor agregado efetivo (dentes baixos).',
  },
  {
    id: 27,
    question:
      'Em uma cadeia de valor com 3 processos sequenciais (Corte, Dobra e Solda), os estoques entre os processos são de 4.000 peças no total. Se o consumo diário do cliente é de 500 peças/dia, qual é o Lead Time retido em estoque?',
    category: 'VSM & Fluxo Contínuo',
    options: [
      '8,0 dias de produção retidos',
      '0,8 dias de produção retidos',
      '4,0 dias de produção retidos',
      '12,5 dias de produção retidos',
      '2,0 dias de produção retidos',
    ],
    correctOptionIndex: 0,
    explanation:
      'Lead Time de Estoque = Quantidade de Peças em Estoque ÷ Demanda Diária do Cliente = 4.000 peças ÷ 500 peças/dia = 8,0 dias.',
  },
  {
    id: 28,
    question:
      'No desenho do VSM de Estado Futuro, o conceito de "Processo Marcapasso" (Pacemaker Process) define:',
    category: 'VSM & Fluxo Contínuo',
    options: [
      'O único ponto no fluxo de valor onde a programação da produção é programada diretamente pelo cliente e a partir do qual todo o fluxo a montante é puxado',
      'A máquina mais rápida da fábrica que dita o ritmo de todas as outras',
      'O relógio de ponto da portaria da fábrica',
      'O setor de contabilidade financeira da matriz',
      'A esteira transportadora mais longa do galpão',
    ],
    correctOptionIndex: 0,
    explanation:
      'O processo marcapasso (geralmente o mais próximo do cliente final) recebe o sequenciamento da produção e puxa os processos anteriores via supermercados ou fluxo contínuo.',
  },
  {
    id: 29,
    question:
      'Ao transformar um layout tradicional departamental (ilhas de máquinas) em uma "Célula de Manufatura em Formato U", qual benefício ergonômico e de fluxo é maximizado?',
    category: 'VSM & Fluxo Contínuo',
    options: [
      'Aproxima a entrada e saída de materiais, reduz o trajeto de caminhada do operador multifuncional e facilita o balanceamento flexível com variação de operadores (Shojinka)',
      'Aumenta o espaço necessário para empilhadeiras circularem dentro da célula',
      'Exige que todos os operadores trabalhem sentados sem movimentação',
      'Permite acumular 20 dias de estoque dentro da célula',
      'Dificulta a comunicação visual entre os membros da equipe',
    ],
    correctOptionIndex: 0,
    explanation:
      'Células em U encurtam as distâncias, viabilizam operadores multifuncionais que atendem múltiplos postos e permitem ajustar o número de trabalhadores conforme a oscilação da demanda (Shojinka).',
  },
  {
    id: 30,
    question:
      'Em um fluxo de produção de alta complexidade, a criação de "Supermercados FIFO" (First-In, First-Out com pistas gravitacionais limitadas) tem como função precípua:',
    category: 'VSM & Fluxo Contínuo',
    options: [
      'Garantir que a ordem cronológica de produção seja mantida sem misturar lotes e travar fisicamente a produção a montante ao atingir o limite máximo de peças (Chokan)',
      'Armazenar produtos vencidos para auditoria anual',
      'Permitir que operadores escolham qual lote preferem montar primeiro',
      'Substituir o almoxarifado de matérias-primas brutas',
      'Aumentar o tempo de fila das ordens de produção',
    ],
    correctOptionIndex: 0,
    explanation:
      'O fluxo FIFO com capacidade física limitada conecta processos onde o fluxo contínuo peça a peça não é possível, impedindo ultrapassagens e contendo a superprodução.',
  },

  // 31 a 35: TPM, Confiabilidade & OEE
  {
    id: 31,
    question:
      'Uma máquina operou durante um turno de 8 horas (480 minutos). Houve 60 minutos de paradas não programadas por quebra e setup. A máquina produziu 350 peças, das quais 35 foram refugadas na inspeção. Se a velocidade nominal padrão é de 1 peça por minuto (60 peças/h), calcule a Disponibilidade, Desempenho, Qualidade e o OEE final:',
    category: 'TPM, Confiabilidade & OEE',
    options: [
      'Disponibilidade = 87,5%; Desempenho = 83,3%; Qualidade = 90,0%; OEE = 65,6%',
      'Disponibilidade = 95,0%; Desempenho = 90,0%; Qualidade = 95,0%; OEE = 81,2%',
      'Disponibilidade = 80,0%; Desempenho = 80,0%; Qualidade = 80,0%; OEE = 51,2%',
      'Disponibilidade = 90,0%; Desempenho = 85,0%; Qualidade = 92,0%; OEE = 70,4%',
      'Disponibilidade = 100%; Desempenho = 70,0%; Qualidade = 90,0%; OEE = 63,0%',
    ],
    correctOptionIndex: 0,
    explanation:
      'Tempo de Operação = 480 - 60 = 420 min. Disponibilidade = 420/480 = 87,5% (0,875). Capacidade em 420 min = 420 peças. Produziu 350 peças -> Desempenho = 350/420 = 83,33% (0,8333). Peças boas = 350 - 35 = 315 peças -> Qualidade = 315/350 = 90,0% (0,90). OEE = 0,875 × 0,8333 × 0,90 = 65,6%.',
  },
  {
    id: 32,
    question:
      'Na estratificação das "6 Grandes Perdas do OEE", as microparadas (paradas menores que 5 minutos) e o funcionamento em velocidade reduzida afetam diretamente qual dos três fatores?',
    category: 'TPM, Confiabilidade & OEE',
    options: [
      'Desempenho (Performance Rate)',
      'Disponibilidade (Availability Rate)',
      'Qualidade (Quality Rate)',
      'Custo de Depreciação Contábil',
      'Consumo de Água Industrial',
    ],
    correctOptionIndex: 0,
    explanation:
      'Microparadas e velocidade reduzida são perdas crônicas de Desempenho (Performance), muitas vezes invisíveis aos relatórios manuais tradicionais.',
  },
  {
    id: 33,
    question:
      'Em Engenharia de Manutenção Confiabilística, a métrica MTBF (Mean Time Between Failures) e a métrica MTTR (Mean Time To Repair) devem evoluir em quais direções para demonstrar o sucesso da TPM?',
    category: 'TPM, Confiabilidade & OEE',
    options: [
      'O MTBF deve aumentar continuamente (maior tempo entre quebras) e o MTTR deve diminuir continuamente (menor tempo para diagnosticar e reparar)',
      'Ambos devem diminuir até atingir zero',
      'O MTBF deve diminuir e o MTTR deve aumentar para justificar novos investimentos',
      'Ambos devem se manter exatamente iguais em 24 horas',
      'O MTBF só se aplica a instalações prediais de ar condicionado',
    ],
    correctOptionIndex: 0,
    explanation:
      'Confiabilidade de excelência significa maximizar o tempo em que a máquina opera sem falhas (MTBF alto) e minimizar a duração de qualquer intervenção corretiva (MTTR baixo).',
  },
  {
    id: 34,
    question:
      'A sistemática do "Quadro de Etiquetas TPM" (Etiquetas Vermelhas e Azuis) aplicada na Manutenção Autônoma estabelece que:',
    category: 'TPM, Confiabilidade & OEE',
    options: [
      'Etiquetas Vermelhas identificam anomalias que exigem intervenção técnica especializada de manutenção mecânica/elétrica; Etiquetas Azuis identificam anomalias sanáveis pelo próprio operador capacitado',
      'Etiquetas Vermelhas indicam que o operador deve ser demitido',
      'Etiquetas Azuis são exclusivas para equipamentos novos com garantia de fábrica',
      'Ambas as etiquetas servem apenas para controle de patrimônio contábil',
      'Etiquetas Vermelhas devem ser preenchidas apenas pelo setor financeiro',
    ],
    correctOptionIndex: 0,
    explanation:
      'Na TPM, a etiqueta vermelha sinaliza pendência para a manutenção especializada e a azul demarca anomalias que o próprio operador da célula resolve na rotina autônoma.',
  },
  {
    id: 35,
    question:
      'Qual é o papel da "Lição Ponto a Ponto" (LPP / One Point Lesson) no pilar de Educação & Treinamento da TPM?',
    category: 'TPM, Confiabilidade & OEE',
    options: [
      'Documento visual de 1 página, focado em 1 único tópico específico (segurança, limpeza, lubrificação ou falha típica), transmitido em 5 a 10 minutos no próprio posto de trabalho',
      'Manual encadernado de 300 páginas para arquivo no RH',
      'Prova escrita semestral de múltipla escolha',
      'Contrato formal de prestação de serviços com terceiros',
      'Planilha orçamentária para aprovação de CAPEX',
    ],
    correctOptionIndex: 0,
    explanation:
      'A LPP é uma ferramenta ágil de transferência de conhecimento prático no Gemba, ensinando conceitos e procedimentos em menos de 10 minutos de forma visual.',
  },

  // 36 a 40: PDCA & Causalidade Científica
  {
    id: 36,
    question:
      'Em uma análise causal de quebra de eixo de prensa, o grupo apontou: "Causa: Falha humana por distração do operador". Sob o rigor da metodologia dos 5 Porquês e do Lean, por que essa conclusão é inaceitável?',
    category: 'PDCA & Causalidade Científica',
    options: [
      'Porque "erro humano" é apenas um sintoma superficial; a análise deve aprofundar nos porquês subsequentes até identificar a falha no sistema de gestão, método, ausência de Poka-Yoke ou deficiência no Trabalho Padronizado',
      'Porque os operadores nunca cometem erros no chão de fábrica',
      'Porque a culpa deve ser atribuída exclusivamente ao fabricante do aço',
      'Porque a metodologia dos 5 Porquês proíbe investigar pessoas',
      'Porque quebras de eixo são eventos aleatórios imprevisíveis',
    ],
    correctOptionIndex: 0,
    explanation:
      'O Lean rejeita a culpabilização individual. Erros humanos ocorrem porque o sistema permitiu a ocorrência ou não forneceu barreiras à prova de falhas (Poka-Yoke / POP).',
  },
  {
    id: 37,
    question:
      'Ao construir um Diagrama de Causa e Efeito (Ishikawa 6M) para investigar porosidade em solda MIG, a falta de aferição semestral do manômetro de vazão do gás de proteção deve ser classificada em qual categoria?',
    category: 'PDCA & Causalidade Científica',
    options: [
      'Medição (Instrumentos de aferição, calibração e critérios de inspeção)',
      'Meio Ambiente',
      'Mão de Obra',
      'Matéria-Prima',
      'Método de Vendas',
    ],
    correctOptionIndex: 0,
    explanation:
      'O ramo "Medição" abrange instrumentos, sensores, manômetros, tolerâncias de calibração e métodos de aferição.',
  },
  {
    id: 38,
    question:
      'Na execução do ciclo PDCA, qual é a finalidade precípua do "Relatório A3 de Solução de Problemas"?',
    category: 'PDCA & Causalidade Científica',
    options: [
      'Sintetizar em uma única folha A3 todo o raciocínio lógico científico de diagnóstico (Estado Atual, 5 Porquês, Ishikawa), plano de ação 5W2H, validação de resultados e padronização Yokoten',
      'Imprimir um relatório contábil de fechamento fiscal para o governo',
      'Substituir a ficha de registro de funcionários',
      'Arquivar notas fiscais de compra de máquinas',
      'Desenhar plantas arquitetônicas civis da fábrica',
    ],
    correctOptionIndex: 0,
    explanation:
      'O Relatório A3 da Toyota é a ferramenta de pensamento gerencial que condensa todo o ciclo PDCA em uma narrativa lógica, visual e objetiva.',
  },
  {
    id: 39,
    question:
      'Após a implementação de um plano de ação (Fase DO), o indicador de refugo caiu de 4,2% para 0,3%. Na fase CHECK do PDCA, qual técnica estatística garante que a melhoria é estatisticamente estável e não uma oscilação sazonal?',
    category: 'PDCA & Causalidade Científica',
    options: [
      'Carta de Controle Estatístico de Processo (CEP / Gráfico X-Barra R ou Gráfico p) com monitoramento dos limites superior e inferior de controle ao longo do tempo',
      'Pesquisa de opinião verbal com 3 operadores no corredor',
      'Cálculo da média aritmética simples dos últimos 2 dias apenas',
      'Comparação com a tabela de preços do concorrente',
      'Extrapolação teórica por intuição do engenheiro',
    ],
    correctOptionIndex: 0,
    explanation:
      'Cartas de Controle (SPC / CEP) monitoram se o processo atingiu estabilidade estatística e se as causas especiais de variação foram definitivamente erradicadas.',
  },
  {
    id: 40,
    question:
      'Qual é a diferença essencial entre uma "Ação de Contenção Imediata" e uma "Ação Corretiva Definitiva no PDCA"?',
    category: 'PDCA & Causalidade Científica',
    options: [
      'A contenção apenas estanca o sintoma para proteger o cliente imediato (ex: segregação de lote suspeito); a ação corretiva elimina a Causa Raiz para que o problema nunca mais volte a ocorrer',
      'A contenção custa mais caro que a ação corretiva',
      'A ação corretiva é aplicada antes do problema acontecer e a contenção depois',
      'Contenção só é utilizada em indústrias químicas',
      'Não há diferença entre os dois conceitos no Lean',
    ],
    correctOptionIndex: 0,
    explanation:
      'Contenção é o curativo imediato para impedir que peças defeituosas cheguem ao cliente; Ação Corretiva atua na Causa Raiz para garantir não-reincidência permanente.',
  },

  // 41 a 45: Engenharia Financeira & ROI Lean
  {
    id: 41,
    question:
      'Um projeto Kaizen reduziu o tempo de ciclo de uma célula de 90s para 60s em uma operação de 2 operadores. A produção anual é de 240.000 peças. Considerando um Custo Homem-Hora fabril de R$ 45,00/h, qual é a economia anual bruta de Custo Evitado em Mão de Obra direta?',
    category: 'Engenharia Financeira & ROI Lean',
    options: [
      'R$ 180.000,00 por ano (4.000 horas homem economizadas)',
      'R$ 90.000,00 por ano',
      'R$ 360.000,00 por ano',
      'R$ 45.000,00 por ano',
      'R$ 120.000,00 por ano',
    ],
    correctOptionIndex: 0,
    explanation:
      'Economia por peça = 30 segundos. Para 2 operadores = 60 segundos-homem = 1 minuto-homem por peça. Em 240.000 peças = 240.000 minutos = 4.000 horas-homem economizadas. Economia = 4.000 h × R$ 45,00/h = R$ 180.000,00/ano.',
  },
  {
    id: 42,
    question:
      'Em um projeto Kaizen de automação de baixo custo (Karakuri), investiu-se R$ 25.000,00 em perfilados, roletes e sensores. O ganho anual consolidado em perdas eliminadas é de R$ 125.000,00. Qual é o ROI do 1º ano e o Payback simples em meses?',
    category: 'Engenharia Financeira & ROI Lean',
    options: [
      'ROI = 400%; Payback = 2,4 meses',
      'ROI = 500%; Payback = 1,2 meses',
      'ROI = 300%; Payback = 4,0 meses',
      'ROI = 100%; Payback = 12 meses',
      'ROI = 250%; Payback = 6,0 meses',
    ],
    correctOptionIndex: 0,
    explanation:
      'Lucro Líquido = 125.000 - 25.000 = R$ 100.000. ROI = (100.000 ÷ 25.000) × 100 = 400%. Ganho mensal = 125.000 ÷ 12 = R$ 10.416,67. Payback = 25.000 ÷ 10.416,67 = 2,4 meses.',
  },
  {
    id: 43,
    question:
      'O "Custo da Não Qualidade" (COPQ - Cost of Poor Quality) é dividido em 4 categorias de acordo com a metodologia de Feigenbaum e Juran. Quais são elas?',
    category: 'Engenharia Financeira & ROI Lean',
    options: [
      'Custos de Prevenção, Custos de Avaliação, Falhas Internas (refugo/retrabalho) e Falhas Externas (garantia/devolução)',
      'Custos de Combustível, Custos de Energia, Salários e Aluguel',
      'Custos Fixos, Custos Variáveis, Impostos e Taxas de Câmbio',
      'Custos Diretos, Custos Indiretos, Lucro Presumido e Dividendos',
      'Custos de Marketing, Vendas, TI e Recursos Humanos',
    ],
    correctOptionIndex: 0,
    explanation:
      'O modelo PAF clássico divide os custos de qualidade em Prevenção (Kaizen/Poka-Yoke), Avaliação (inspeção), Falhas Internas (sucata) e Falhas Externas (recall/devoluções).',
  },
  {
    id: 44,
    question:
      'No demonstrativo financeiro industrial (DRE das Perdas Lean), por que a redução de estoque de matéria-prima e produtos acabados gera ganho financeiro imediato além do valor físico do material?',
    category: 'Engenharia Financeira & ROI Lean',
    options: [
      'Porque reduz o "Custo de Carregamento de Estoque" (Holding Cost: juros sobre capital de giro, seguros, espaço físico de armazenagem, risco de obsolescência, avarias e movimentação)',
      'Porque aumenta a alíquota de imposto de renda da empresa',
      'Porque obriga a contratação de novos auditores contábeis',
      'Porque o estoque parado valoriza automaticamente acima da inflação',
      'Porque elimina a necessidade de pagar fornecedores',
    ],
    correctOptionIndex: 0,
    explanation:
      'O custo de manter estoque (Holding Cost) gira entre 15% e 25% do valor do estoque ao ano devido a capital retido, perdas, espaço e manuseio.',
  },
  {
    id: 45,
    question:
      'O conceito de "Karakuri Kaizen" (mecanismos simples de baixo custo acionados por gravidade e contrapesos) é preferível a robôs complexos em projetos de produtividade porque:',
    category: 'Engenharia Financeira & ROI Lean',
    options: [
      'Apresenta investimento inicial quase nulo, zero consumo elétrico, manutenção simples compreendida pelos próprios operadores e Payback quase instantâneo',
      'É mais barulhento e impressiona os clientes em visitas à fábrica',
      'Exige programação em linguagem Python de alta complexidade',
      'Substitui a necessidade de esteiras motorizadas em 100% dos galpões',
      'Gera créditos de carbono na bolsa de valores',
    ],
    correctOptionIndex: 0,
    explanation:
      'Karakuri utiliza princípios de física pura (alavancas, pêndulos, gravidade) para automação barata, segura, confiável e de fácil manutenção interna.',
  },

  // 46 a 50: Kanban, Supermercados & Heijunka
  {
    id: 46,
    question:
      'No cálculo da quantidade ótima de cartões Kanban em um circuito puxado, qual fórmula matemática de Engenharia de Produção determina o número de cartões (N)?',
    category: 'Kanban, Supermercados & Heijunka',
    options: [
      'N = [Demanda Diária (D) × Lead Time de Reposição (L) × (1 + Fator de Segurança α)] ÷ Capacidade do Contentor (C)',
      'N = Faturamento Mensal ÷ Número de Operadores',
      'N = Área da Fábrica (m²) ÷ Quantidade de Máquinas',
      'N = Estoque Máximo × 100',
      'N = Quantidade de Horas Extras ÷ Takt Time',
    ],
    correctOptionIndex: 0,
    explanation:
      'A equação dimensional padrão de dimensionamento Kanban é N = [D × L × (1 + α)] / C, garantindo o abastecimento exato do consumo durante o Lead Time de ressuprimento.',
  },
  {
    id: 47,
    question:
      'Em uma fábrica com demanda mensal de 3 produtos: A (60%), B (30%) e C (10%), qual estratégia de "Heijunka" (Nivelamento de Produção) atinge a maior estabilidade de fluxo?',
    category: 'Kanban, Supermercados & Heijunka',
    options: [
      'Produzir em pequenos lotes diários sequenciados na proporção exata da demanda (ex: A-A-A-B-A-A-B-C repetidamente em cada turno)',
      'Produzir todo o volume de A nos primeiros 18 dias do mês, depois B por 9 dias e C nos últimos 3 dias',
      'Produzir apenas o produto com maior margem de lucro e cancelar os outros dois',
      'Parar a linha sempre que o cliente solicitar o produto C',
      'Aumentar o lote mínimo de fabricação para 100.000 unidades de cada produto',
    ],
    correctOptionIndex: 0,
    explanation:
      'Heijunka divide a produção em lotes diários repetitivos proporcionais ao mix (EPEI - Every Part Every Interval), evitando picos de estoque e sobrecargas.',
  },
  {
    id: 48,
    question:
      'Qual é a diferença operacional entre um "Kanban de Produção" e um "Kanban de Movimentação/Transporte" no chão de fábrica?',
    category: 'Kanban, Supermercados & Heijunka',
    options: [
      'O Kanban de Produção autoriza a máquina a fabricar um novo lote de peças para repor o supermercado; o Kanban de Transporte autoriza o abastecedor (Mizusumashi) a mover materiais do fornecedor interno para a linha de uso',
      'O Kanban de Produção é impresso em papel e o de Transporte é obrigatoriamente digital',
      'O Kanban de Transporte só é utilizado fora da fábrica em caminhões rodoviários',
      'O Kanban de Produção é exclusivo para a diretoria executiva',
      'Ambos os cartões servem para o mesmo objetivo sem qualquer distinção',
    ],
    correctOptionIndex: 0,
    explanation:
      'O Kanban de Produção comanda a fabricação no processo fornecedor e o Kanban de Transporte (ou Retirada) autoriza a movimentação física de reposição.',
  },
  {
    id: 49,
    question:
      'A figura do "Mizusumashi" (Abastecedor de Trem de Rota Fixa / Water Spider) tem como missão fundamental na célula Lean:',
    category: 'Kanban, Supermercados & Heijunka',
    options: [
      'Abastecer ciclicamente todos os postos de trabalho com kits de materiais e recolher produtos acabados em rotas cronometradas, permitindo que os operadores de valor agregado nunca abandonem seu posto',
      'Limpar os banheiros e o piso durante o intervalo de produção',
      'Fiscalizar se os operadores estão conversando durante o turno',
      'Realizar a manutenção mecânica pesada das prensas',
      'Substituir o supervisor de produção nas reuniões de diretoria',
    ],
    correctOptionIndex: 0,
    explanation:
      'O Water Spider realiza todas as tarefas auxiliares externas de logística e abastecimento, mantendo os operadores focados 100% no trabalho de valor agregado.',
  },
  {
    id: 50,
    question:
      'A maturidade máxima de uma organização que vivencia a Cultura Lean (True North / Norte Verdadeiro) é caracterizada por:',
    category: 'Fundamentos TPS & Lean',
    options: [
      'Uma organização orientada ao desenvolvimento contínuo de pessoas com mentalidade científica (Kaizen Mindset), onde cada colaborador é capacitado para identificar desvios do padrão e solucionar problemas na causa raiz diariamente rumo ao fluxo perfeito de valor',
      'Atingir 100% de automação sem presença de colaboradores no chão de fábrica',
      'Possuir os maiores armazéns de estoque do setor industrial',
      'Manter os mesmos procedimentos operacionais inalterados por mais de 20 anos',
      'Priorizar o corte de custos demitindo os funcionários mais experientes',
    ],
    correctOptionIndex: 0,
    explanation:
      'O objetivo supremo do Lean é transformar a empresa em uma organização que aprende continuamente (Learning Organization), desenvolvendo pessoas autônomas que buscam a perfeição operacional e o respeito humano.',
  },
];
