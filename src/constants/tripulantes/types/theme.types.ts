/**
 * Tipos de tema para UI
 * Cores compatíveis com Tailwind CSS e Flowbite React
 */

/** Cores disponíveis no Tailwind (subset usado no projeto) */
export type ThemeColor =
   "blue" | "cyan" | "amber" | "emerald" | "red" | "purple" | "pink" | "gray";

/** Cores de Badge do Flowbite React */
export type BadgeColor =
   | "info"
   | "warning"
   | "success"
   | "failure"
   | "purple"
   | "pink"
   | "gray"
   | "cyan";

/** Configuração de tema para elementos de UI */
export interface Theme {
   /** Cor base para backgrounds e borders (Tailwind) */
   color: ThemeColor;
   /** Cor do Badge Flowbite */
   badge: BadgeColor;
}
