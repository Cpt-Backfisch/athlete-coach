interface IntensityDotsProps {
  intensity: number;
  size?: 'sm' | 'md';
}

// Stellt Intensität 1–5 als gefüllte/leere Punkte dar.
// Gefüllt: Purple #8E6FE0, leer: grau mit opacity-30.
export function IntensityDots({ intensity, size = 'sm' }: IntensityDotsProps) {
  const dotClass = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`${dotClass} rounded-full`}
          style={{
            backgroundColor: i < intensity ? '#8E6FE0' : undefined,
            border: i < intensity ? 'none' : '1.5px solid #8E6FE0',
            opacity: i < intensity ? 1 : 0.3,
          }}
        />
      ))}
    </span>
  );
}
