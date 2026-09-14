import clsx from "clsx";
import { FUNC_STYLE, SIT_LABEL, SIT_STYLE } from "./operacaoUi";
import type { FuncPessoal, SitPessoal } from "services/routes/ops/operacoes";

/**
 * O chip de função/situação da operação, numa única forma.
 *
 * Antes cada tela escrevia o seu: `text-xs`/`text-[10px]`,
 * `font-semibold`/`font-bold`, `px-2`/`px-1.5`, com e sem `uppercase` — cinco
 * grafias para a mesma coisa, e chips de alturas diferentes na mesma coluna.
 *
 * A largura fixa é o que padroniza de verdade: sem ela "Apoio" e "Manutenção"
 * viram caixas de tamanhos distintos empilhadas, e a coluna perde a régua
 * vertical que deixa varrer as funções de cima a baixo.
 *
 * É `w-`, não `min-w-`: com um mínimo, a palavra mais longa ainda o estoura e
 * volta a destoar — aqui 1rem são 14px (`html { font-size: 87.5% }`), então
 * 5.5rem dava 77px e "Manutenção" pedia 84px.
 */
const BASE =
   "inline-flex items-center justify-center rounded px-2 py-0.5 text-[10px] leading-4 font-bold tracking-wide uppercase whitespace-nowrap ring-1 ring-inset";

export function ChipFuncao({
   func,
   className,
}: {
   func: FuncPessoal;
   className?: string;
}) {
   return (
      <span className={clsx(BASE, "w-24", FUNC_STYLE[func].badge, className)}>
         {func}
      </span>
   );
}

/**
 * A situação tem duas apresentações porque o espaço difere: por extenso onde
 * cabe (mobile, painel) e o código de uma letra na tabela do desktop, que tem
 * sete colunas e legenda o código no rodapé. O `title`/`sr-only` carrega o
 * rótulo completo nos dois casos.
 */
export function ChipSituacao({
   sit,
   abreviado = false,
   className,
}: {
   sit: SitPessoal;
   abreviado?: boolean;
   className?: string;
}) {
   return (
      <span
         title={SIT_LABEL[sit]}
         className={clsx(
            BASE,
            abreviado ? "w-6" : "w-24",
            SIT_STYLE[sit].badge,
            className
         )}
      >
         {abreviado ? sit : SIT_LABEL[sit]}
         {abreviado && <span className="sr-only"> — {SIT_LABEL[sit]}</span>}
      </span>
   );
}
