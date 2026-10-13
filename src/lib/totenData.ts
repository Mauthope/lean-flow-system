export interface TotenPill {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  color: 'cyan' | 'blue' | 'emerald' | 'amber' | 'purple';
  content: string;
  actionText?: string;
  tip: string;
}

export interface DynamicHookOption {
  text: string;
  reactionSpeech: string;
  methodologyIntro: string;
  recommendedPillId: string;
}

export interface DynamicHook {
  id: string;
  calloutSpeech: string;
  title: string;
  badge: string;
  question: string;
  options: DynamicHookOption[];
}

export const IDLE_PHRASES: string[] = [
  "Cadê todo mundo? O Sensei está procurando talentos Kaizen no turno.",
  "Varrendo o ambiente operacional em busca de novas oportunidades.",
  "Alguém aí pronto para eliminar desperdícios hoje?",
  "Detectando oportunidades de melhoria contínua e 5S no posto.",
  "Aproxime-se do toten para registrar sua ideia de melhoria.",
  "Procurando os campeões de produtividade e segurança do chão de fábrica.",
  "Um pequeno passo hoje, um grande salto amanhã. Venha conversar com o Sensei.",
  "Sensores ativos: pronto para ouvir as ideias de quem faz a fábrica rodar."
];

export const DYNAMIC_HOOKS: DynamicHook[] = [
  {
    id: 'ferramenta-sumida',
    calloutSpeech: 'Atenção, companheiro! Pare dez segundos, o Sensei precisa te fazer uma pergunta rápida do turno.',
    title: 'O Mistério da Ferramenta Sumida',
    badge: 'Produtividade no Turno',
    question: 'No seu dia a dia na fábrica, o que mais te faz perder tempo e paciência?',
    options: [
      {
        text: 'Procurar ferramentas sumidas no setor',
        reactionSpeech: 'É exatamente por isso que o 5S foi criado! Se cada ferramenta tiver seu lugar certo, você nunca mais perde tempo caçando nada!',
        methodologyIntro: 'No Japão, a metodologia 5S nasceu na Toyota justamente para acabar com o tempo perdido procurando materiais. Cada minuto caçando uma chave é cansaço inútil.',
        recommendedPillId: 'os-5s'
      },
      {
        text: 'Esperar material ou ordens de produção atrasadas',
        reactionSpeech: 'Isso no Kaizen se chama Desperdício de Espera! É um dos oito grandes ladrões de produtividade da indústria!',
        methodologyIntro: 'No Lean Manufacturing, o tempo de espera parado é chamado de Muda de Espera. O Kaizen ensina a sincronizar os processos para que tudo flua sem gargalos.',
        recommendedPillId: '8-desperdicios'
      },
      {
        text: 'Ter que refazer peça que deu defeito ou refugo',
        reactionSpeech: 'Retrabalho é cansativo e frustrante! O Kaizen ensina a criar travas à prova de erros para que o defeito nunca mais aconteça!',
        methodologyIntro: 'Para eliminar retrabalho, o Kaizen utiliza o Poka-Yoke: dispositivos inteligentes que impedem fisicamente que o erro humano ocorra.',
        recommendedPillId: 'poka-yoke'
      },
      {
        text: 'Ficar andando para lá e para cá sem necessidade',
        reactionSpeech: 'Desperdício de movimentação inútil! Reorganizando o posto de trabalho, você cansa menos o corpo e produz muito mais!',
        methodologyIntro: 'O desperdício de movimentação cansa as pernas e a coluna sem gerar nenhum valor real. O Kaizen aproxima as ferramentas da mão do operador.',
        recommendedPillId: '8-desperdicios'
      }
    ]
  },
  {
    id: 'teste-surpresa',
    calloutSpeech: 'Alto lá, operador! O Sensei te flagrou no radar! Me responda com sinceridade:',
    title: 'O Teste da Bancada',
    badge: 'Organização 5S',
    question: 'Se a diretoria ou o cliente fizesse uma auditoria surpresa no seu posto agora, como estaria?',
    options: [
      {
        text: 'Brilhando e 100% no padrão operacional',
        reactionSpeech: 'Sensacional, parabéns! Você já tem o espírito Shitsuke de autodisciplina do 5S! Que tal um desafio prático?',
        methodologyIntro: 'Manter o posto impecável mesmo na correria é o 5º senso do 5S: Shitsuke (Autodisciplina). Você é um exemplo de Melhoria Contínua.',
        recommendedPillId: 'os-5s'
      },
      {
        text: 'Tem coisa fora do lugar, mas na correria eu me acho',
        reactionSpeech: 'Cuidado com o eu me acho! A regra de ouro do Kaizen é: qualquer colega deve achar qualquer item no seu posto em até 30 segundos!',
        methodologyIntro: 'O Kaizen prega a gestão visual: se você precisar se ausentar, o colega do próximo turno precisa encontrar tudo sem estresse e sem atrasos.',
        recommendedPillId: 'os-5s'
      },
      {
        text: 'Melhor nem olharem muito de perto por enquanto',
        reactionSpeech: 'Sem pânico! O primeiro passo do Kaizen é o Seiri: separar o que é útil do que é desnecessário e liberar espaço na bancada!',
        methodologyIntro: 'Acúmulo de coisas inúteis gera confusão mental e riscos de segurança. Aplicando o Seiri (Descarte Consciente), seu trabalho fica muito mais leve.',
        recommendedPillId: 'os-5s'
      },
      {
        text: 'Depende muito da correria e do ritmo do dia',
        reactionSpeech: 'A pressa não pode atropelar a segurança e o padrão! O Kaizen ensina a padronizar para não virar desorganização nos picos de produção!',
        methodologyIntro: 'Quando há padronização (Seiketsu), a velocidade da fábrica aumenta naturalmente, sem necessidade de correria desorganizada.',
        recommendedPillId: 'o-que-e-kaizen'
      }
    ]
  },
  {
    id: 'trabalho-inteligente',
    calloutSpeech: 'Atenção ao posto! Meus sensores detectaram um colaborador dedicado por aqui!',
    title: 'Inteligência versus Força Bruta',
    badge: 'Filosofia Kaizen',
    question: 'Você prefere fazer esforço dobrado ou encontrar um jeito mais esperto e leve de produzir?',
    options: [
      {
        text: 'Trabalhar com inteligência e método sempre',
        reactionSpeech: 'Falou a língua do Sensei! Kaizen é exatamente isso: usar a cabeça para poupar o corpo e eliminar trabalho braçal inútil!',
        methodologyIntro: 'Kaizen vem do japonês Kai (mudar) mais Zen (bom). Significa melhorar 1% todo dia para trabalhar com leveza e precisão máxima.',
        recommendedPillId: 'o-que-e-kaizen'
      },
      {
        text: 'Às vezes sinto que me esforço à toa no turno',
        reactionSpeech: 'Eu te entendo perfeitamente! Quando o método de trabalho é ruim, o esforço se perde. O Kaizen serve para consertar o processo!',
        methodologyIntro: 'No Lean, nunca culpamos o operador: consertamos o processo! Se o trabalho está pesado demais, há uma oportunidade de melhoria no Gemba.',
        recommendedPillId: 'gemba'
      },
      {
        text: 'Quero terminar o turno sem dor nas costas e sem fadiga',
        reactionSpeech: 'Ergonomia e 5S andam de mãos dadas! Pequenas melhorias na altura da bancada e no apoio de peças mudam a sua saúde!',
        methodologyIntro: 'A Melhoria Contínua cuida em primeiro lugar da saúde do trabalhador. Um posto ergonômico evita lesões e cansaço excessivo.',
        recommendedPillId: 'os-5s'
      },
      {
        text: 'Me ensine como fazer mais com menos cansaço',
        reactionSpeech: 'Vem com o Sensei! O segredo é eliminar os desperdícios que estão escondidos no dia a dia da linha!',
        methodologyIntro: 'Ao cortar os 8 desperdícios clássicos da manufatura, a produção flui com naturalidade, sem correria e sem sobrecarga física.',
        recommendedPillId: '8-desperdicios'
      }
    ]
  },
  {
    id: 'banco-de-ideias',
    calloutSpeech: 'Atenção, líder! Chega mais perto da tela! Você tem cara de quem tem boas ideias na manga!',
    title: 'A Voz de Quem Opera',
    badge: 'Cultura Gemba',
    question: 'Você já teve alguma ideia simples no trabalho que facilitaria a vida de todo mundo?',
    options: [
      {
        text: 'Já tive várias ideias excelentes no posto',
        reactionSpeech: 'É você quem a fábrica precisa ouvir! O Kaizen prega o Gemba: as soluções mais geniais vêm de quem está com a mão na massa!',
        methodologyIntro: 'No Japão, os líderes vão ao Gemba (o chão da fábrica) porque sabem que quem opera a máquina entende do problema melhor do que qualquer um.',
        recommendedPillId: 'gemba'
      },
      {
        text: 'Tenho uma sugestão de melhoria pronta agora',
        reactionSpeech: 'Não guarde essa ideia com você! Vamos registrá-la no Canal Kaizen agora mesmo!',
        methodologyIntro: 'Uma única sugestão simples de um colaborador pode economizar milhares de reais e evitar acidentes graves na empresa.',
        recommendedPillId: 'gemba'
      },
      {
        text: 'Nunca ninguém me perguntou isso antes',
        reactionSpeech: 'Pois o Sensei está perguntando! No Kaizen, toda voz tem valor, do operador iniciante à diretoria!',
        methodologyIntro: 'Cultura Kaizen é democrática e participativa. Pequenas melhorias diárias dadas por todos constroem uma empresa de classe mundial.',
        recommendedPillId: 'o-que-e-kaizen'
      },
      {
        text: 'Acho que as coisas já funcionam bem assim',
        reactionSpeech: 'Cuidado com a zona de conforto! No Kaizen, o lema é claro: hoje melhor que ontem, amanhã melhor que hoje!',
        methodologyIntro: 'Mesmo o melhor processo do mundo pode melhorar 1% amanhã. Essa é a essência da Melhoria Contínua.',
        recommendedPillId: 'o-que-e-kaizen'
      }
    ]
  }
];

