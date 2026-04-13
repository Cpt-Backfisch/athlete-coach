/**
 * Schätzt den VDOT-Wert (äquivalent zu VO2max) aus einem Rennergebnis.
 *
 * Formel: Jack Daniels & J.R. Gilbert, "Oxygen Power" (1979).
 * Referenzimplementierung: https://runsmartproject.com/calculator/
 *
 * Schritt 1 — VO2 bei vollständigem Einsatz (100 % VO2max):
 *   vo2 = -4.60 + 0.182258 * v + 0.000104 * v²
 *   (v = Laufgeschwindigkeit in m/min)
 *
 * Schritt 2 — Prozentualer VO2max-Einsatz bei Renndauer t (Minuten):
 *   pctVO2 = 0.8 + 0.1894393 * e^(-0.012778 * t)
 *                + 0.2989558 * e^(-0.1932605 * t)
 *
 * Schritt 3 — VDOT = vo2 / pctVO2
 *
 * @param {number} distKm   Renndistanz in Kilometern
 * @param {number} timeSec  Rennzeit in Sekunden
 * @returns {number} VDOT-Schätzung (auf eine Dezimalstelle gerundet)
 */
export function calcVO2maxFromRace(distKm, timeSec) {
  const v = (distKm * 1000 / timeSec) * 60; // Geschwindigkeit in m/min
  const t = timeSec / 60;                    // Rennzeit in Minuten
  const pctVO2 =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * t) +
    0.2989558 * Math.exp(-0.1932605 * t);
  const vo2 = -4.60 + 0.182258 * v + 0.000104 * v * v;
  return Math.round((vo2 / pctVO2) * 10) / 10;
}
