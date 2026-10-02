# 🤖 Diretrizes de Agentes de IA do Projeto (Lean Flow System)

Este projeto conta com instruções especializadas para agentes de IA localizadas na pasta [`/agents`](./agents).

## Instruções Gerais para o Assistente:
1. **Consultar Especialistas Locais:** Sempre que uma tarefa envolver áreas especializadas (como Segurança da Informação, Engenharia Lean/TPM, Arquitetura de Software ou Banco de Dados Supabase), verifique se há arquivos de instrução correspondentes dentro do diretório [`agents/`](./agents).
2. **Prioridade de Segurança (SecOps):** Manter conformidade estrita com o relatório de segurança do Grupo Vaccaro e com as políticas de isolamento RLS, autenticação corporativa `@rafitec.com.br` e proteção de chaves de API exclusivamente no servidor.
3. **Padrão de Código:** Seguir rigorosamente o padrão Next.js 14 App Router, TypeScript estrito, banco PostgreSQL no Supabase com Row Level Security (RLS) habilitado e zero warnings no linter/Security Advisor.
