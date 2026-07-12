/**
 * Reguas de UI/UX aplicadas pelos coletores.
 *
 * Politica separada do mecanismo: mudar um limiar (ex: alvo minimo de toque)
 * nao encosta no coletor que o usa — ele recebe a regua por injecao.
 */

export const HEURISTICS = {
   /** WCAG 2.2 (2.5.8) pede 24x24 CSS px; 44x44 e o alvo confortavel (Apple HIG / MD). */
   touchTarget: { minSizePx: 44, wcagMinPx: 24 },

   /** Tailwind opera numa grade de 4px; valor fora dela e quase sempre acidente. */
   spacing: { gridPx: 4 },

   /** Medida (comprimento de linha) legivel para texto corrido. */
   lineMeasure: { minChars: 45, maxChars: 75, minTextLength: 120 },

   /** Entrelinha apertada em texto de leitura cansa; titulos podem ser apertados. */
   typography: { minLineHeightRatio: 1.35, bodyMaxFontSizePx: 16 },

   /** Padrao visual do projeto (rules/frontend/components.md): `rounded` = 4px. */
   shape: { allowedRadiiPx: [0, 4, 6, 9999] },

   /** Google considera bom ate 0.1. */
   layoutShift: { goodClsThreshold: 0.1 },

   accessibility: {
      tags: [
         "wcag2a",
         "wcag2aa",
         "wcag21a",
         "wcag21aa",
         "wcag22aa",
         "best-practice",
      ],
   },

   focusRing: { maxStops: 30 },
};
