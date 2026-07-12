/**
 * Reguas de UI/UX aplicadas pelos coletores.
 *
 * Politica separada do mecanismo: mudar um limiar (ex: alvo minimo de toque)
 * nao encosta no coletor que o usa — ele recebe a regua por injecao.
 */

export const HEURISTICS = {
   /**
    * A regua depende do PONTEIRO, nao da tela.
    *
    * - Dedo (`pointer: coarse`): 44x44 e o alvo confortavel (Apple HIG / MD) —
    *   e o caso do tablet no hangar.
    * - Mouse (`pointer: fine`): a precisao e outra; vale o minimo do WCAG 2.2
    *   (criterio 2.5.8), 24x24. Cobrar 44px aqui infla o shell e custa
    *   densidade — que num sistema operacional e qualidade, nao defeito.
    */
   touchTarget: { coarseMinPx: 44, fineMinPx: 24 },

   /**
    * Grade do Tailwind. O passo e 0.125rem, nao 0.25rem: a escala tem os meios
    * (`p-1.5` = 0.375rem, `p-2.5` = 0.625rem), que sao classes oficiais — cobrar
    * 0.25rem acusaria de "fora do sistema" quem esta usando o sistema.
    *
    * Medido em REM, nao em px: o `client` usa raiz de 87.5% (1rem = 14px), entao
    * a escala inteira encolhe e um `p-2` rende 7px. Regua em px acusaria a tela
    * toda de estar fora da grade quando ela so esta noutra base.
    */
   spacing: { gridRem: 0.125 },

   /** Medida (comprimento de linha) legivel para texto corrido. */
   lineMeasure: { minChars: 45, maxChars: 75, minTextLength: 120 },

   /** Entrelinha apertada em texto de leitura cansa; titulos podem ser apertados. */
   typography: { minLineHeightRatio: 1.35, bodyMaxFontSizePx: 16 },

   /**
    * Padrao visual do projeto (rules/frontend/components.md): `rounded`
    * (0.25rem) e, so em caixa de icone, `rounded-md` (0.375rem). Tambem em rem,
    * pelo mesmo motivo do spacing. `pillMinPx` isenta `rounded-full`.
    */
   shape: { allowedRadiiRem: [0.25, 0.375], pillMinPx: 100 },

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
