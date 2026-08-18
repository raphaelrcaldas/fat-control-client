import { memo } from "react";
import { TableCell, TableRow } from "flowbite-react";
import clsx from "clsx";
import { HiOutlineTrash } from "react-icons/hi";
import { realCurrency } from "utils/financeiro";
import type { LinhaDraft } from "../draftReducer";
import { anosImpactados, calcImpactoLinhaFY } from "../propostaCalc";

interface LinhaRowProps {
   linha: LinhaDraft;
   anoSelecionado: number;
   onEdit: (linhaId: string) => void;
   onRemove: (linhaId: string) => void;
}

/**
 * Uma linha do cenário. Memoizada: editar uma linha não pode redesenhar as
 * outras — por isso os callbacks recebem o `localId` em vez de virem
 * pré-fechados sobre a linha.
 *
 * O alvo focável é o BOTÃO do nome, não a `<tr>`: linha com `role="button"`
 * embrulhando o botão de remover reprova `nested-interactive` no axe. A `<tr>`
 * mantém só o `onClick` (conforto de mouse); teclado e leitor de tela entram
 * pelo botão do nome, que é também para onde o foco volta ao fechar o modal.
 */
export const LinhaRow = memo(function LinhaRow({
   linha,
   anoSelecionado,
   onEdit,
   onRemove,
}: LinhaRowProps) {
   const { anoAb, anoFc } = anosImpactados(linha);
   // Só o que recai sobre o exercício em análise: é esse valor que disputa o
   // teto do ano. A perna que cai em outro exercício aparece esmaecida nas
   // colunas de abertura/fechamento e não entra aqui.
   const subtotal = calcImpactoLinhaFY(linha, anoSelecionado);
   const militar = linha.user;

   const abrir = () => onEdit(linha.localId);

   return (
      <TableRow className="cursor-pointer bg-white" onClick={abrir}>
         {/* Coluna-âncora: no mobile o resto rola por baixo dela. `bg-inherit`
             acompanha o zebrado/hover da linha em vez de vazar o conteúdo. */}
         <TableCell className="sticky left-0 z-10 bg-inherit whitespace-nowrap shadow-[1px_0_0_var(--color-slate-200)]">
            <button
               type="button"
               aria-label={`Editar linha de ${militar?.nome_guerra ?? "militar"}`}
               onClick={(e) => {
                  e.stopPropagation();
                  abrir();
               }}
               className="focus-visible:ring-primary-500 block max-w-full rounded text-left focus:outline-none focus-visible:ring-2"
            >
               <span className="block font-medium text-slate-900 uppercase">
                  {militar?.p_g} {militar?.nome_guerra}
               </span>
            </button>
         </TableCell>

         <PernaCell
            base={linha.base_ab}
            qtd={linha.qtd_ab}
            noExercicio={anoAb === anoSelecionado}
         />

         <PernaCell
            base={linha.base_fc}
            qtd={linha.qtd_fc}
            noExercicio={anoFc === anoSelecionado}
         />

         <TableCell className="text-center whitespace-nowrap">
            <span className="inline-flex items-center gap-1 text-xs leading-4 font-semibold">
               {anoAb !== null && anoAb === anoFc ? (
                  // Abertura e fechamento no mesmo exercício: um badge só.
                  <AnoChip ano={anoAb} destaque={anoAb === anoSelecionado} />
               ) : (
                  <>
                     <AnoChip ano={anoAb} destaque={anoAb === anoSelecionado} />
                     <span aria-hidden className="text-slate-500">
                        →
                     </span>
                     <AnoChip ano={anoFc} destaque={anoFc === anoSelecionado} />
                  </>
               )}
            </span>
         </TableCell>

         {/* Zero = linha que não toca o exercício. Esmaece como as pernas fora
             do ano, para os valores que disputam o teto ficarem à frente. */}
         <TableCell
            className={clsx(
               "text-center whitespace-nowrap tabular-nums",
               // `slate-500` (~4,8:1) e não `slate-400` (~2,6:1): é texto que
               // carrega valor, não decoração — quem separa os dois estados é
               // o peso da fonte.
               subtotal > 0
                  ? "font-semibold text-slate-900"
                  : "font-normal text-slate-500"
            )}
         >
            {realCurrency(subtotal)}
         </TableCell>

         <TableCell className="text-center whitespace-nowrap">
            <button
               type="button"
               aria-label={`Remover ${militar?.nome_guerra ?? "militar"} do cenário`}
               title="Remover do cenário"
               onClick={(e) => {
                  e.stopPropagation();
                  onRemove(linha.localId);
               }}
               className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 pointer-coarse:h-[44px] pointer-coarse:w-[44px]"
            >
               <HiOutlineTrash aria-hidden className="h-4 w-4" />
            </button>
         </TableCell>
      </TableRow>
   );
});

/**
 * Valor-base × quantidade de uma das pernas. O exercício NÃO aparece aqui: a
 * coluna "Exercícios" já o mostra, e repeti-lo em cada perna era ruído. O que
 * sobrou da distinção é o esmaecido — perna que cai fora do exercício em
 * análise não conta para os cartões.
 */
function PernaCell({
   base,
   qtd,
   noExercicio,
}: {
   base: number;
   qtd: number;
   noExercicio: boolean;
}) {
   return (
      <TableCell className="text-center whitespace-nowrap">
         <div
            className={clsx(
               "font-medium tabular-nums",
               // Sem `opacity`: composta com `slate-500` ela derrubava o
               // contraste para ~2,4:1 (pior ainda nas faixas zebradas). O
               // peso da fonte já distingue a perna fora do exercício.
               noExercicio ? "text-slate-900" : "font-normal text-slate-500"
            )}
         >
            {realCurrency(base)}
            {/* `toLocaleString` para a meia ajuda sair "0,5" como no modal. */}
            <span className="text-slate-500">
               {" "}
               × {qtd.toLocaleString("pt-BR")}
            </span>
         </div>
      </TableCell>
   );
}

function AnoChip({ ano, destaque }: { ano: number | null; destaque: boolean }) {
   return (
      <span
         className={clsx(
            "rounded px-1.5 py-0.5 tabular-nums",
            destaque ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
         )}
      >
         {ano ?? "—"}
      </span>
   );
}
