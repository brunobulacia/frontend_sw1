'use client';

interface PokerCardProps {
  value: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function PokerCard({
  value,
  selected = false,
  disabled = false,
  onClick,
  size = 'md',
}: PokerCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-20 text-lg',
    md: 'w-20 h-28 text-2xl',
    lg: 'w-24 h-32 text-3xl',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        rounded-xl font-bold transition-all duration-200
        ${
          selected
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white scale-110 shadow-lg shadow-emerald-500/50 border-2 border-emerald-300'
            : 'bg-gradient-to-br from-white/10 to-white/5 text-white/90 hover:from-white/20 hover:to-white/10 border border-white/20'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        flex items-center justify-center
      `}
    >
      {value}
    </button>
  );
}