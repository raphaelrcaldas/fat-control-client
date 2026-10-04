import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { RelatorioResumoSkeleton } from "./RelatorioResumoSkeleton";
import { COLUNAS_MENSAIS } from "./EtapasMensais";

export function RelatorioMensalSkeleton() {
   return (
      <div
         role="status"
         aria-label="Carregando relatório mensal"
         className="min-w-0 space-y-2"
      >
         <span className="sr-only">Carregando relatório mensal</span>
         <RelatorioResumoSkeleton mostrarUltimoVoo={false} />
         {["Aeronaves", "Simuladores"].map((titulo) => (
            <section
               key={titulo}
               aria-hidden
               className="min-w-0 overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
            >
               <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <h2 className="text-base font-semibold text-slate-900">
                     {titulo}
                  </h2>
                  <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
               </div>
               <div className="overflow-hidden">
                  <Table className="min-w-[960px] text-xs lg:text-sm">
                     <TableHead>
                        <TableRow>
                           {COLUNAS_MENSAIS.map((nome) => (
                              <TableHeadCell
                                 key={nome}
                                 className="px-3 py-2 text-center whitespace-nowrap text-slate-600"
                              >
                                 {nome}
                              </TableHeadCell>
                           ))}
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        <TableRow>
                           {COLUNAS_MENSAIS.map((nome) => (
                              <TableCell key={nome} className="px-3 py-2">
                                 <div className="mx-auto h-4 w-10 animate-pulse rounded bg-slate-100" />
                              </TableCell>
                           ))}
                        </TableRow>
                     </TableBody>
                  </Table>
               </div>
               <div className="overflow-hidden border-t border-slate-200">
                  <Table className="text-xs sm:text-sm">
                     <TableHead>
                        <TableRow>
                           {[
                              "Período",
                              "Horas",
                              "Diurno",
                              "Noturno",
                              "NVG",
                              "Pousos",
                           ].map((nome) => (
                              <TableHeadCell
                                 key={nome}
                                 className="px-2 py-2 text-center text-slate-600"
                              >
                                 {nome}
                              </TableHeadCell>
                           ))}
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {["Mês", "Ano", "Geral"].map((periodo) => (
                           <TableRow key={periodo}>
                              <TableCell className="px-2 py-2 text-center font-semibold text-slate-900">
                                 {periodo}
                              </TableCell>
                              {[0, 1, 2, 3, 4].map((i) => (
                                 <TableCell key={i} className="px-2 py-2">
                                    <div className="mx-auto h-4 w-8 animate-pulse rounded bg-slate-100" />
                                 </TableCell>
                              ))}
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </div>
            </section>
         ))}
      </div>
   );
}
