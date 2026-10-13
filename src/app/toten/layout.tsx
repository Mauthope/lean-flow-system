import type { Metadata } from 'next';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden select-none">
      {children}
    </div>
  );
}