export const TOTEN_KAIZEN_PILLS: TotenPill[] = [
  {
    id: 'o-que-e-kaizen',
    title: 'O que é Kaizen?',
    subtitle: 'Mudança para melhor • Melhoria Contínua',
    tag: 'Filosofia Base',
    color: 'cyan',
    content: 'Kaizen é um princípio industrial originário do Sistema Toyota de Produção. Significa melhorar continuamente todos os dias, todos os colaboradores, em todos os postos de trabalho.',
    tip: 'Pequenas melhorias diárias somam resultados gigantescos ao final de um ciclo anual.'
  },
  {
    id: 'os-5s',
    title: 'O Poder do 5S',
    subtitle: 'Organização, Limpeza e Disciplina',
    tag: 'Metodologia',
    color: 'emerald',
    content: '1. Seiri (Utilização e Descarte) • 2. Seiton (Organização e Lugar Certo) • 3. Seiso (Limpeza e Inspeção) • 4. Seiketsu (Padronização e Saúde) • 5. Shitsuke (Autodisciplina e Hábito).',
    tip: 'Um posto de trabalho 5S reduz acidentes, economiza tempo e gera conforto operacional.'
  },
  {
    id: '8-desperdicios',
    title: 'Os 8 Desperdícios (Muda)',
    subtitle: 'Identificar para eliminar da linha',
    tag: 'Lean Manufacturing',
    color: 'amber',
    content: '1. Superprodução • 2. Espera • 3. Transporte desnecessário • 4. Excesso de processamento • 5. Inventário em excesso • 6. Movimentação inútil • 7. Defeitos e retrabalho • 8. Potencial intelectual subutilizado.',
    tip: 'Observe ao seu redor: onde existe tempo parado ou movimentação desnecessária agora?'
  },
  {
    id: 'gemba',
    title: 'Vá ao Gemba!',
    subtitle: 'Onde o trabalho real acontece',
    tag: 'Liderança Ativa',
    color: 'blue',
    content: 'Gemba significa o local onde o valor é criado fisicamente. Não resolva problemas trancado em salas. Vá até a linha, converse com o operador e comprove a realidade na máquina.',
    tip: 'Os melhores diagnósticos e soluções surgem de quem opera a máquina diariamente.'
  },
  {
    id: 'poka-yoke',
    title: 'Poka-Yoke: À Prova de Falhas',
    subtitle: 'Dispositivos inteligentes no posto',
    tag: 'Qualidade Total',
    color: 'purple',
    content: 'Dispositivos mecânicos ou lógicos que impedem fisicamente que um erro operacional ocorra. Exemplo prático: guias e travas que só permitem encaixe na posição correta.',
    tip: 'Em vez de culpar as pessoas pelo erro, crie processos que tornem a falha impossível de acontecer.'
  }
];
