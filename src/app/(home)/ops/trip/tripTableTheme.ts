/**
 * Tema da tabela de tripulantes, compartilhado pela lista e pelo skeleton.
 *
 * O `theme` do Flowbite não substitui a string `base`: `resolve-theme` a
 * concatena e resolve com **twMerge**, então basta declarar o que muda — o
 * `px-3` vence o `px-6` do tema global e o `lg:px-6` sobrevive ao lado dele.
 *
 * Só o padding horizontal muda: a tabela aparece a partir de `md`, onde os
 * `px-6` do tema apertariam as colunas de nome. O `py-2` continua vindo do
 * tema global — ele é a escala de densidade do sistema, e descer para `py-1`
 * é justamente o que a regra proíbe.
 */
export const TRIP_TABLE_THEME = {
   head: { cell: { base: "px-3 lg:px-6" } },
   body: { cell: { base: "px-3 lg:px-6" } },
};
