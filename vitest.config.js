import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Testdateien in tests/unit/
    include: ['tests/unit/**/*.test.js'],
    // Node-Umgebung — kein Browser/DOM nötig für pure Utility-Funktionen
    environment: 'node',
  },
});
