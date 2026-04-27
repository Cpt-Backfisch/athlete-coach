import { SPORT_GRADIENTS } from '@/lib/sportColors';

/**
 * SVG <defs> mit linearen Gradienten für alle Sportarten.
 * Als Kind direkt in ein Recharts-Chart einbetten:
 *   <BarChart data={data}>
 *     <SportGradientDefs />
 *     <Bar fill="url(#gradient-run)" />
 *   </BarChart>
 *
 * Richtung: y1=1→y2=0 = unten dunkel, oben hell (für aufsteigende Balken).
 */
export function SportGradientDefs() {
  return (
    <defs>
      {Object.values(SPORT_GRADIENTS).map(({ id, from, to }) => (
        <linearGradient key={id} id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      ))}
    </defs>
  );
}
