/**
 * Konvertiert einen Strava-CSV-Rohwert in Meter (interne Speichereinheit der App).
 *
 * Strava Bulk-CSV-Logik (aus index.html, Zeile ~3250):
 *   - Spalte 'distance_mi': Meilen → Meter (* 1609.34)
 *   - Sporttyp 'swim':      bereits in Metern, keine Konversion nötig
 *   - Alle anderen:         Kilometer → Meter (* 1000)
 *
 * @param {number} rawDist      Rohwert aus CSV (bereits als float geparst, 0 bei fehlendem Wert)
 * @param {string} type         Normierter Sporttyp ('swim', 'run', 'bike', 'tri', 'other')
 * @param {string} [distHeader] Name der Distanz-Spalte im CSV-Header (z.B. 'distance_mi')
 * @returns {number} Distanz in Metern
 */
export function convertStravaDistance(rawDist, type, distHeader = '') {
  if (!rawDist) return 0;

  if (distHeader.includes('mi') && !distHeader.includes('min')) {
    // Meilen-Spalte (z.B. 'distance_mi') — in Meter umrechnen
    return rawDist * 1609.34;
  }

  if (type === 'swim') {
    // Strava liefert Schwimmdistanz im Bulk-CSV bereits in Metern
    return rawDist;
  }

  // Alle anderen Sportarten: km → Meter
  return rawDist * 1000;
}
