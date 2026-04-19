interface ReadOnlyBannerProps {
  ownerName?: string;
}

// Fixiertes Banner im Share-Modus — bleibt immer sichtbar
export function ReadOnlyBanner({ ownerName }: ReadOnlyBannerProps) {
  const text = ownerName
    ? `👀 Du schaust ${ownerName}s Trainingslog — nur lesend`
    : '👀 Du schaust ein Trainingslog — nur lesend';

  return (
    <div
      className="sticky top-0 z-50 w-full px-4 py-2.5 text-center text-sm font-medium text-white"
      style={{ backgroundColor: '#8E6FE0' }}
    >
      {text}
    </div>
  );
}
