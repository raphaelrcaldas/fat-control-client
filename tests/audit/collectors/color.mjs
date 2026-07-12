/**
 * Paleta efetiva da tela.
 *
 * Contraste em si e responsabilidade do axe (regra `color-contrast`, que ja
 * lida com fundo composto e texto sobre imagem). Aqui medimos outra coisa: a
 * *dispersao* da paleta. Vinte cinzas ligeiramente diferentes nao reprovam
 * nenhum teste automatico e ainda assim denunciam uma tela sem sistema.
 */
export function createColorCollector() {
   return {
      name: "color",

      collect: ({ page }) =>
         page.evaluate(() => {
            const { px, selectorOf, ownText, visibleElements, counter } =
               window.__audit;
            const text = counter();
            const background = counter();
            const border = counter();

            for (const el of visibleElements()) {
               const style = getComputedStyle(el);

               if (ownText(el)) text.add(style.color, selectorOf(el));

               if (style.backgroundColor !== "rgba(0, 0, 0, 0)") {
                  background.add(style.backgroundColor, selectorOf(el));
               }
               if (style.backgroundImage !== "none") {
                  background.add(
                     `image: ${style.backgroundImage.slice(0, 48)}`,
                     selectorOf(el)
                  );
               }

               const width =
                  px(style.borderTopWidth) +
                  px(style.borderRightWidth) +
                  px(style.borderBottomWidth) +
                  px(style.borderLeftWidth);
               if (width > 0) border.add(style.borderTopColor, selectorOf(el));
            }

            return {
               distinctTextColors: text.size,
               distinctBackgrounds: background.size,
               distinctBorderColors: border.size,
               textColors: text.entries().slice(0, 12),
               backgrounds: background.entries().slice(0, 12),
               borderColors: border.entries().slice(0, 8),
            };
         }),

      render: (data) => ({
         rows: [
            ["Cores de texto distintas", data.distinctTextColors],
            ["Fundos distintos", data.distinctBackgrounds],
            ["Cores de borda distintas", data.distinctBorderColors],
         ],
         sections: [
            {
               title: "Cores de texto mais usadas",
               items: data.textColors.map((c) => `${c.value} — ${c.count}x`),
            },
         ],
      }),
   };
}
