export const BREAKPOINTS = [
   { name: "mobile", width: 360, height: 800 },
   { name: "tablet", width: 768, height: 1024 },
   { name: "desktop", width: 1280, height: 900 },
   { name: "wide", width: 1920, height: 1080 },
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
