// Zentrale Formatierungs-Utilities — Einheiten und Zahlen auf Deutsch

const DE_1 = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const DE_INT = new Intl.NumberFormat('de-DE');

/** Stunden als "1,5 Std" — für KPI-Werte und Chart-Tooltips */
export function formatDuration(hours: number): string {
  return DE_1.format(hours) + ' Std';
}

/** Stunden als "1:30 Std" — für kompakte Zeitangaben in Wochenkarten */
export function formatHoursMinutes(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${String(m).padStart(2, '0')} Std`;
}

/** Kilometer als "12,3 km" */
export function formatDistanceKm(km: number, decimals = 1): string {
  return (
    new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(km) + ' km'
  );
}

/** Schwimm-Meter als "3.525 m" mit deutschem Tausenderpunkt */
export function formatSwimMeters(meters: number): string {
  return DE_INT.format(Math.round(meters)) + ' m';
}

/** Generischer Zahlenformatter mit deutschem Tausenderpunkt */
export function formatNumberDE(n: number): string {
  return DE_INT.format(n);
}
