import type { Metadata } from 'next';
import '@/components/toten/toten.css';

export const metadata: Metadata = {
  title: 'Toten Chão de Fábrica — Sensei Kaizen',
  description: 'Quiosque industrial interativo de captação de ideias Kaizen e cultura Lean.',
};

export default function TotenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="toten-root">
      {children}
    </div>
  );
}
