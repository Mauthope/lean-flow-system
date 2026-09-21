'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ActivityAttachment } from '@/lib/types';
import { Paperclip, UploadCloud, Timer, FileText, Trash2, Download, Check, AlertCircle } from 'lucide-react';

interface ActivityAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  currentAttachment?: ActivityAttachment;
  onSaveAttachment: (attachment: ActivityAttachment) => void;
  onRemoveAttachment?: () => void;
}

export const ActivityAttachmentModal: React.FC<ActivityAttachmentModalProps> = ({
  isOpen,
  onClose,
  activityTitle,
  currentAttachment,
  onSaveAttachment,
  onRemoveAttachment,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'crono'>('upload');
  const [fileData, setFileData] = useState<ActivityAttachment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFileData(currentAttachment || null);
      setActiveTab('upload');
    }
  }, [isOpen, currentAttachment]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      const sizeBytes = file.size;
      const sizeFormatted =
        sizeBytes < 1024
          ? `${sizeBytes} B`
          : sizeBytes < 1024 * 1024
          ? `${(sizeBytes / 1024).toFixed(1)} KB`
          : `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;

      setFileData({
        name: file.name,
        fileType: file.type || 'application/octet-stream',
        sizeFormatted,
        url: reader.result as string,
        uploadedAt: new Date().toISOString(),
      });
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLinkCronoanalise = () => {
    try {
      const savedData = typeof window !== 'undefined' ? localStorage.getItem('lean_crono_records_v2') : null;
      const count = savedData ? JSON.parse(savedData).length : 0;
      
      const newAttachment: ActivityAttachment = {
        name: `Estudo_Cronoanalise_Integrado_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`,
        fileType: 'application/pdf',
        sizeFormatted: `${count} medições registradas`,
        url: '#/agente/ferramentas/cronoanalise',
        uploadedAt: new Date().toISOString(),
      };

      onSaveAttachment(newAttachment);
      onClose();
    } catch {
      alert('Não foi possível vincular o estudo de tempos.');
    }
  };

  const handleSave = () => {
    if (fileData) {
      onSaveAttachment(fileData);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Anexos & Evidências Técnicas da Atividade"
      subtitle="Comprove a execução da atividade com cronoanálise, laudo, desenho ou fotos"
      maxWidth="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Atividade */}
        <div
          style={{
            backgroundColor: '#090e1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Atividade:
          </span>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
            {activityTitle}
          </p>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'upload' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'upload' ? '#22d3ee' : '#94a3b8',
              border: activeTab === 'upload' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <UploadCloud size={14} /> Fazer Upload de Arquivo (PDF / Planilha)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('crono')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'crono' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: activeTab === 'crono' ? '#fbbf24' : '#94a3b8',
              border: activeTab === 'crono' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Timer size={14} /> Vincular Cronoanálise do Sistema
          </button>
        </div>

        {/* Tab Upload */}
        {activeTab === 'upload' && (
          <div>
            {fileData ? (
              <div
                style={{
                  backgroundColor: '#0c121e',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={20} color="#34d399" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', wordBreak: 'break-all' }}>
                      {fileData.name}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {fileData.sizeFormatted} • Anexado em {new Date(fileData.uploadedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  {fileData.url && fileData.url !== '#' && (
                    <a
                      href={fileData.url}
                      download={fileData.name}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.6rem', color: '#22d3ee' }}
                      title="Baixar arquivo"
                    >
                      <Download size={14} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFileData(null);
                      if (onRemoveAttachment) onRemoveAttachment();
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.35rem 0.6rem', color: '#f87171' }}
                    title="Remover anexo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <label
                style={{
                  border: '2px dashed rgba(255, 255, 255, 0.18)',
                  borderRadius: '12px',
                  padding: '2rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  backgroundColor: '#090e1a',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg"
                />
                <UploadCloud size={32} color="#22d3ee" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
                  {isProcessing ? 'Processando arquivo...' : 'Clique para selecionar arquivo ou arraste aqui'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Formatos aceitos: PDF, Excel (XLSX), Word (DOCX) ou Imagens (máx. 10MB)
                </span>
              </label>
            )}
          </div>
        )}

        {/* Tab Cronoanálise Integrada */}
        {activeTab === 'crono' && (
          <div
            style={{
              backgroundColor: '#0c121e',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
              <Timer size={20} />
              <strong style={{ fontSize: '0.9375rem' }}>Vincular Estudo de Tempos e Métodos</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              O sistema conecta os apontamentos de cronometragem realizados no módulo de Cronoanálise à atividade do projeto, comprovando os ganhos de Lead Time e redução de atividades NVA (Não Agregam Valor).
            </p>

            <button
              type="button"
              onClick={handleLinkCronoanalise}
              className="btn btn-warning btn-sm"
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 800,
                marginTop: '0.5rem',
              }}
            >
              <Check size={15} /> Vincular Dados da Cronoanálise Ativa
            </button>
          </div>
        )}

        {/* Ações */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Fechar
          </button>
          {fileData && (
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 800,
              }}
            >
              <Check size={15} /> Salvar Anexo na Atividade
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
