'use client';

import React, { useState, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Camera,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';

export const CURATED_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80',
];

interface AvatarSelectorProps {
  value: string;
  onChange: (url: string) => void;
  accentColor?: string;
  label?: string;
  helperText?: string;
  defaultFallback?: string;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  value,
  onChange,
  accentColor = '#06b6d4',
  label = 'Foto de Perfil',
  helperText = 'Carregue uma foto do seu dispositivo, cole um link ou escolha da galeria executiva.',
  defaultFallback = CURATED_AVATARS[0],
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'gallery'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Redimensiona e comprime a foto no cliente usando Canvas para evitar estouro de LocalStorage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um arquivo de imagem válido (PNG, JPG, JPEG ou WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma foto de até 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          onChange(compressed);
        } else {
          onChange(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUrlError(null);

    const clean = urlInput.trim();
    if (!clean) {
      setUrlError('Informe o endereço URL da imagem.');
      return;
    }

    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:image/')) {
      setUrlError('A URL deve começar com https:// ou http://');
      return;
    }

    onChange(clean);
    setUrlInput('');
  };

  const currentPhoto = value || defaultFallback;

  return (
    <div
      style={{
        backgroundColor: isDark ? 'rgba(9, 14, 26, 0.75)' : '#f8fafc',
        borderRadius: '12px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* Top Header: Preview & Mode Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Circular Preview with Camera Badge */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={currentPhoto}
              alt="Foto Selecionada"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2.5px solid ${accentColor}`,
                boxShadow: `0 0 12px ${accentColor}40`,
                backgroundColor: isDark ? '#060a13' : '#e2e8f0',
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: accentColor,
                border: `2px solid ${isDark ? '#090e1a' : '#ffffff'}`,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Carregar foto do computador"
            >
              <Camera size={11} />
            </button>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
              {label}
            </label>
            <p style={{ fontSize: '0.71875rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0.15rem 0 0', lineHeight: 1.3 }}>
              {helperText}
            </p>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#e2e8f0',
            padding: '0.2rem',
            borderRadius: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeMode === 'upload' ? (isDark ? 'rgba(255, 255, 255, 0.12)' : '#ffffff') : 'transparent',
              color: activeMode === 'upload' ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b'),
              fontSize: '0.71875rem',
              fontWeight: activeMode === 'upload' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Upload size={12} />
            <span>Do Computador</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('gallery')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeMode === 'gallery' ? (isDark ? 'rgba(255, 255, 255, 0.12)' : '#ffffff') : 'transparent',
              color: activeMode === 'gallery' ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b'),
              fontSize: '0.71875rem',
              fontWeight: activeMode === 'gallery' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={12} />
            <span>Galeria</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('url')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeMode === 'url' ? (isDark ? 'rgba(255, 255, 255, 0.12)' : '#ffffff') : 'transparent',
              color: activeMode === 'url' ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b'),
              fontSize: '0.71875rem',
              fontWeight: activeMode === 'url' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <LinkIcon size={12} />
            <span>Link / URL</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Mode Body 1: Upload do Computador */}
      {activeMode === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDark ? '1.5px dashed rgba(255, 255, 255, 0.15)' : '1.5px dashed #94a3b8',
            borderRadius: '10px',
            padding: '1rem',
            textAlign: 'center',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.backgroundColor = isDark ? `${accentColor}10` : '#f0fdfa';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : '#94a3b8';
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff';
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: `${accentColor}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor,
              }}
            >
              <Upload size={18} />
            </div>
            <strong style={{ fontSize: '0.8125rem', color: isDark ? '#ffffff' : '#0f172a' }}>
              Clique para selecionar uma foto do seu dispositivo
            </strong>
            <span style={{ fontSize: '0.71875rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              Formatos aceitos: PNG, JPG ou WEBP (redimensionamento automático para alta performance)
            </span>
          </div>
        </div>
      )}

      {/* Mode Body 2: Galeria Executiva Curada */}
      {activeMode === 'gallery' && (
        <div>
          <span style={{ fontSize: '0.71875rem', color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: '0.5rem' }}>
            Escolha uma das fotos profissionais pré-cadastradas:
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))',
              gap: '0.65rem',
            }}
          >
            {CURATED_AVATARS.map((av, idx) => {
              const isSelected = value === av;
              return (
                <div
                  key={idx}
                  onClick={() => onChange(av)}
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    padding: '2px',
                    border: isSelected ? `2.5px solid ${accentColor}` : '2px solid transparent',
                    boxShadow: isSelected ? `0 0 10px ${accentColor}60` : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title={`Opção ${idx + 1}`}
                >
                  <img
                    src={av}
                    alt={`Avatar ${idx + 1}`}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        right: '-1px',
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        backgroundColor: accentColor,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px solid #ffffff',
                      }}
                    >
                      <Check size={9} strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode Body 3: Link / URL Direto */}
      {activeMode === 'url' && (
        <form onSubmit={handleApplyUrl} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setUrlError(null);
              }}
              placeholder="https://exemplo.com/sua-foto.jpg"
              className="input"
              style={{
                flex: 1,
                fontSize: '0.8125rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                fontSize: '0.75rem',
                padding: '0.45rem 0.85rem',
                backgroundColor: accentColor,
                borderColor: accentColor,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Check size={13} />
              <span>Aplicar</span>
            </button>
          </div>
          {urlError && (
            <span style={{ fontSize: '0.71875rem', color: '#f87171' }}>{urlError}</span>
          )}
          <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>
            Cole o link direto da sua foto do Teams, LinkedIn, intranet corporativa ou repositório.
          </span>
        </form>
      )}

      {/* Reset to Default Button */}
      {value && value !== defaultFallback && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => onChange(defaultFallback)}
            style={{
              background: 'none',
              border: 'none',
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: '0.7rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <RotateCcw size={11} />
            <span>Restaurar foto padrão</span>
          </button>
        </div>
      )}
    </div>
  );
};
