'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface StatsCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = '#06b6d4',
}) => {
  const { isDark } = useTheme();

  return (
    <div
      style={{
        background: isDark
          ? `radial-gradient(circle at 95% 10%, ${accentColor}18 0%, #0f172a 65%)`
          : `radial-gradient(circle at 95% 10%, ${accentColor}10 0%, #ffffff 70%)`,
        border: `1px solid ${isDark ? `${accentColor}30` : `${accentColor}45`}`,
        borderRadius: '16px',
        padding: '1.2rem 1.35rem',
        boxShadow: isDark
          ? `0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px ${accentColor}10`
          : `0 4px 14px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '185px',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isDark
          ? `0 12px 30px -5px rgba(0, 0, 0, 0.6), 0 0 25px ${accentColor}25`
          : `0 10px 25px -3px rgba(15, 23, 42, 0.1), 0 0 15px ${accentColor}20`;
        e.currentTarget.style.borderColor = `${accentColor}80`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = isDark
          ? `0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px ${accentColor}10`
          : `0 4px 14px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)`;
        e.currentTarget.style.borderColor = isDark ? `${accentColor}30` : `${accentColor}45`;
      }}
    >
      {/* Delicate Top Glowing Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${accentColor}80 50%, transparent 100%)`,
        }}
      />

      {/* Side Accent Marker */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: accentColor,
          boxShadow: isDark ? `0 0 12px ${accentColor}` : `0 0 8px ${accentColor}60`,
        }}
      />

      {/* Top Header: Title (left) + Icon Badge (right, perfectly contained) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.5rem',
        }}
      >
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            color: isDark ? '#94a3b8' : '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
            lineHeight: 1.35,
            flex: 1,
          }}
        >
          {title}
        </p>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: `${accentColor}18`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${accentColor}40`,
            boxShadow: `0 0 14px ${accentColor}20`,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Main Metric Value: Full Width, Never Pushed or Cut by Icon */}
      <div style={{ marginBottom: '0.65rem' }}>
        <h2
          style={{
            fontSize: 'clamp(1.25rem, 1.8vw, 1.55rem)',
            fontWeight: 900,
            color: isDark ? '#ffffff' : '#0f172a',
            margin: 0,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={typeof value === 'string' ? value : undefined}
        >
          {value}
        </h2>
      </div>

      {/* Footer: Subtitle + Trend Badge */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
        }}
      >
        {subtitle && (
          <div
            style={{
              fontSize: '0.735rem',
              color: isDark ? '#94a3b8' : '#64748b',
              fontWeight: 600,
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        )}
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: trend.isPositive ? '#34d399' : '#f87171',
                backgroundColor: trend.isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${trend.isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
                display: 'inline-flex',
                alignItems: 'center',
                maxWidth: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.4,
              }}
              title={trend.value}
            >
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
