'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
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
  accentColor = '#2563eb',
}) => {
  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '1.25rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.35)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: accentColor,
          boxShadow: `0 0 10px ${accentColor}`,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </p>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            {value}
          </h2>
        </div>
        <div
          style={{
            padding: '0.55rem',
            borderRadius: '10px',
            backgroundColor: `${accentColor}20`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${accentColor}40`,
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        {subtitle && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {subtitle}
          </span>
        )}
        {trend && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: trend.isPositive ? '#059669' : '#dc2626',
              backgroundColor: trend.isPositive ? '#ecfdf5' : '#fef2f2',
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
            }}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
