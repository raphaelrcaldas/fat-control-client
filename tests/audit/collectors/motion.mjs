/**
 * Movimento: transicoes e animacoes declaradas na tela.
 *
 * Os outros coletores medem a pagina PARADA. Este mede o que ela faz quando
 * muda de estado — a dimensao que some do screenshot e por isso passava batida.
 *
 * Mede por `getComputedStyle`, nao por `getAnimations()`: em repouso nao ha
 * nenhuma animacao rodando, entao `getAnimations()` volta vazio numa tela cheia
 * de `transition`. O que se audita aqui e a DECLARACAO — o que vai acontecer
 * quando o estado mudar — e essa esta no computed style o tempo todo.
 *
 * Tres perguntas:
 *
 * 1. **Anima propriedade cara?** `transform`/`opacity`/`filter` sobem para a
 *    GPU e nao repintam layout. `width`, `top`, `padding`, `font-size` forcam
 *    reflow a cada quadro — a 60fps, e o caminho mais curto para jank. Caso
 *    especial: `transition-property: all` (o `transition-all` do Tailwind) e
 *    suspeito por construcao, porque anima o que quer que venha a mudar,
 *    layout incluso.
 *
 * 2. **Dura demais?** Micro-interacao de UI vive na casa de 150-300ms. Acima da
 *    regua a interface parece arrastada. Animacao INFINITA (o `animate-pulse`
 *    de um skeleton) e isenta: ali a duracao e o ritmo, nao a espera.
 *
 * 3. **Respeita `prefers-reduced-motion`?** Segundo passe com a media emulada,
 *    relendo o mesmo computed style. Este passe pega uma falha que ler o CSS
 *    fonte NAO pega: um bloco `@media (prefers-reduced-motion: reduce)` pode
 *    existir e mesmo assim nao valer, porque um shorthand `transition:`
 *    declarado depois, com a mesma especificidade, reescreve a duracao inteira.
 *    Como aqui a pergunta e feita ao navegador ja com a media ligada, o que se
 *    obtem e o efeito real, seja qual for o motivo de ele faltar.
 *
 * A regua de conformidade e `reducedMaxMs`, nao zero: o padrao usado com Radix
 * e encolher a duracao para 0.01ms em vez de `animation: none`, porque com
 * duracao zero o painel nao chega a desmontar. Isso e conforme e nao deve virar
 * achado.
 */
export function createMotionCollector({
   maxDurationMs,
   maxEnterMs,
   reducedMaxMs,
   compositedProps,
   layoutProps,
}) {
   return {
      name: "motion",

      async collect({ page }) {
         const config = { compositedProps, layoutProps };

         const normal = await scan(page, config);

         let reduced;
         try {
            await page.emulateMedia({ reducedMotion: "reduce" });
            reduced = await scan(page, config);
         } finally {
            // Sem isto a emulacao vaza para os coletores seguintes — e para a
            // aba viva, que fica em reduced-motion depois que o processo sai.
            await page.emulateMedia({ reducedMotion: null });
         }

         const slow = normal.filter((e) => {
            if (e.infinite) return false;
            const regua = e.kind === "animation" ? maxEnterMs : maxDurationMs;
            return e.durMs > regua;
         });
         // So `layout` e `all` viram achado. `paint` (o `transition-colors` do
         // Tailwind: color, background-color, border-color...) fica de fora de
         // proposito: e a forma RECOMENDADA de animar hover, e listar as sete
         // longhands que o Tailwind expande afogava o sinal real em ruido.
         const expensive = normal.filter(
            (e) => e.category === "layout" || e.category === "all"
         );
         const ignoresReduced = reduced.filter((e) => e.durMs > reducedMaxMs);

         return {
            total: count(normal),
            slow,
            expensive,
            ignoresReduced: {
               elements: count(ignoresReduced),
               of: count(normal),
               entries: ignoresReduced,
            },
         };
      },

      render: (data) => ({
         rows: [
            ["Animacoes", data.total],
            ["Lentas", count(data.slow)],
            ["Anima layout", count(data.expensive)],
            [
               "Ignoram reduced-motion",
               `${data.ignoresReduced.elements} de ${data.ignoresReduced.of}`,
            ],
         ],
         sections: [
            section(
               `Anima layout (reflow a cada quadro) ou \`all\``,
               data.expensive
            ),
            section(`Duracao acima da regua`, data.slow),
            section(
               `Continua animando com prefers-reduced-motion: reduce`,
               data.ignoresReduced.entries
            ),
         ].filter(Boolean),
      }),
   };
}

