'use client';

import React from 'react';
import {
  Trash2,
  Sparkles,
  ShieldCheck,
  Zap,
  Map,
  Cog,
  FileText,
  RefreshCw,
  BookOpen,
  Target,
  Wrench,
  Factory,
} from 'lucide-react';

interface ArticleIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export const ArticleIcon: React.FC<ArticleIconProps> = ({
  name,
  size = 20,
  color,
  className,
}) => {
  switch (name) {
    case 'Trash2':
    case 'trash':
      return <Trash2 size={size} color={color} className={className} />;
    case 'Sparkles':
    case 'sparkles':
      return <Sparkles size={size} color={color} className={className} />;
    case 'ShieldCheck':
    case 'shield':
      return <ShieldCheck size={size} color={color} className={className} />;
    case 'Zap':
    case 'zap':
      return <Zap size={size} color={color} className={className} />;
    case 'Map':
    case 'map':
      return <Map size={size} color={color} className={className} />;
    case 'Cog':
    case 'cog':
      return <Cog size={size} color={color} className={className} />;
    case 'FileText':
    case 'file':
      return <FileText size={size} color={color} className={className} />;
    case 'RefreshCw':
    case 'refresh':
      return <RefreshCw size={size} color={color} className={className} />;
    case 'Target':
      return <Target size={size} color={color} className={className} />;
    case 'Wrench':
      return <Wrench size={size} color={color} className={className} />;
    case 'Factory':
      return <Factory size={size} color={color} className={className} />;
    default:
      return <BookOpen size={size} color={color} className={className} />;
  }
};
