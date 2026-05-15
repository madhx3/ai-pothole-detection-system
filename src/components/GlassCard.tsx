import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <div
      className={`
        bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
        ${hover ? 'transition-all duration-300 hover:bg-white/15 hover:shadow-[0_8px_32px_0_rgba(0,162,255,0.4)] hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
