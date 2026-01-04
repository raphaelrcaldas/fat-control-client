"use client";

import React from "react";
import { ThemeProvider, createTheme } from "flowbite-react";

/**
 * Tema customizado do Flowbite React
 * Define estilos personalizados para componentes da aplicação
 */
const customTheme = createTheme({
   modal: {
      root: { show: { on: "backdrop-blur-xs" } },
      header: { base: "border-gray-300" },
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
