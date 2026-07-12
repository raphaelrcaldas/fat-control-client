/**
 * Utilitarios que rodam DENTRO da pagina.
 *
 * Injetados uma vez por sessao em `window.__audit`, para que cada coletor
 * browser-side dependa dessa abstracao em vez de recarregar seus proprios
 * helpers. A funcao precisa ser autocontida: `page.evaluate` serializa o corpo
 * e nao leva closure nem imports.
 */
export function installDomUtils() {
   const px = (value) => Math.round(parseFloat(value) * 100) / 100;

   const isVisible = (el) => {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden")
         return false;
      if (Number(style.opacity) === 0) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
   };

   const selectorOf = (el) => {
      const id = el.id ? `#${el.id}` : "";
      const classes =
         typeof el.className === "string" && el.className.trim()
            ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".")
            : "";
      return `${el.tagName.toLowerCase()}${id}${classes}`;
   };

   /** Texto proprio do elemento — ignora o que vem dos filhos. */
   const ownText = (el) => {
      let text = "";
      for (const node of el.childNodes) {
         if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
      }
      return text.trim();
   };

   const visibleElements = () =>
      [...document.body.querySelectorAll("*")].filter(isVisible);

   /** Contador com amostras — a evidencia que faz o achado ser acionavel. */
   const counter = () => {
      const map = new Map();
      return {
         add(key, sample) {
            const entry = map.get(key) ?? { count: 0, samples: [] };
            entry.count++;
            if (sample && entry.samples.length < 3)
               entry.samples.push(String(sample).slice(0, 60));
            map.set(key, entry);
         },
         get size() {
            return map.size;
         },
         entries(parse = (key) => key) {
            return [...map.entries()]
               .map(([key, { count, samples }]) => ({
                  value: parse(key),
                  count,
                  samples,
               }))
               .sort((a, b) => b.count - a.count);
         },
      };
   };

   /**
    * 1rem em px. NAO assumir 16: o `client` usa `html {font-size:14px}`, entao a
    * escala inteira do Tailwind encolhe (um `p-2` rende 7px, nao 8px). Grade e
    * raio precisam ser medidos em rem, senao acusamos a tela toda de estar fora
    * do sistema quando ela so esta noutra base.
    */
   const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
   );
   const toRem = (value) => Math.round((value / rootFontSize) * 10000) / 10000;

   window.__audit = {
      px,
      isVisible,
      selectorOf,
      ownText,
      visibleElements,
      counter,
      rootFontSize,
      toRem,
   };
}
