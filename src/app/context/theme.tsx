"use client";

import React from "react";
import { ThemeProvider, createTheme } from "flowbite-react";

/**
 * Tema customizado do Flowbite React
 * Define estilos personalizados para componentes da aplicação
 */
const whiteInputColors = {
   gray: "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500",
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
      base: "rounded-md",
      // Ação de marca tematizada por org (data-org-theme). Espelha o color
      // `red` do Flowbite trocando a escala por `primary-*`. Usar em botões de
      // ação primária/de marca; `color="red"` fica reservado a perigo/exclusão.
      color: {
         primary:
            "bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800",
      },
   },
   modal: {
      root: { show: { on: "backdrop-blur-xs" } },
      header: { base: "border-gray-300" },
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
            colors: whiteInputColors,
            withAddon: { on: "rounded-r", off: "rounded" },
         },
      },
   },
   select: {
      field: {
         select: {
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
