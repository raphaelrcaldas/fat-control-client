import { Checkbox, TableHead, TableHeadCell, TableRow } from "flowbite-react";

type TripTableHeadProps = {
   /**
    * Selecao da pagina para o carrinho de exportacao. Ausente no skeleton,
    * que desenha so o espaco do checkbox.
    */
   selection?: {
      selected: number;
      total: number;
      onToggleAll: () => void;
   };
};

/**
 * Cabeçalho da tabela de tripulantes.
 *
 * Fica num arquivo só porque a lista e o skeleton precisam das MESMAS dez
 * colunas e das mesmas larguras — duplicado, o par diverge no primeiro ajuste
 * e o skeleton passa a mentir sobre o layout que vem.
 */
export function TripTableHead({ selection }: TripTableHeadProps) {
   const all =
      selection !== undefined &&
      selection.total > 0 &&
      selection.selected === selection.total;

   return (
      <TableHead>
         <TableRow>
            {/* `w-10` e `pr-0`: o checkbox tem 20px, e o padding do tema
                afastaria demais o P/G. */}
            <TableHeadCell className="w-10 pr-0 2xl:pr-0">
               {selection ? (
                  <Checkbox
                     color="primary"
                     checked={all}
                     ref={(el) => {
                        // Estado indeterminado: parte da pagina marcada.
                        if (el)
                           el.indeterminate = selection.selected > 0 && !all;
                     }}
                     onChange={selection.onToggleAll}
                     aria-label={
                        all
                           ? "Desmarcar todos desta página"
                           : "Selecionar todos desta página"
                     }
                  />
               ) : (
                  <div className="h-[20px] w-[20px] animate-pulse rounded bg-slate-200" />
               )}
            </TableHeadCell>
            <TableHeadCell className="w-20 whitespace-nowrap">
               P/G
            </TableHeadCell>
            <TableHeadCell className="hidden w-24 whitespace-nowrap lg:table-cell">
               Quadro
            </TableHeadCell>
            <TableHeadCell className="hidden w-28 whitespace-nowrap lg:table-cell">
               Especialidade
            </TableHeadCell>
            <TableHeadCell className="w-44 whitespace-nowrap">
               Nome de guerra
            </TableHeadCell>
            <TableHeadCell className="whitespace-nowrap">
               Nome completo
            </TableHeadCell>
            <TableHeadCell className="w-24 text-center whitespace-nowrap">
               Trigrama
            </TableHeadCell>
            <TableHeadCell className="w-28 text-center whitespace-nowrap">
               Funções
            </TableHeadCell>
            <TableHeadCell className="hidden w-24 text-center whitespace-nowrap lg:table-cell">
               Status
            </TableHeadCell>
            <TableHeadCell className="w-16">
               <span className="sr-only">Ações</span>
            </TableHeadCell>
         </TableRow>
      </TableHead>
   );
}
