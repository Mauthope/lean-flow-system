# POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS PESSOAIS
**Última Atualização:** 9 de Outubro de 2026  
**Versão:** 1.0 — Em Conformidade com a Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD)

---

## 1. COMPROMISSO DE PRIVACIDADE E CONTROLADOR
A presente Política de Privacidade regula o tratamento de dados pessoais realizado pela plataforma **Lean Flow System**, operada no âmbito corporativo do **Grupo Vaccaro / Rafitec S.A.** ("Controlador"), assegurando a transparência, a segurança e a inviolabilidade da privacidade de seus colaboradores, agentes e usuários.

- **Controlador dos Dados:** Rafitec S.A. / Grupo Vaccaro
- **Canal de Privacidade & Encarregado (DPO):** `dpo@rafitec.com.br` / `privacidade@grupovaccaro.com.br`

---

## 2. DADOS COLETADOS E BASES LEGAIS
A plataforma coleta e processa estritamente os dados necessários para sua operação industrial, sustentados nas bases legais previstas no Artigo 7º da LGPD:

| Categoria de Dado | Exemplos | Finalidade Primária | Base Legal (Art. 7º LGPD) |
| :--- | :--- | :--- | :--- |
| **Identificação Corporativa** | Nome completo, e-mail corporativo (`@rafitec.com.br`), cargo, setor fabril e avatar. | Autenticação, atribuição de liderança de projetos Lean e governança do Gemba. | Execução de Contrato de Trabalho (Inciso V) e Legítimo Interesse (Inciso IX). |
| **Registros de Conexão (Logs)** | Endereço IP, data, hora, porta lógica e identificador de sessão. | Guarda legal obrigatória e auditoria de segurança da informação (AppSec). | Cumprimento de Obrigação Legal (Inciso II — Art. 15 Marco Civil da Internet). |
| **Dados Operacionais de Produção** | Ideias de Kaizen, inspeções 5S, apontamentos de máquina (TPM), cálculos de baseline e custo evitado. | Gestão operacional de manufatura, acompanhamento de PDCA e auditoria de controladoria. | Legítimo Interesse do Controlador (Inciso IX). |

---

## 3. PRINCÍPIO DE NÃO-DISCRIMINAÇÃO E ZERO DARK PATTERNS
3.1. A plataforma repudia expressamente qualquer forma de *dark pattern* (design manipulativo).  
3.2. Não existem caixas de seleção pré-marcadas, coletas ocultas em segundo plano ou venda/cessão de dados para terceiros ou parceiros comerciais de publicidade.  
3.3. Não há coleta de dados sensíveis de saúde, biometria ou dados de menores de idade nesta aplicação.

---

## 4. GOVERNANÇA DE INTELIGÊNCIA ARTIFICIAL E POLÍTICA DE NÃO-RETENÇÃO (ZERO DATA RETENTION)
4.1. As requisições direcionadas ao **Sensei IA** transitam exclusivamente por túnel seguro via servidor backend (`/api/ai/sensei`), sem exposição de chaves no navegador.  
4.2. **Cláusula de Não-Treinamento:** As chamadas de API utilizam instâncias corporativas do Google Generative Language configuradas com termos estritos que **vedam a utilização de prompts ou dados industriais dos usuários para treinamento de modelos públicos de inteligência artificial**.  
4.3. **Filtro de Anonimização (PII Masking):** A rota de inteligência artificial aplica filtros de higienização de dados antes do envio externo, suprimindo potenciais padrões de dados pessoais identificáveis.

---

## 5. ARQUITETURA MULTI-TENANT E ISOLAMENTO DE DADOS (SECOPS)
5.1. A plataforma adota isolamento lógico rigoroso por Entidade (*Tenant ID*), garantindo que dados industriais de uma unidade fabril ou empresa controlada sejam hermeticamente inacessíveis por outra.  
5.2. As tabelas do banco de dados relacional Supabase PostgreSQL possuem **Row Level Security (RLS)** ativado em nível de banco de dados, auditado contra riscos de injeção e acessos indevidos (IDOR).  
5.3. Toda a comunicação ocorre sob tráfego criptografado com protocolo TLS 1.3 / HTTPS.

---

## 6. DIREITOS DOS TITULARES DE DADOS (ARTIGO 18 DA LGPD)
O colaborador ou titular de dados possui os seguintes direitos, exercíveis a qualquer momento mediante solicitação ao Encarregado de Dados:
- **Confirmação e Acesso:** Obter confirmação da existência de tratamento e acessar seus dados cadastrais;
- **Correção:** Solicitar retificação de dados incompletos, inexatos ou desatualizados;
- **Eliminação e Anonimização:** Solicitar a inativação ou anonimização de seus dados pessoais quando não mais necessários à finalidade inicial, ressalvadas as obrigações legais de guarda histórica de registros industriais e auditoria contábil;
- **Informação de Compartilhamento:** Saber quais sistemas integrados (ex.: Microsoft Entra ID, Provedor de Nuvem Supabase/Vercel) recebem os dados estritamente para a viabilização técnica do serviço.

---

## 7. PRAZO DE GUARDA E DESCARTE
7.1. Os registros de acesso à aplicação são armazenados pelo prazo legal mínimo de **6 (seis) meses**, em estrita observância ao Artigo 15 da Lei nº 12.965/2014 (Marco Civil da Internet).  
7.2. Dados operacionais e históricos de projetos Kaizen são mantidos durante a vigência do contrato e pelo período de auditoria fiscal e contábil, após o qual poderão ser arquivados sob forma anonimizada para fins estatísticos de engenharia industrial.

---

## 8. CANAL DE ATENDIMENTO
Para exercer quaisquer dos seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato com nosso Encarregado de Proteção de Dados:
- **E-mail:** `dpo@rafitec.com.br`
- **Assunto Obrigatório:** `[LGPD - Solicitação do Titular de Dados]`
