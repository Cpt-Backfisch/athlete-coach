// Platzhalter-Avatar — Strichmännchen in Sportart-Lila.
// Wird durch avatar_transparent.png ersetzt, sobald Sebastian das Bild liefert.
export function AvatarIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" fill="#111111" />
      {/* Kopf */}
      <circle cx="18" cy="7" r="3.5" stroke="#8E6FE0" strokeWidth="1.5" />
      {/* Körper */}
      <line
        x1="18"
        y1="10.5"
        x2="17"
        y2="21"
        stroke="#8E6FE0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Linker Arm */}
      <line
        x1="17.5"
        y1="14"
        x2="11"
        y2="18"
        stroke="#8E6FE0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Rechter Arm */}
      <line
        x1="17.5"
        y1="14"
        x2="23"
        y2="11"
        stroke="#8E6FE0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Linkes Bein */}
      <line
        x1="17"
        y1="21"
        x2="12"
        y2="27"
        stroke="#8E6FE0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Rechtes Bein */}
      <line
        x1="17"
        y1="21"
        x2="22"
        y2="28"
        stroke="#8E6FE0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
