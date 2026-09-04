'use client';

import React from 'react';

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
  return (
    <div
      style={{
        background: `radial-gradient(circle at 95% 10%, ${accentColor}18 0%, #0f172a 65%)`,
        border: `1px solid ${accentColor}30`,
        borderRadius: '16px',
        padding: '1.35rem',
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px ${accentColor}10`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 12px 30px -5px rgba(0, 0, 0, 0.6), 0 0 25px ${accentColor}25`;
        e.currentTarget.style.borderColor = `${accentColor}60`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = `0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px ${accentColor}10`;
        e.currentTarget.style.borderColor = `${accentColor}30`;
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
          width: '3.5px',
          height: '100%',
          backgroundColor: accentColor,
          boxShadow: `0 0 12px ${accentColor}`,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div>
          <p style={{ fontSize: '0.725rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </p>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginTop: '0.25rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            {value}
          </h2>
        </div>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: `${accentColor}18`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${accentColor}40`,
            boxShadow: `0 0 16px ${accentColor}20`,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
        {subtitle && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
            {subtitle}
          </span>
        )}
        {trend && (
          <span
            style={{
              fontSize: '0.725rem',
              fontWeight: 800,
              color: trend.isPositive ? '#34d399' : '#f87171',
              backgroundColor: trend.isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${trend.isPositive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
              padding: '0.15rem 0.55rem',
              borderRadius: '9999px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
