/**
 * Tema da tabela de comissionamentos, compartilhado pela lista e pelo skeleton.
 *
 * O `theme` do Flowbite não substitui a string `base`: `resolve-theme` a
 * concatena e resolve com **twMerge**, então basta declarar o que muda — o
 * `px-3` vence o `px-6` do tema global e o `lg:px-6` sobrevive ao lado dele.
 *
 * Só o padding horizontal muda: com nove colunas, os `px-6` do tema consomem
 * largura que falta ao nome e às três colunas de dias. O `py-2` continua vindo
 * do tema global — ele é a escala de densidade do sistema.
 */
export const COMISS_TABLE_THEME = {
   head: { cell: { base: "px-2 lg:px-3 xl:px-6" } },
   body: { cell: { base: "px-2 lg:px-3 xl:px-6" } },
};
