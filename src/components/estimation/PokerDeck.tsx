'use client';

import PokerCard from './PokerCard';

interface PokerDeckProps {
  sequence: string[];
  selectedValue: string | null;
  onSelectCard: (value: string) => void;
  disabled?: boolean;
}

export default function PokerDeck({
  sequence,
  selectedValue,
  onSelectCard,
  disabled = false,
}: PokerDeckProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Selecciona tu estimación:</h3>
      <div className="flex flex-wrap gap-4 justify-center">
        {sequence.map((value) => (
          <PokerCard
            key={value}
            value={value}
            selected={selectedValue === value}
            disabled={disabled}
            onClick={() => onSelectCard(value)}
          />
        ))}
      </div>
    </div>
  );
}