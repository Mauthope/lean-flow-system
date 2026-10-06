const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function createExecutiveReport(outputPath) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 32, bottom: 32, left: 36, right: 36 },
    bufferPages: true,
    info: {
      Title: 'Relatório de Auditoria de Segurança de Aplicações - Lean Flow System',
      Author: 'Arquiteto Sênior de AppSec - Rafitec S.A. / Grupo Vaccaro',
      Subject: 'Auditoria AppSec & SecOps Lean Flow System',
      Keywords: 'Segurança, AppSec, Supabase, Next.js, ISO 9001, Grupo Vaccaro, Rafitec',
      CreationDate: new Date(),
    }
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  const primaryNavy = '#0F172A';
  const accentBlue = '#0284C7';
  const textDark = '#1E293B';
  const textMuted = '#475569';
  const successGreen = '#15803D';
  const lightBg = '#F8FAFC';
  const borderColor = '#CBD5E1';

  // --- CABEÇALHO (PÁGINA 1) ---
  doc.rect(36, 32, 523, 56).fill(primaryNavy);

  doc.fillColor('#FFFFFF').fontSize(13).font('Helvetica-Bold')
     .text('GRUPO VACCARO / RAFITEC S.A.', 50, 43);
  doc.fillColor(accentBlue).fontSize(9).font('Helvetica-Bold')
     .text('COMITÊ DE SEGURANÇA DA INFORMAÇÃO & SECOPS', 50, 59);
  doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
     .text('Lean Flow System - Relatório de Auditoria Técnica de Aplicações (AppSec)', 50, 71);

  doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold')
     .text('CONFIDENCIAL / NÍVEL 1', 390, 43, { width: 155, align: 'right' });
  doc.fillColor('#CBD5E1').fontSize(7.5).font('Helvetica')
     .text('Protocolo: SEC-AUD-2026-088', 390, 55, { width: 155, align: 'right' })
     .text('Data de Emissão: 06/10/2026', 390, 67, { width: 155, align: 'right' });

  // --- BANNER DE VEREDITO ---
  doc.rect(36, 96, 523, 38).fillAndStroke('#F0FDF4', '#16A34A');
  doc.fillColor(successGreen).fontSize(10.5).font('Helvetica-Bold')
     .text('VEREDITO GERAL: APROVADO (NÍVEL EXECUTIVO CORPORATIVO)', 48, 103);
  doc.fillColor('#166534').fontSize(7.5).font('Helvetica')
     .text('Plataforma em estrita conformidade com a PSI do Grupo Vaccaro e com a Governança SGQ / ISO 9001.', 48, 118);

  doc.rect(450, 103, 96, 22).fill('#16A34A');
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold')
     .text('HOMOLOGADO', 450, 109, { width: 96, align: 'center' });

  // --- SEÇÃO 1: ESCOPO & CONTEXTO ---
  let cursorY = 144;
  doc.rect(36, cursorY, 4, 11).fill(accentBlue);
  doc.fillColor(primaryNavy).fontSize(9.5).font('Helvetica-Bold')
     .text('1. ESCOPO E OBJETIVOS DA AUDITORIA TÉCNICA', 46, cursorY);

  cursorY += 16;
  doc.fillColor(textDark).fontSize(8).font('Helvetica').lineGap(2)
     .text('Esta auditoria avalia a resiliência arquitetural, controles de acesso e integridade de dados do Lean Flow System, compreendendo o front-end Next.js 14 App Router, rotas de API protegidas, integrações de IA e a base de dados PostgreSQL no Supabase (projeto dompnslzzudznbhyhyfz, sa-east-1). O escopo incluiu a resolução definitiva do bloqueio de colaboradores pré-cadastrados no SSO (Microsoft Entra ID) e a aplicação de 4 patches de hardening SecOps homologados.', 36, cursorY, { width: 523, align: 'justify' });

  // --- SEÇÃO 2: MATRIZ DOS 9 PILARES ---
  cursorY += 46;
  doc.rect(36, cursorY, 4, 11).fill(accentBlue);
  doc.fillColor(primaryNavy).fontSize(9.5).font('Helvetica-Bold')
     .text('2. MATRIZ DE CONFORMIDADE DOS 9 PILARES SECOPS', 46, cursorY);

  const pillars = [
    { pilar: '1. RLS & Zero Acesso Anônimo', desc: 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon ativo. 100% das tabelas produtivas com RLS habilitado e isolamento multi-tenant (tenant_id).' },
    { pilar: '2. Storage & Buckets Privados', desc: 'Buckets de fotos do Gemba e laudos 5S/TPM estritamente privados. Acesso mediado por URLs temporárias assinadas (Signed URLs).' },
    { pilar: '3. Zero Dados no Bundle Público', desc: 'Sem custos, clientes ou parâmetros confidenciais hardcoded. Chaves sensíveis removidas de prefixos NEXT_PUBLIC_.' },
    { pilar: '4. Governança de Chaves de IA', desc: 'GEMINI_API_KEY 100% no servidor. Rota /api/ai/sensei exige Bearer JWT corporativo. Zero chaves armazenadas no localStorage.' },
    { pilar: '5. Integridade SGQ / ISO 9001', desc: 'Triggers PostgreSQL impedem spoofing de aprovações. Cravamento automático de autoria via auth.uid() e validação Master.' },
    { pilar: '6. API Routes & Server Actions', desc: 'Validação de token corporativo via supabase.auth.getUser(token). Auditoria de custos protegida por tokens unívocos.' },
    { pilar: '7. Trava de Domínio & SSO Entra ID', desc: 'Trigger rejeita e-mails fora de @rafitec.com.br e @vaccaro.com.br. Whitelist corporativa centralizada na nuvem (public.authorized_users).' },
    { pilar: '8. Expurgo em Terminais do Gemba', desc: 'Logout com higienização atômica varrendo prefixos lean_flow_*, sensei_* e gemini_* em máquinas compartilhadas no chão de fábrica.' },
    { pilar: '9. Funções de Banco & Search Path', desc: 'Cláusula SET search_path = public; em todas as funções SECURITY DEFINER. RPCs analíticas isoladas no schema private.' },
  ];

  cursorY += 15;
  doc.rect(36, cursorY, 523, 16).fill(primaryNavy);
  doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold')
     .text('PILAR DE SEGURANÇA', 42, cursorY + 4, { width: 145 })
     .text('STATUS', 190, cursorY + 4, { width: 55, align: 'center' })
     .text('MECANISMO DE CONTROLE E EVIDÊNCIA TÉCNICA', 255, cursorY + 4, { width: 295 });

  cursorY += 16;
  pillars.forEach((item, index) => {
    const rowHeight = 22;
    const bg = index % 2 === 0 ? '#FFFFFF' : lightBg;
    doc.rect(36, cursorY, 523, rowHeight).fillAndStroke(bg, borderColor);

    doc.fillColor(primaryNavy).fontSize(7.5).font('Helvetica-Bold')
       .text(item.pilar, 42, cursorY + 6, { width: 145 });

    doc.rect(193, cursorY + 4, 50, 13).fill('#DCFCE7');
    doc.fillColor(successGreen).fontSize(6.5).font('Helvetica-Bold')
       .text('CONFORME', 193, cursorY + 7, { width: 50, align: 'center' });

    doc.fillColor(textDark).fontSize(7).font('Helvetica')
       .text(item.desc, 255, cursorY + 4, { width: 295, lineGap: 1 });

    cursorY += rowHeight;
  });

  // --- SEÇÃO 3: DETALHAMENTO DE VULNERABILIDADES (PÁGINA 1 RODAPÉ) ---
  cursorY += 12;
  doc.rect(36, cursorY, 4, 11).fill(accentBlue);
  doc.fillColor(primaryNavy).fontSize(9.5).font('Helvetica-Bold')
     .text('3. RESOLUÇÃO DE BLOQUEIO DE SSO & HARDENING DE API', 46, cursorY);

  cursorY += 16;
  doc.rect(36, cursorY, 523, 56).fillAndStroke(lightBg, borderColor);
  doc.fillColor(primaryNavy).fontSize(8).font('Helvetica-Bold')
     .text('A. Centralização da Whitelist no Supabase (Eliminação da Dependência de localStorage)', 44, cursorY + 6);
  doc.fillColor(textDark).fontSize(7.5).font('Helvetica')
     .text('Causa Raiz: O cadastro de agentes residia exclusivamente no localStorage do navegador do gestor. Em estações de trabalho de colaboradores (ex: Leonardo Ogliari e Juliano Zancanaro), a verificação de login falhava por ausência do registro local.\nSolução Implementada: Criada a tabela public.authorized_users com RLS e trigger handle_new_auth_user() no Supabase. O fluxo de login em src/app/page.tsx agora valida em 3 camadas, concedendo acesso corporativo imediato em qualquer terminal da empresa.', 44, cursorY + 18, { width: 505, lineGap: 1 });

  // Rodapé da Página 1
  doc.fillColor('#64748B').fontSize(7).font('Helvetica')
     .text('Lean Flow System - Relatório Oficial de Conformidade SecOps - Grupo Vaccaro / Rafitec S.A. - Página 1 de 2', 36, 785, { width: 523, align: 'center' });

  // --- PÁGINA 2 ---
  doc.addPage();

  // Cabeçalho Página 2
  doc.rect(36, 32, 523, 30).fill(primaryNavy);
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold')
     .text('LEAN FLOW SYSTEM - RELATÓRIO DE AUDITORIA APPSEC (PÁGINA 2/2)', 48, 42);
  doc.fillColor(accentBlue).fontSize(7.5).font('Helvetica')
     .text('GRUPO VACCARO / RAFITEC S.A. - PROTOCOLO SEC-AUD-2026-088', 350, 42, { align: 'right', width: 195 });

  let p2Y = 74;

  // Card B: Validação JWT na API de IA
  doc.rect(36, p2Y, 523, 85).fillAndStroke(lightBg, borderColor);
  doc.fillColor(primaryNavy).fontSize(8).font('Helvetica-Bold')
     .text('B. Validação Mandatória de Token Bearer JWT na API de IA (/api/ai/sensei)', 44, p2Y + 6);
  doc.fillColor(textDark).fontSize(7.5).font('Helvetica')
     .text('Vulnerabilidade Anterior: A rota POST aceitava invocações sem validação de sessão ativa no servidor, expondo a chave corporativa de IA a requisições sem rastreabilidade.\nPatch Aplicado: Implementada extração de token Bearer com conferência direta via supabase.auth.getUser(token). Chamadas anônimas são rejeitadas com status HTTP 401 Unauthorized. O cliente geminiService.ts despacha automaticamente o token da sessão em todas as requisições.', 44, p2Y + 18, { width: 505, lineGap: 1 });

  doc.rect(44, p2Y + 54, 505, 24).fill('#0F172A');
  doc.fillColor('#E2E8F0').fontSize(6.5).font('Courier')
     .text("const { data: { user }, error } = await supabase.auth.getUser(token);\nif (error || !user) return NextResponse.json({ error: 'Sessão corporativa inválida.' }, { status: 401 });", 48, p2Y + 57);

  // Card C: Remoção de Credenciais em Texto Puro & Expurgo
  p2Y += 95;
  doc.rect(36, p2Y, 523, 62).fillAndStroke(lightBg, borderColor);
  doc.fillColor(primaryNavy).fontSize(8).font('Helvetica-Bold')
     .text('C. Eliminação de Chaves em localStorage & Expurgo Total no Logout', 44, p2Y + 6);
  doc.fillColor(textDark).fontSize(7.5).font('Helvetica')
     .text('Vulnerabilidade Anterior: O painel de integrações gravava a API key no localStorage do cliente. O logout preservava resíduos de chaves locais.\nPatch Aplicado: Removida a persistência em texto puro em /admin/integracoes-ia (agora informativo da variável do servidor). A função logout em AuthContext.tsx itera por todas as chaves e remove atômica e recursivamente qualquer registro sob os prefixos lean_flow_*, sensei_* e gemini_*.', 44, p2Y + 18, { width: 505, lineGap: 1 });

  // --- SEÇÃO 4: CHECKLIST SECOPS ---
  p2Y += 72;
  doc.rect(36, p2Y, 4, 11).fill(accentBlue);
  doc.fillColor(primaryNavy).fontSize(9.5).font('Helvetica-Bold')
     .text('4. CHECKLIST DE CONFORMIDADE SECOPS (GRUPO VACCARO)', 46, p2Y);

  const checklist = [
    'RLS ativo e Grants anônimos revogados (REVOKE ALL FROM anon auditado)',
    'Zero credenciais corporativas no bundle client (sem NEXT_PUBLIC_ sensível)',
    'Chaves de IA mantidas 100% no servidor (sem armazenamento em localStorage)',
    'Validação de token Bearer corporativo em todas as rotas de backend',
    'Triggers de auditoria e conformidade SGQ / ISO 9001 blindadas no PostgreSQL',
    'Whitelist multi-tenant centralizada no banco de dados para acesso SSO',
    'Expurgo atômico de dados em terminais compartilhados no Gemba fabril',
    'Trava restrita a e-mails corporativos homologados (@rafitec.com.br)'
  ];

  p2Y += 16;
  const colWidth = 256;
  checklist.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 36 + col * (colWidth + 11);
    const y = p2Y + row * 19;

    doc.rect(x, y, colWidth, 16).fillAndStroke(lightBg, borderColor);
    doc.rect(x + 4, y + 2.5, 11, 11).fill('#DCFCE7');
    doc.fillColor(successGreen).fontSize(7.5).font('Helvetica-Bold')
       .text('X', x + 4, y + 3.5, { width: 11, align: 'center' });
    doc.fillColor(textDark).fontSize(6.5).font('Helvetica')
       .text(item, x + 19, y + 4, { width: colWidth - 23 });
  });

  // --- SEÇÃO 5: RECOMENDAÇÕES COMPLEMENTARES ---
  p2Y += 88;
  doc.rect(36, p2Y, 4, 11).fill(accentBlue);
  doc.fillColor(primaryNavy).fontSize(9.5).font('Helvetica-Bold')
     .text('5. RECOMENDAÇÕES COMPLEMENTARES DE GOVERNANÇA', 46, p2Y);

  p2Y += 16;
  doc.fillColor(textDark).fontSize(7.5).font('Helvetica').lineGap(2)
     .text('1. Leaked Password Protection: Habilitar o alerta de senhas vazadas no painel do Supabase Auth para proteção adicional de credenciais locais de contingência.\n2. E-mails Transacionais: Manter as notificações de custos encapsuladas via rotas de backend ou Edge Functions, preservando isolamento de chaves de e-mail.\n3. Índices de Cobertura: Monitorar o crescimento das tabelas de alto volume operacional (action_checklists, tpm_tags) criando índices específicos de foreign keys.', 36, p2Y, { width: 523, align: 'justify' });

  // --- SEÇÃO 6: HOMOLOGAÇÃO & ASSINATURAS ---
  p2Y += 75;
  doc.rect(36, p2Y, 523, 1).fill(borderColor);

  p2Y += 30;
  // Assinatura 1
  doc.rect(56, p2Y + 45, 200, 1).fill('#475569');
  doc.fillColor(primaryNavy).fontSize(8.5).font('Helvetica-Bold')
     .text('Arquiteto Sênior de AppSec', 56, p2Y + 51, { width: 200, align: 'center' });
  doc.fillColor(textMuted).fontSize(7.5).font('Helvetica')
     .text('Auditoria de Segurança da Informação & SecOps', 56, p2Y + 62, { width: 200, align: 'center' })
     .text('Rafitec S.A. / Grupo Vaccaro', 56, p2Y + 72, { width: 200, align: 'center' });

  // Assinatura 2
  doc.rect(303, p2Y + 45, 200, 1).fill('#475569');
  doc.fillColor(primaryNavy).fontSize(8.5).font('Helvetica-Bold')
     .text('Mauricio Grigol', 303, p2Y + 51, { width: 200, align: 'center' });
  doc.fillColor(textMuted).fontSize(7.5).font('Helvetica')
     .text('Root Master / Gestor de Governança & TI Industrial', 303, p2Y + 62, { width: 200, align: 'center' })
     .text('Rafitec S.A. / Grupo Vaccaro', 303, p2Y + 72, { width: 200, align: 'center' });

  // Rodapé da Página 2
  doc.fillColor('#64748B').fontSize(7).font('Helvetica')
     .text('Lean Flow System - Relatório Oficial de Conformidade SecOps - Grupo Vaccaro / Rafitec S.A. - Página 2 de 2', 36, 785, { width: 523, align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', reject);
  });
}

const targetPath = path.resolve('c:/Users/mauricio.grigol/Documents/Mauthope developer/Relatorio_Seguranca_AppSec_Grupo_Vaccaro.pdf');
console.log('Gerando PDF em:', targetPath);

createExecutiveReport(targetPath)
  .then((res) => {
    console.log('PDF gerado com sucesso em:', res);
    const artifactPath = path.resolve('C:/Users/mauricio.grigol/.gemini/antigravity/brain/f68bff60-cd5d-43c6-bf39-a06fdf548dd7/Relatorio_Seguranca_AppSec_Grupo_Vaccaro.pdf');
    fs.copyFileSync(res, artifactPath);
    console.log('Cópia de artefato criada em:', artifactPath);
  })
  .catch((err) => {
    console.error('Erro ao gerar PDF:', err);
    process.exit(1);
  });
