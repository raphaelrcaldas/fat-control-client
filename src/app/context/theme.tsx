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

const customTheme = createTheme({
   modal: {
      root: { show: { on: "backdrop-blur-xs" } },
      header: { base: "border-gray-300" },
   },
   pagination: {
      pages: {
         selector: {
            active:
               "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700",
         },
      },
   },
   table: {
      body: { cell: { base: "py-2" } },
      row: { base: "border-gray-200 bg-white" },
   },
   textInput: {
      field: { input: { colors: whiteInputColors } },
   },
   select: {
      field: { select: { colors: whiteInputColors } },
   },
   textarea: {
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
   return <ThemeProvider theme={customTheme}>{children}</ThemeProvider>;
}

export default FlowbiteThemeProvider;
