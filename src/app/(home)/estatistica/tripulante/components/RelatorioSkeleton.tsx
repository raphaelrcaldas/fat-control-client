import { RelatorioResumoSkeleton } from "./RelatorioResumoSkeleton";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";

// Linhas de aeronave/função por bloco (aeronaves, simuladores) no caso típico.
const LINHAS_POR_BLOCO = [2, 1];

// Espelha `COLUNAS` de RelatorioConteudo: largura de cada coluna abaixo de `lg`
// (soma 100%) e largura aproximada do conteúdo (ANV, FUNC, horas, diurno,
// noturno, NVG, pousos, etapas, ULT VOO), para a tabela distribuir o espaço
// como a verdadeira.
const COLUNAS = [
   { largura: "w-[14%]", barra: 34 },
   { largura: "w-[9%]", barra: 14 },
   { largura: "w-[11%]", barra: 28 },
   { largura: "w-[11%]", barra: 28 },
   { largura: "w-[11%]", barra: 28 },
   { largura: "w-[11%]", barra: 28 },
   { largura: "w-[8%]", barra: 14 },
   { largura: "w-[8%]", barra: 14 },
   { largura: "w-[17%]", barra: 48 },
];

export function RelatorioSkeleton() {
   return (
      <div
         role="status"
         aria-label="Carregando relatório anual"
         className="space-y-2"
      >
         <span className="sr-only">Carregando relatório anual</span>
         <RelatorioResumoSkeleton />
         {/* Blocos do caso típico: aeronaves com 2 linhas, simuladores com 1.
             Espelham `BlocoAnual` (barra de título e a mesma tabela) para zero
             layout-shift. */}
         {LINHAS_POR_BLOCO.map((linhas, i) => (
            <section
               aria-hidden
               key={i}
               className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
            >
               <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div className="h-6 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
               </div>
               <Table className="text-xs lg:text-sm">
                  <TableHead>
                     <TableRow>
                        {COLUNAS.map(({ largura, barra }, j) => (
                           <TableHeadCell
                              key={j}
                              className={`bg-transparent px-0 lg:w-auto lg:bg-gray-50 lg:px-6 ${largura}`}
                           >
                              <div className="flex h-4 items-center">
                                 <div
                                    className="mx-auto h-3 animate-pulse rounded bg-slate-200"
                                    style={{ width: barra * 0.8 }}
                                 />
                              </div>
                           </TableHeadCell>
                        ))}
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-slate-200">
                     {Array.from({ length: linhas }, (_, j) => (
                        <TableRow key={j}>
                           {COLUNAS.map(({ barra }, k) => (
                              <TableCell key={k} className="px-0 lg:px-6">
                                 <div className="flex h-4 items-center lg:h-5">
                                    <div
                                       className="mx-auto h-3 animate-pulse rounded bg-slate-100"
                                       style={{ width: barra }}
                                    />
                                 </div>
                              </TableCell>
                           ))}
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </section>
         ))}
      </div>
   );
}
