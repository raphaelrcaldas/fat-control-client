/**
 * Navegacao por teclado: percorre a pagina com Tab e verifica se cada parada
 * tem indicador de foco visivel.
 *
 * Usa Tab de verdade (nao `element.focus()`) porque `:focus-visible` so acende
 * quando o foco veio do teclado — que e exatamente o caso que interessa.
 *
 * O indicador nem sempre mora no elemento focado: um botao transparente pode
 * acender o anel num filho (`group-focus-visible:` no pill do OrgSwitcher).
 * Por isso a checagem e um DIFF: fotografa outline/box-shadow/borda do
 * elemento e descendentes com foco, compara com a mesma fotografia depois que
 * o foco sai, e considera "com indicador" qualquer mudanca visual.
 */
export function createFocusRingCollector({ maxStops }) {
   return {
      name: "focusRing",

      async collect({ page }) {
         await page.evaluate(() => {
            window.__auditFocus = {
               prev: null,
               // Teto de descendentes fotografados por parada. Indicador em
               // filho (padrao pill/group-focus-visible) vive nos primeiros
               // niveis; o teto evita varrer sub-arvores gigantes quando o
               // foco cai num container largo.
               DESCENDANT_CAP: 40,
               signature(node) {
                  const s = getComputedStyle(node);
                  return [
                     s.outlineWidth,
                     s.outlineStyle,
                     s.outlineColor,
                     s.boxShadow,
                     s.borderColor,
                     s.backgroundColor,
                  ].join("|");
               },
               // Fotografa o elemento focado + descendentes (limitado) para o
               // diff da proxima parada. Guarda a assinatura da ENTRADA do
               // foco: em <input type=date> a ultima sub-parada e o botao do
               // calendario no shadow DOM nativo — la o host nem casa :focus
               // e re-fotografar apagaria o indicador que acendeu na entrada.
               snapshot(el, meta) {
                  if (this.prev?.el === el) return;
                  // TreeWalker com teto: nao materializa a sub-arvore inteira
                  // (querySelectorAll("*")) so para descartar o excedente.
                  const nodes = [el];
                  const walker = document.createTreeWalker(
                     el,
                     NodeFilter.SHOW_ELEMENT,
                  );
                  while (
                     nodes.length <= this.DESCENDANT_CAP &&
                     walker.nextNode()
                  ) {
                     nodes.push(walker.currentNode);
                  }
                  this.prev = {
                     el,
                     meta,
                     nodes,
                     sigs: nodes.map((n) => this.signature(n)),
                  };
               },
               // So resolve quando o foco REALMENTE saiu de prev.el — em
               // <input type=date> o Tab percorre os sub-campos (dia/mes/ano)
               // sem trocar o activeElement, e diffar com o elemento ainda
               // focado acusaria "sem indicador" com o anel aceso na tela.
               // Se alguma assinatura mudou apos o blur, havia indicador.
               resolvePrev() {
                  const prev = this.prev;
                  if (!prev) return null;
                  const inDom = document.contains(prev.el);
                  if (inDom && document.activeElement === prev.el) return null;
                  this.prev = null;
                  if (!inDom) return { ...prev.meta, hasRing: true };
                  // Curto-circuito: na maioria dos controles o indicador esta
                  // no proprio elemento (indice 0) — só varre os descendentes
                  // quando o host nao mudou.
                  const changed =
                     this.signature(prev.el) !== prev.sigs[0] ||
                     prev.nodes.some(
                        (n, i) => i > 0 && this.signature(n) !== prev.sigs[i],
                     );
                  return { ...prev.meta, hasRing: changed };
               },
            };
         });

         const stops = [];

         for (let i = 0; i < maxStops; i++) {
            await page.keyboard.press("Tab");

            const result = await page.evaluate(() => {
               const done = window.__auditFocus.resolvePrev();

               const el = document.activeElement;
               if (!el || el === document.body) return { done, current: false };

               window.__auditFocus.snapshot(el, {
                  selector: window.__audit.selectorOf(el),
                  label: (el.getAttribute("aria-label") ?? el.textContent ?? "")
                     .trim()
                     .slice(0, 40),
               });

               return { done, current: true };
            });

            if (result.done) stops.push(result.done);
            if (!result.current) break;
         }

         // Ultima parada: tira o foco e resolve o diff pendente.
         const last = await page.evaluate(() => {
            document.activeElement?.blur?.();
            return window.__auditFocus.resolvePrev();
         });
         if (last) stops.push(last);

         return { stops, withoutRing: stops.filter((s) => !s.hasRing) };
      },

      render: (data) => ({
         rows: [
            ["Paradas de Tab", data.stops.length],
            ["Sem foco visivel", data.withoutRing.length],
         ],
         sections: data.withoutRing.length
            ? [
                 {
                    title: "Foco invisivel ao teclado",
                    items: data.withoutRing.map(
                       (s) => `\`${s.selector}\` — "${s.label}"`
                    ),
                 },
              ]
            : [],
      }),
   };
}