const count = (entries) => entries.reduce((sum, e) => sum + e.count, 0);

function section(title, entries) {
   if (!entries.length) return null;
   return {
      title,
      items: entries
         .slice(0, 12)
         .map(
            (e) =>
               `\`${e.prop}\` ${e.durMs}ms ${e.ease} — ${e.count}x ` +
               `(${e.samples.join(", ")})`
         ),
   };
}

/**
 * Varre os elementos visiveis e agrega por assinatura da animacao. Agregar e o
 * que torna o achado legivel: uma tabela de 200 linhas com o mesmo `transition`
 * e UM problema repetido 200 vezes, nao 200 problemas.
 */
function scan(page, config) {
   return page.evaluate(({ compositedProps, layoutProps }) => {
      /** Split que respeita parenteses: `cubic-bezier(.4, 0, .2, 1)` tem virgulas. */
      const splitTop = (value) => {
         const parts = [];
         let depth = 0;
         let current = "";
         for (const char of value) {
            if (char === "(") depth++;
            else if (char === ")") depth--;
            if (char === "," && depth === 0) {
               parts.push(current.trim());
               current = "";
            } else current += char;
         }
         if (current.trim()) parts.push(current.trim());
         return parts;
      };

      const toMs = (value) =>
         value.endsWith("ms")
            ? parseFloat(value)
            : Math.round(parseFloat(value) * 1000 * 100) / 100;

      const categoryOf = (prop) => {
         if (prop === "all") return "all";
         if (compositedProps.includes(prop)) return "composited";
         if (layoutProps.some((p) => prop.startsWith(p))) return "layout";
         return "paint";
      };

      // A lista CSS de duracoes/easings pode ser mais curta que a de
      // propriedades; o CSS a repete ciclicamente.
      const at = (list, i) => list[i % list.length] ?? list[0];

      const counter = window.__audit.counter();

      for (const el of window.__audit.visibleElements()) {
         const style = getComputedStyle(el);
         const selector = window.__audit.selectorOf(el);

         const props = splitTop(style.transitionProperty);
         const durations = splitTop(style.transitionDuration);
         const easings = splitTop(style.transitionTimingFunction);

         props.forEach((prop, i) => {
            if (prop === "none") return;
            // Custom properties (`--tw-gradient-from` e afins) entram na lista
            // expandida do Tailwind mas nao sao propriedade animavel de
            // verdade — so ruido no relatorio.
            if (prop.startsWith("--")) return;
            const durMs = toMs(at(durations, i));
            if (!durMs) return; // declarado sem duracao: nao anima
            counter.add(
               JSON.stringify({
                  kind: "transition",
                  prop,
                  durMs,
                  ease: at(easings, i),
                  category: categoryOf(prop),
                  infinite: false,
               }),
               selector
            );
         });

         const names = splitTop(style.animationName);
         const animDurations = splitTop(style.animationDuration);
         const animEasings = splitTop(style.animationTimingFunction);
         const iterations = splitTop(style.animationIterationCount);

         names.forEach((name, i) => {
            if (name === "none") return;
            const durMs = toMs(at(animDurations, i));
            if (!durMs) return;
            counter.add(
               JSON.stringify({
                  kind: "animation",
                  prop: `@keyframes ${name}`,
                  durMs,
                  ease: at(animEasings, i),
                  // Keyframes podem animar qualquer coisa; so a leitura da
                  // regra diria qual. Fica fora da regua de custo em vez de
                  // gerar achado que nao se sustenta.
                  category: "composited",
                  infinite: at(iterations, i) === "infinite",
               }),
               selector
            );
         });
      }

      return counter.entries(JSON.parse).map(({ value, count, samples }) => ({
         ...value,
         count,
         samples,
      }));
   }, config);
}
