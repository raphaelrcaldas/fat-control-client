"use client";

import React from "react";
import { ThemeProvider, createTheme } from "flowbite-react";

/**
 * Tema customizado do Flowbite React
 * Define estilos personalizados para componentes da aplicação
 */
// focus:ring-1: sem largura de ring o "foco" era só a troca de cor da borda
// (1px) — invisível na régua de acessibilidade. Vale para inputs de data
// inclusive, onde o Chromium não dá nenhum outline nativo.
const whiteInputColors = {
   gray: "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500",
};

/**
 * Bases default que precisam ser ZERADAS antes do merge (não apenas
 * sobrescritas), pois trazem utilitários com modificadores que o twMerge não
 * consegue anular numa simples sobreposição. Ver comentário em `table` abaixo.
 */
const clearTheme = {
   table: {
      head: { cell: { base: true } },
      body: { cell: { base: true } },
   },
};

const customTheme = createTheme({
   button: {
      // pointer-coarse: alvo de 44px só no dedo (regra do projeto) — no mouse
      // vale o mínimo WCAG de 24px e a densidade do desktop fica intacta.
      // min-w também: botões só-ícone (size xs/sm) ficavam com 32-37px de
      // largura no toque.
      base: "rounded-md pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]",
      // Pontas do ButtonGroup no mesmo raio do botão solto (default do
      // Flowbite é rounded-*-lg, destoando do rounded-md do projeto).
      grouped: "first:rounded-s-md last:rounded-e-md",
      // Ação de marca tematizada por org (data-org-theme). Espelha o color
      // `red` do Flowbite trocando a escala por `primary-*`. Usar em botões de
      // ação primária/de marca; `color="red"` fica reservado a perigo/exclusão.
      color: {
         primary:
            "bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800",
      },
   },
   badge: {
      root: {
         // Chip de identidade/marca tematizado (ex.: unidade do usuário).
         color: {
            primary: "bg-primary-100 text-primary-800",
         },
      },
   },
   checkbox: {
      color: {
         primary: "text-primary-600 focus:ring-primary-600",
      },
   },
   spinner: {
      color: {
         primary: "fill-primary-600",
      },
   },
   modal: {
      root: { show: { on: "backdrop-blur-xs" } },
      // rounded (não o rounded-lg default): padrão visual do projeto.
      // Botão de fechar: alvo de 44px no dedo, como todo controle.
      content: { inner: "rounded" },
      header: {
         base: "border-gray-300",
         close: {
            base: "rounded pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]",
         },
      },
   },
   pagination: {
      pages: {
         selector: {
            active:
               "bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700",
         },
      },
   },
   table: {
      root: { shadow: "hidden" },
      head: { cell: { base: "bg-gray-50 px-6 py-3 dark:bg-gray-700" } },
      body: { base: "", cell: { base: "px-6 py-2" } },
      row: { base: "border-gray-200 bg-white" },
   },
   textInput: {
      field: {
         input: {
            base: "pointer-coarse:min-h-[44px]",
            colors: whiteInputColors,
            withAddon: { on: "rounded-r", off: "rounded" },
         },
      },
   },
   select: {
      field: {
         select: {
            base: "pointer-coarse:min-h-[44px]",
            colors: whiteInputColors,
            withAddon: { on: "rounded-r", off: "rounded" },
         },
      },
   },
   textarea: {
      base: "rounded",
      colors: whiteInputColors,
   },
});

interface FlowbiteThemeProviderProps {
   children: React.ReactNode;
}

/**
 * Provider de tema do Flowbite React
 * Aplica o tema customizado em todos os componentes Flowbite da aplicação
 */
export function FlowbiteThemeProvider({
   children,
}: FlowbiteThemeProviderProps) {
   return (
      <ThemeProvider theme={customTheme} clearTheme={clearTheme}>
         {children}
      </ThemeProvider>
   );
}

export default FlowbiteThemeProvider;
