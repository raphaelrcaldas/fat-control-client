import { RelatorioResumoTripulante } from "./RelatorioResumoTripulante";
import { DataRelatorio } from "./DataRelatorio";
import clsx from "clsx";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import type { IconType } from "react-icons";
import {
   MdOutlineNightsStay,
   MdOutlineSchedule,
   MdOutlineWbSunny,
} from "react-icons/md";
import { GiOwl } from "react-icons/gi";
import { minutesToTime } from "utils/dateHandler";
import type {
   RelatorioAnual,
   ResumoAnual,
   AeronaveFuncaoAnual,
} from "services/routes/estatistica/relatorioAnual";

// Abaixo de `lg` a tabela é espremida de propósito, como a do FatBird (ver
// `docs/ai/notes/ui-ux.md`): sem padding horizontal, sem faixa de fundo no
// cabeçalho e larguras fixas por coluna (soma 100%). Cabeçalho híbrido: sigla
// onde ela é curta e inequívoca, ícone nas colunas de tempo. A partir de `lg`
// volta o visual de desktop, com o nome por extenso. O nome completo fica
// sempre na árvore de acessibilidade (`sr-only lg:not-sr-only`) e, quando há
// sigla ou ícone, também no `title`.
const COLUNAS: {
   nome: string;
   sigla?: string;
   Icone?: IconType;
   largura: string;
}[] = [
   { nome: "Aeronave", sigla: "ANV", largura: "w-[14%]" },
   { nome: "Função", sigla: "FUNC", largura: "w-[9%]" },
   { nome: "Horas", Icone: MdOutlineSchedule, largura: "w-[11%]" },
   { nome: "Diurno", Icone: MdOutlineWbSunny, largura: "w-[11%]" },
   { nome: "Noturno", Icone: MdOutlineNightsStay, largura: "w-[11%]" },
   { nome: "NVG", Icone: GiOwl, largura: "w-[11%]" },
   { nome: "Pousos", sigla: "POU", largura: "w-[8%]" },
   { nome: "Etapas", sigla: "ETP", largura: "w-[8%]" },
   { nome: "Último voo", sigla: "ULT VOO", largura: "w-[17%]" },
];

function LinhasAeronavesFuncoes({
   linhas,
   titulo,
}: {
   linhas: AeronaveFuncaoAnual[];
   titulo: string;
}) {
   return (
      <div
         tabIndex={0}
         role="region"
         aria-label={`${titulo}: detalhamento por aeronave e função`}
         className="focus-visible:ring-primary-500 overflow-x-auto focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
      >
         <Table className="text-xs lg:text-sm">
            <TableHead>
               <TableRow>
                  {COLUNAS.map(({ nome, sigla, Icone, largura }) => (
                     <TableHeadCell
                        key={nome}
                        className={clsx(
                           "bg-transparent px-0 text-center font-normal whitespace-nowrap text-slate-600 lg:w-auto lg:bg-gray-50 lg:px-6 lg:text-gray-700",
                           largura
                        )}
                        title={nome}
                     >
                        <span aria-hidden className="lg:hidden">
                           {Icone ? (
                              <Icone className="mx-auto size-4" />
                           ) : (
                              sigla
                           )}
                        </span>
                        <span className="sr-only lg:not-sr-only">{nome}</span>
                     </TableHeadCell>
                  ))}
               </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-slate-200">
               {linhas.map((linha) => (
                  <TableRow key={`${linha.modelo}-${linha.func}`}>
                     <TableCell className="px-0 text-center whitespace-nowrap text-slate-900 uppercase lg:px-6">
                        {linha.modelo}
                     </TableCell>
                     <TableCell className="px-0 text-center font-semibold text-slate-900 uppercase lg:px-6">
                        {linha.func}
                     </TableCell>
                     {[linha.tvoo, linha.diurno, linha.noturno, linha.nvg].map(
                        (valor, index) => (
                           <TableCell
                              key={index}
                              className={clsx(
                                 "px-0 text-center tabular-nums lg:px-6",
                                 index === 0
                                    ? "font-semibold text-slate-900"
                                    : "text-slate-600"
                              )}
                           >
                              {minutesToTime(valor)}
                           </TableCell>
                        )
                     )}
                     <TableCell className="px-0 text-center text-slate-600 tabular-nums lg:px-6">
                        {linha.pousos}
                     </TableCell>
                     <TableCell className="px-0 text-center text-slate-600 tabular-nums lg:px-6">
                        {linha.etapas}
                     </TableCell>
                     <TableCell className="px-0 text-center whitespace-nowrap text-slate-600 tabular-nums lg:px-6">
                        <DataRelatorio data={linha.ultimo_voo} />
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}

function BlocoAnual({
   titulo,
   resumo,
}: {
   titulo: string;
   resumo: ResumoAnual;
}) {
   return (
      <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
            <span className="flex items-baseline gap-1.5 whitespace-nowrap">
               <span className="text-xs text-slate-600">Total</span>
               <span
                  className={clsx(
                     "text-sm font-semibold tabular-nums",
                     resumo.total.tvoo === 0
                        ? "text-slate-500"
                        : "text-slate-700"
                  )}
               >
                  {minutesToTime(resumo.total.tvoo)}
               </span>
            </span>
         </div>
         {resumo.total.etapas === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-600">
               Nenhuma etapa registrada neste ano.
            </p>
         ) : (
            <>
               <LinhasAeronavesFuncoes
                  linhas={resumo.por_aeronave_funcao}
                  titulo={titulo}
               />
               {resumo.total.sem_regime > 0 && (
                  <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-600">
                     {minutesToTime(resumo.total.sem_regime)} sem regime
                     informado. Esse tempo está incluído nas horas totais.
                  </p>
               )}
            </>
         )}
      </section>
   );
}

export function RelatorioConteudo({
   relatorio,
}: {
   relatorio: RelatorioAnual;
}) {
   const { tripulante: trip, aeronaves, simuladores } = relatorio;
   const etapas = aeronaves.total.etapas + simuladores.total.etapas;
   return (
      <div className="space-y-2">
         <RelatorioResumoTripulante
            tripulante={trip}
            aeronaves={aeronaves}
            simuladores={simuladores}
         />
         {etapas === 0 ? (
            <p className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
               Nenhuma etapa registrada em {relatorio.ano}.
            </p>
         ) : (
            <>
               <BlocoAnual titulo="Aeronaves" resumo={aeronaves} />
               <BlocoAnual titulo="Simuladores" resumo={simuladores} />
            </>
         )}
      </div>
   );
}
