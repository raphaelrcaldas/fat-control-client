/**
 * `touch` nao e so o tamanho da tela: liga a emulacao de ponteiro grosso (dedo),
 * o que faz `@media (pointer: coarse)` valer na pagina. E o que separa a regua
 * de alvo confortavel (44px, dedo) da regua de alvo minimo (24px, mouse) — sem
 * isso, cobrariamos 44px no desktop e inflariamos a UI sem ganho nenhum.
 */
export const BREAKPOINTS = [
   { name: "mobile", width: 360, height: 800, touch: true },
   { name: "tablet", width: 768, height: 1024, touch: true },
   { name: "desktop", width: 1280, height: 900, touch: false },
   { name: "wide", width: 1920, height: 1080, touch: false },
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
