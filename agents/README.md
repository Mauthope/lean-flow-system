# 🤖 Diretório de Instruções de Agentes de IA (Lean Flow System)

Este diretório foi criado para armazenar arquivos com **instruções, diretrizes e papéis especializados para Agentes de IA**, auxiliando no desenvolvimento contínuo, governança, segurança e expansão do **Fluxo Lean System**.

---

## 📁 Como Funciona

Você pode criar arquivos `.md` (Markdown) nesta pasta para definir agentes com papéis específicos. Sempre que iniciarmos um trabalho ou você me pedir para atuar com base em um agente (ex: *"aja como o agente revisor de segurança"* ou *"consulte as instruções do analista lean"*), eu lerei e seguirei estritamente as regras definidas no arquivo correspondente.

Além disso, o arquivo raiz `AGENTS.md` instrui o assistente a sempre consultar esta pasta para manter o alinhamento com os padrões do projeto.

---

## 🛠️ Sugestões de Agentes para este Projeto

| Arquivo Recomendado | Especialidade / Papel | Quando Usar |
| :--- | :--- | :--- |
| `auditor-seguranca.md` | **SecOps & Governança (Grupo Vaccaro / PSI)** | Para revisar código, queries SQL, RLS e autenticação antes de publicar. |
| `especialista-lean.md` | **Engenharia Lean & TPM Fabril** | Para validar regras de cálculo de OEE, 8 Desperdícios, 5W2H, Hoshin Kanri e matrizes. |
| `arquiteto-frontend.md` | **UI/UX Industrial & Performance** | Para criação de telas, componentes acessíveis e visualização para operadores de fábrica. |
| `engenheiro-backend.md` | **Next.js API & Supabase PostgreSQL** | Para criação de rotas, triggers, RPCs seguras e migrations. |

---

## 📋 Modelo de Criação

Para criar um novo agente, você pode duplicar o arquivo [`TEMPLATE_AGENTE.md`](./TEMPLATE_AGENTE.md) e preencher as seções:

```markdown
# Nome do Agente (Ex: Agente Auditor de Segurança)

## 1. Identidade & Papel
- Quem é o agente e qual o seu foco principal.

## 2. Diretrizes Inegociáveis
- O que o agente NUNCA deve permitir (ex: expor chaves, burlar RLS).

## 3. Padrões Técnicos
- Tecnologias, convenções de código e boas práticas esperadas.

## 4. Exemplos de Ação
- Casos de uso práticos onde esse agente deve intervir.
```

---

*Diretório integrado ao ecossistema do **Fluxo Lean System** • Rafitec S.A. / Grupo Vaccaro.*
