/**
 * Templates HTML de E-mail Corporativo - Lean Flow System
 * 
 * Regra de Compatibilidade SecOps/TI:
 * Estruturados estritamente em tabelas HTML com larguras fixas e estilos inline,
 * garantindo renderização idêntica no Microsoft Outlook Desktop (Word Engine),
 * Outlook Web e Outlook Mobile.
 */

export interface ControladoriaEmailTemplateData {
  recipientName: string;
  projectTitle: string;
  protocol: string;
  sectorName: string;
  leaderName: string;
  estimatedSavings: number;
  investmentCost?: number;
  paybackMonths?: number;
  auditUrl: string;
  tenantName: string;
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

/**
 * Template de Notificação de Auditoria Financeira para a Controladoria
 * Totalmente formatado em tabelas inline compatíveis com Microsoft Word/Outlook.
 */
export function buildControladoriaAuditEmailHtml(data: ControladoriaEmailTemplateData): string {
  const {
    recipientName,
    projectTitle,
    protocol,
    sectorName,
    leaderName,
    estimatedSavings,
    investmentCost = 0,
    paybackMonths,
    auditUrl,
    tenantName,
  } = data;

  const formattedSavings = formatCurrencyBRL(estimatedSavings);
  const formattedInvestment = investmentCost > 0 ? formatCurrencyBRL(investmentCost) : 'R$ 0,00 (Sem Capex)';
  const formattedPayback = paybackMonths ? `${paybackMonths.toFixed(1)} meses` : 'Imediato';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Auditoria Financeira - Lean Flow System</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #060a13; padding: 25px 0;">
    <tr>
      <td align="center">
        <!-- Container Principal com Largura Fixa de 600px -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #0d1527; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; table-layout: fixed;">
          
          <!-- Faixa Superior de Identificação da Entidade -->
          <tr>
            <td style="background-color: #0a1020; padding: 12px 24px; border-bottom: 1px solid #1e293b; text-align: left;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 11px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.05em;">
                    LEAN FLOW SYSTEM &bull; ${tenantName.toUpperCase()}
                  </td>
                  <td align="right" style="font-size: 11px; color: #64748b;">
                    GOVERNANÇA LEAN 4.0
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cabeçalho Principal com Destaque -->
          <tr>
            <td style="background: #111d35; padding: 32px 28px 24px; text-align: center; border-bottom: 2px solid #06b6d4;">
              <h1 style="margin: 0 0 8px; font-size: 21px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                Auditoria e Homologação Financeira
              </h1>
              <div style="display: inline-block; background-color: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 6px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #22d3ee;">
                PROJETO LEAN &bull; PROTOCOLO ${protocol}
              </div>
            </td>
          </tr>

          <!-- Corpo do E-mail -->
          <tr>
            <td style="padding: 28px 28px 20px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #f1f5f9;">
                Olá, <strong>${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #cbd5e1;">
                Um projeto de melhoria contínua da unidade <strong>${tenantName}</strong> atingiu a fase de conclusão e declarou <strong>ganhos financeiros por custo evitado</strong>.
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #cbd5e1;">
                Conforme as diretrizes de governança corporativa, os valores estimados exigem certificação formal da <strong>Controladoria</strong> para consolidação nos indicadores do grupo:
              </p>

              <!-- Card de Métricas em Tabela -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #131d35; border: 1px solid #1e293b; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #1e293b;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-bottom: 4px;">Título do Projeto</div>
                    <div style="font-size: 15px; font-weight: 700; color: #ffffff;">${projectTitle}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #1e293b;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="50%">
                          <div style="font-size: 11px; color: #94a3b8;">Setor de Origem:</div>
                          <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; margin-top: 2px;">${sectorName}</div>
                        </td>
                        <td width="50%">
                          <div style="font-size: 11px; color: #94a3b8;">Líder / Agente Lean:</div>
                          <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; margin-top: 2px;">${leaderName}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; background-color: #0b1528; border-bottom: 1px solid #1e293b;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="50%">
                          <div style="font-size: 11px; text-transform: uppercase; color: #34d399; font-weight: 700;">Custo Evitado Estimado (12M):</div>
                          <div style="font-size: 18px; font-weight: 800; color: #10b981; margin-top: 3px;">${formattedSavings}/ano</div>
                        </td>
                        <td width="50%">
                          <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600;">Investimento (Capex):</div>
                          <div style="font-size: 14px; font-weight: 700; color: #f1f5f9; margin-top: 3px;">${formattedInvestment}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <div style="font-size: 11px; color: #94a3b8;">Prazo de Retorno (Payback):</div>
                          <div style="font-size: 13px; font-weight: 600; color: #38bdf8; margin-top: 2px;">${formattedPayback}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 28px; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Ao acessar o link seguro abaixo, você visualizará o memorial descritivo, as evidências fotográficas do Gemba e poderá <strong>aprovar</strong>, <strong>ajustar valores individuais</strong> ou <strong>solicitar revisões</strong> antes da homologação final.
              </p>

              <!-- Botão Principal de Ação em Tabela (Compatível com Outlook) -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius: 8px; background-color: #0284c7;">
                          <a href="${auditUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; background-color: #0284c7; letter-spacing: 0.02em;">
                            Auditar e Homologar Ganhos &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Link Alternativo em Texto Puro -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a1120; border: 1px dashed #334155; border-radius: 6px; padding: 12px;">
                <tr>
                  <td style="font-size: 11px; color: #94a3b8; line-height: 1.4;">
                    Caso o botão não responda, copie e cole o link direto no seu navegador:<br />
                    <a href="${auditUrl}" target="_blank" style="color: #38bdf8; word-break: break-all; text-decoration: underline;">
                      ${auditUrl}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Rodapé Institucional -->
          <tr>
            <td style="background-color: #070d18; padding: 20px 28px; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 11px; color: #64748b;">
                Mensagem transacional automática gerada pelo <strong>Lean Flow System &bull; Grupo Vaccaro</strong>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                Acesso restrito para auditoria de governança corporativa da unidade ${tenantName}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Template de E-mail de Teste e Homologação de Conexão com Microsoft Graph
 */
export function buildTestEmailHtml(params: {
  recipientName: string;
  senderAddress: string;
  tenantName: string;
  timestamp: string;
}): string {
  const { recipientName, senderAddress, tenantName, timestamp } = params;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Teste de Conectividade - Microsoft Graph</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #060a13; padding: 30px 0;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #0d1527; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; table-layout: fixed;">
          
          <tr>
            <td style="background-color: #0a1020; padding: 12px 24px; border-bottom: 1px solid #1e293b;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase;">
                    TESTE DE CONECTIVIDADE &bull; MICROSOFT GRAPH API
                  </td>
                  <td align="right" style="font-size: 11px; color: #64748b;">
                    LEAN FLOW SYSTEM
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background: #111d35; padding: 32px 28px 24px; text-align: center; border-bottom: 2px solid #10b981;">
              <h1 style="margin: 0 0 8px; font-size: 21px; font-weight: 800; color: #ffffff;">
                Integração M365 Homologada com Sucesso
              </h1>
              <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 6px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #34d399;">
                DISPARO AUTENTICADO VIA MICROSOFT ENTRA ID
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #f1f5f9;">
                Olá, <strong>${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #cbd5e1;">
                Este e-mail confirma que o canal de disparo transacional do <strong>Lean Flow System</strong> está devidamente conectado e homologado com os servidores de correio do Microsoft 365.
              </p>

              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #131d35; border: 1px solid #1e293b; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #1e293b;">
                    <div style="font-size: 11px; color: #94a3b8;">Caixa Emissora Oficial:</div>
                    <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin-top: 2px;">${senderAddress}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #1e293b;">
                    <div style="font-size: 11px; color: #94a3b8;">Entidade de Teste:</div>
                    <div style="font-size: 13px; font-weight: 600; color: #f1f5f9; margin-top: 2px;">${tenantName}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #1e293b;">
                    <div style="font-size: 11px; color: #94a3b8;">Protocolo de Envio:</div>
                    <div style="font-size: 13px; font-weight: 600; color: #34d399; margin-top: 2px;">OAuth2 Client Credentials &bull; POST /v1.0/sendMail</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px;">
                    <div style="font-size: 11px; color: #94a3b8;">Data e Hora da Homologação:</div>
                    <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-top: 2px;">${timestamp}</div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                O serviço está pronto para disparar notificações de novas ações Lean, alertas de prazo aos supervisores e auditorias de custos à Controladoria em todas as unidades do grupo.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #070d18; padding: 20px 28px; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                Lean Flow System &bull; Grupo Vaccaro (Rafitec S.A. / Propex) &bull; Módulo de Notificações
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
