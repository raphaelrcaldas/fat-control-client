import clsx from "clsx";

/**
 * Chip do tipo de comissionamento (Período / Comparativo).
 *
 * Largura fixa nos dois estados: com o chip dimensionado pelo texto, uma
 * coluna de 70 linhas alternava entre duas caixas de tamanhos diferentes e a
 * borda direita serrilhava — o olho lia a variação como dado, e não como
 * comprimento de palavra. Ancorado à esquerda, o par vira uma coluna só.
 *
 * O acabamento é de borda e sombra, não de fundo saturado: numa tabela densa o
 * preenchimento forte compete com o progresso e com o restante, que são os
 * números que se procura.
 */
export function TipoComissChip({
   periodo,
   className,
}: {
   periodo: boolean;
   className?: string;
}) {
   return (
      <span
         className={clsx(
            "inline-flex w-[5.5rem] items-center justify-center rounded border px-2 py-0.5 text-xs font-medium shadow-sm",
            periodo
               ? "border-sky-200 bg-sky-50 text-sky-800"
               : "border-violet-200 bg-violet-50 text-violet-800",
            className
         )}
      >
         {periodo ? "Período" : "Comparativo"}
      </span>
   );
}

/**
 * Chip do módulo (Sim / Não).
 *
 * Mesmo acabamento do chip de tipo — borda, sombra e largura fixa — para que a
 * linha tenha um vocabulário só de chip, e não um par de caixas com pesos
 * diferentes. A largura menor basta para as duas palavras e não rouba a folga
 * que falta às colunas numéricas.
 *
 * O vermelho do "Não" é decisão do dono da tela: aqui ele é sinal de domínio
 * (a ausência de módulo é o que se procura na varredura), não erro. Ver
 * `docs/ai/notes/ui-ux.md`.
 */
export function ModuloComissChip({
   modulo,
   className,
}: {
   modulo: boolean;
   className?: string;
}) {
   return (
      <span
         /* "Sim"/"Não" sozinho nao diz nada a quem ouve a tela, e `title` nao e
            anunciado de forma confiavel: o nome acessivel vai no aria-label. */
         aria-label={modulo ? "Com módulo" : "Sem módulo"}
         title={modulo ? "Com módulo" : "Sem módulo"}
         className={clsx(
            "inline-flex w-12 items-center justify-center rounded border px-2 py-0.5 text-xs font-medium shadow-sm",
            modulo
               ? "border-emerald-200 bg-emerald-50 text-emerald-800"
               : "border-red-200 bg-red-50 text-red-700",
            className
         )}
      >
         {modulo ? "Sim" : "Não"}
      </span>
   );
}

/**
 * Chip da situação do comissionamento (Aberto / Fechado / outros).
 *
 * Mesmo acabamento dos anteriores. Sem `uppercase`: a caixa alta do Badge
 * antigo alargava o chip sem acrescentar informação, e numa coluna de 99
 * linhas grita mais do que o número que se procura ao lado.
 */
export function StatusComissChip({
   status,
   className,
}: {
   status: string;
   className?: string;
}) {
   const aberto = status === "aberto";
   const fechado = status === "fechado";
   return (
      <span
         className={clsx(
            "inline-flex w-20 items-center justify-center rounded border px-2 py-0.5 text-xs font-medium capitalize shadow-sm",
            aberto
               ? "border-emerald-200 bg-emerald-50 text-emerald-800"
               : fechado
                 ? "border-slate-200 bg-slate-50 text-slate-600"
                 : "border-amber-200 bg-amber-50 text-amber-800",
            className
         )}
      >
         {status}
      </span>
   );
}
