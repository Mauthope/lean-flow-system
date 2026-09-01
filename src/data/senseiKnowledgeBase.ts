// =============================================================================
// BASE DE CONHECIMENTO NEURAL DO SENSEI - LEAN MANUFACTURING & ENGENHARIA
// =============================================================================

export const SENSEI_KNOWLEDGE_BASE = `
# BASE DE CONHECIMENTO DO SENSEI (MESTRE LEAN MANUFACTURING)

## 1. FILOSOFIA LEAN & SISTEMA TOYOTA DE PRODUÇÃO (TPS)
- **Origem e Pilares**: Criado por Taiichi Ohno, Eiji Toyoda e Shigeo Shingo. Fundamentado em dois pilares:
  1. *Just-in-Time (JIT)*: Produzir apenas o que é necessário, quando necessário e na quantidade necessária (Takt Time, Fluxo Contínuo, Sistema Puxado/Kanban).
  2. *Jidoka (Autonomação)*: Automação com toque humano; parar a linha imediatamente ao detectar qualquer anomalia para evitar a passagem de defeitos (Poka-Yoke, Andon).
- **Tríade de Desvios (3M)**:
  - *Muda (Desperdício)*: Atividades que consomem recursos sem agregar valor percebido pelo cliente.
  - *Muri (Sobrecarga)*: Esforço excessivo imposto a operadores ou máquinas além dos limites seguros.
  - *Mura (Instabilidade / Variabilidade)*: Oscilações e irregularidades no fluxo de trabalho e na demanda.

## 2. OS 8 GRANDES DESPERDÍCIOS DA INDÚSTRIA (MUDA)
1. **Superprodução**: Produzir antes, mais rápido ou em maior quantidade que a etapa seguinte precisa. É o pior de todos os desperdícios porque esconde todos os demais.
2. **Espera**: Tempo ocioso de operadores aguardando materiais, instruções, manutenção ou ciclo automático de máquina.
3. **Transporte**: Movimentação desnecessária de matéria-prima, produtos em processo (WIP) ou acabados entre setores.
4. **Processamento Excessivo**: Realizar etapas, acabamentos ou retrabalhos que o cliente não solicitou nem paga por eles.
5. **Estoque Excessivo**: Matéria-prima, semiacabados ou produtos finais parados gerando custo de capital, obsolescência e ocupação de espaço fabril.
6. **Movimentação**: Movimentos ergonômicos inadequados dos operadores para buscar ferramentas, peças ou documentos (caminhadas, flexões, giros de corpo).
7. **Defeitos / Retrabalho**: Produção de peças não conformes que exigem reparo, sucata ou inspeções extras.
8. **Intelecto Subutilizado**: Não aproveitar as ideias, criatividade e sugestões de melhoria dos operadores que estão no chão de fábrica (Gemba).

## 3. METODOLOGIA PDCA & ESTRUTURAÇÃO DE PROBLEMAS
- **Fase Plan (Planejar)**:
  - *Declaração Formal do Problema*: Deve responder claramente: O que acontece? Onde acontece (posto/linha)? Quando ocorre? Qual é a magnitude/desvio atual em relação ao padrão? (Sem tentar adivinhar a causa raiz na declaração).
  - *5 Porquês*: Técnica de questionamento sucessivo para atravessar os sintomas superficiais até encontrar a falha fundamental do sistema de gestão ou processo. Cada porquê deve ter relação de causa e efeito comprovável no Gemba.
  - *Diagrama de Ishikawa (6M)*: Estratificação por Método, Máquina, Material, Mão de Obra, Medição e Meio Ambiente.
  - *Gráfico de Pareto (80/20)*: Priorização das causas vitais que respondem por 80% das perdas ou defeitos.
- **Fase Do (Executar)**:
  - *Plano de Ação 5W2H*: What (O quê), Why (Por quê), Where (Onde), When (Quando), Who (Quem), How (Como), How Much (Quanto custa).
  - *Testes em Posto Piloto*: Validação controlada antes do desdobramento em escala.
- **Fase Check (Verificar & Engenharia Econômica)**:
  - Comparação estrita de Indicador Antes (Baseline) vs Depois (Resultado Atingido).
- **Fase Act (Padronizar & Homologar)**:
  - *Trabalho Padronizado (POP / SOP)*: Registro visual, tempos padrão, sequência operatória e pontos de segurança.
  - *Yokoten (Replicação Lateral)*: Compartilhamento e aplicação do aprendizado em máquinas e setores irmãos.

## 4. ENGENHARIA ECONÔMICA & MATEMÁTICA FINANCEIRA INDUSTRIAL
- **Ganho Bruto Anual (Custo Evitado / Desperdício Eliminado)**:
  $$\text{Ganho Anual} = (\text{Perda Mensal Anterior} - \text{Perda Mensal Atual}) \times 12$$
- **Custo Total do Projeto**: Soma de materiais Kaizen, peças, dispositivos, serviços terceiros e horas de engenharia aplicadas.
- **Lucro Líquido Real (Primeiro Ano)**:
  $$\text{Lucro Líquido} = \text{Ganho Bruto Anual} - \text{Custo Total do Projeto}$$
- **ROI Industrial (Retorno sobre o Investimento)**:
  $$\text{ROI (\%)} = \left(\frac{\text{Lucro Líquido}}{\text{Investimento Total}}\right) \times 100$$
- **Payback Simples (Meses para Retorno do Capital)**:
  $$\text{Payback (meses)} = \frac{\text{Investimento Total}}{\text{Economia Mensal Gerada}}$$
- **Horas Produtivas Recuperadas**:
  $$\text{Horas/Ano} = \text{Minutos economizados por ciclo} \times \text{Ciclos anuais} \div 60$$

## 5. FERRAMENTAS AVANÇADAS DO LEAN
- **SMED (Single-Minute Exchange of Die)**: Redução de tempos de setup através da separação de atividades internas (máquina parada) e externas (máquina rodando), eliminação de ajustes e uso de fixações rápidas.
- **OEE (Overall Equipment Effectiveness)**:
  $$\text{OEE} = \text{Disponibilidade} \times \text{Desempenho} \times \text{Qualidade}$$
- **VSM (Value Stream Mapping)**: Mapeamento visual de todo o fluxo de materiais e informações, identificando tempo de agregação de valor vs tempo total de atravessamento (Lead Time).
- **Poka-Yoke**: Dispositivos mecânicos, elétricos ou sensores que tornam fisicamente impossível a ocorrência ou passagem de um erro operacional.
- **5S**: Seiri (Utilização), Seiton (Organização), Seiso (Limpeza), Seiketsu (Padronização), Shitsuke (Disciplina).

## 6. DIRETRIZES DE REVISÃO E APRIMORAMENTO DE PROJETOS (SENSEI COPILOT)
Ao auditar um projeto preenchido pelo usuário:
1. Elevar termos coloquiais (ex: "operador demora pra achar a chave") para a linguagem formal Lean (ex: "Tempo de setup inflacionado por desperdício de movimentação e busca de ferramentas no posto").
2. Garantir que a Causa Raiz seja de processo/sistema e não culpando pessoas.
3. Refinar os 5 Porquês para que o 5º porquê atinja uma falha de padronização, método ou manutenção, e não pare no primeiro sintoma.
4. Fortalecer as Ações 5W2H com verbos de ação claros e foco em eliminar a causa raiz definitiva.
`;
