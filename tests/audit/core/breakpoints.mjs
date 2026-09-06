/**
 * `touch` nao e so o tamanho da tela: liga a emulacao de ponteiro grosso (dedo),
 * o que faz `@media (pointer: coarse)` valer na pagina. E o que separa a regua
 * de alvo confortavel (44px, dedo) da regua de alvo minimo (24px, mouse) — sem
 * isso, cobrariamos 44px no desktop e inflariamos a UI sem ganho nenhum.
 *
 * `mobile` nao e um retangulo generico: e o **Galaxy S25** (360x780 CSS, dpr 3),
 * o aparelho de referencia do projeto. Ajuste de mobile se confere nele — outro
 * tamanho responde outra pergunta.
 *
 * `dpr` importa alem da nitidez do screenshot: em dpr fracionario a borda de 1px
 * cai em meio pixel fisico e o browser a esmaece, entao contraste de hairline
 * medido em dpr 1 nao e o que o aparelho mostra.
 */
export const BREAKPOINTS = [
   {
      name: "mobile",
      device: "Galaxy S25",
      width: 360,
      height: 780,
      dpr: 3,
      touch: true,
   },
   { name: "tablet", width: 768, height: 1024, dpr: 2, touch: true },
   { name: "desktop", width: 1280, height: 900, dpr: 1, touch: false },
   { name: "wide", width: 1920, height: 1080, dpr: 1, touch: false },
];

export function selectBreakpoints(names) {
   if (!names?.length) return BREAKPOINTS;

   return names.map((name) => {
      const breakpoint = BREAKPOINTS.find((b) => b.name === name);
      if (!breakpoint) {
         throw new Error(
            `Breakpoint desconhecido: ${name}. Validos: ${BREAKPOINTS.map((b) => b.name).join(", ")}`
         );
      }
      return breakpoint;
   });
}
