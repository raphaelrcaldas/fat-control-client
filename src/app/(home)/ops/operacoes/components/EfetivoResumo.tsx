"use client";

import {
   Button,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { isoDateToShort } from "@/../utils/dateHandler";
import { PermBased } from "../../../hooks/usePermBased";
import type {
   OperacaoDetail,
   OperacaoPessoalOut,
} from "services/routes/ops/operacoes";
import { BarraPresenca } from "./BarraPresenca";
import { PainelResumo } from "./PainelResumo";
import { agruparPessoal } from "./pessoalAgrupado";
import { FUNC_STYLE, SIT_LABEL, SIT_STYLE } from "./operacaoUi";

const TOPO = 5;

/**
 * Efetivo no dossiê — os cinco primeiros militares.
 *
 * O item é por militar, não por vínculo: quem tem dois períodos na operação
 * aparece uma vez, com as duas faixas na mesma barra de presença (ver
 * `pessoalAgrupado`). Sem isso, o mesmo nome apareceria duas vezes e a contagem
 * de efetivo passaria a contar vínculos em vez de pessoas.
 *
 * Duas formas: lista no mobile (5-7 colunas não sobrevivem a 360px) e tabela
 * de `md:` para cima, como em `OperacoesTable`.
 */
export function EfetivoResumo({
   op,
   pessoal,
   carregando,
   erro,
   onRecarregar,
   onVerTudo,
   onAssociar,
}: {
   op: OperacaoDetail;
   pessoal: OperacaoPessoalOut[];
   carregando: boolean;
   erro: boolean;
   onRecarregar: () => void;
   onVerTudo: () => void;
   onAssociar: () => void;
}) {
   const militares = agruparPessoal(pessoal);
   const linhas = militares.slice(0, TOPO);

   const porSit = { d: 0, g: 0, c: 0 };
   for (const p of pessoal) porSit[p.sit] += 1;

   if (erro) {
      return (
         <PainelResumo titulo="Militares envolvidos">
            <div role="alert" className="space-y-3 px-4 py-10 text-center">
               <p className="text-sm text-red-700">
                  Não foi possível carregar o efetivo.
               </p>
               <Button
                  color="light"
                  size="sm"
                  className="mx-auto"
                  onClick={onRecarregar}
               >
                  Tentar novamente
               </Button>
            </div>
         </PainelResumo>
      );
   }

   if (carregando) {
      return (
         <PainelResumo titulo="Militares envolvidos">
            <div className="divide-y divide-slate-100 motion-safe:animate-pulse">
               {Array.from({ length: TOPO }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                     <div className="h-3.5 w-36 rounded bg-slate-200" />
                     <div className="h-4 w-20 rounded bg-slate-100" />
                     <div className="ml-auto h-3.5 w-24 rounded bg-slate-100" />
                  </div>
               ))}
            </div>
         </PainelResumo>
      );
   }

   if (militares.length === 0) {
      return (
         <PainelResumo titulo="Militares envolvidos">
            <div className="flex flex-col items-center gap-1.5 px-4 py-10 text-center">
               <p className="text-sm font-semibold text-slate-800">
                  Nenhum militar registrado
               </p>
               <p className="max-w-[46ch] text-xs leading-relaxed text-slate-600">
                  Associe os militares que participaram para acompanhar o
                  efetivo e os períodos de cada um.
               </p>
               <PermBased
                  resource="ops.operacoes.militar"
                  requiredPerm="create"
               >
                  <Button
                     color="primary"
                     size="xs"
                     className="mt-2"
                     onClick={onAssociar}
                  >
                     <HiPlus className="mr-1 h-4 w-4" /> Associar militar
                  </Button>
               </PermBased>
            </div>
         </PainelResumo>
      );
   }

   return (
      <PainelResumo
         titulo="Militares envolvidos"
         resumo={`${porSit.d} diária · ${porSit.g} grat rep · ${porSit.c} comiss`}
         verTudo={
            militares.length === 1
               ? "Abrir o militar"
               : `Abrir os ${militares.length} militares`
         }
         onVerTudo={onVerTudo}
      >
         {/* --------------------------- mobile --------------------------- */}
         <ul className="divide-y divide-slate-100 md:hidden">
            {linhas.map((m) => (
               <li key={m.userId} className="px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                     <span
                        title={`${m.user.p_g} ${m.user.nome_guerra}`}
                        className="min-w-0 truncate text-[13px] font-semibold text-slate-900 uppercase"
                     >
                        {m.user.p_g} {m.user.nome_guerra}
                     </span>
                     <span className="shrink-0 text-[13px] font-bold text-slate-900 tabular-nums">
                        {m.diasTotal}d
                     </span>
                  </div>

                  {/* Um período: badges soltos. Vários: um par por linha,
                      com a janela de datas na frente — sem a data, dois pares
                      de badges empilhados não dizem qual valeu quando. */}
                  {m.periodos.length === 1 ? (
                     <div className="mt-1 flex items-center gap-1.5">
                        <span
                           className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${FUNC_STYLE[m.periodos[0].func].badge}`}
                        >
                           {m.periodos[0].func}
                        </span>
                        <span
                           className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${SIT_STYLE[m.periodos[0].sit].badge}`}
                        >
                           {SIT_LABEL[m.periodos[0].sit]}
                        </span>
                     </div>
                  ) : (
                     <div className="mt-1 flex flex-col gap-1">
                        {m.periodos.map((p) => (
                           <div
                              key={p.id}
                              className="flex items-center gap-1.5"
                           >
                              <span className="shrink-0 text-[10px] text-slate-500">
                                 {isoDateToShort(p.data_ingresso)}–
                                 {isoDateToShort(p.data_regresso)}
                              </span>
                              <span
                                 className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${FUNC_STYLE[p.func].badge}`}
                              >
                                 {p.func}
                              </span>
                              <span
                                 className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${SIT_STYLE[p.sit].badge}`}
                              >
                                 {SIT_LABEL[p.sit]}
                              </span>
                           </div>
                        ))}
                     </div>
                  )}

                  <div className="mt-1.5">
                     <BarraPresenca
                        periodos={m.periodos}
                        opInicio={op.data_inicio}
                        opFim={op.data_fim}
                     />
                  </div>
               </li>
            ))}
         </ul>

         {/* --------------------------- desktop --------------------------- */}
         {/* Região rolável precisa ser alcançável por teclado: sem
             `tabIndex`, quem não usa mouse não chega às colunas que
             ficam fora da largura (reprova `scrollable-region-focusable`). */}
         <div
            className="focus-visible:outline-primary-600 hidden overflow-x-auto focus-visible:outline-2 md:block"
            role="region"
            aria-label="Militares envolvidos"
            tabIndex={0}
         >
            <Table>
               <TableHead>
                  <TableRow>
                     <TableHeadCell className="px-3 normal-case">
                        Militar
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 normal-case">
                        Função
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 normal-case">
                        Sit
                     </TableHeadCell>
                     <TableHeadCell className="w-[30%] px-3 normal-case">
                        Presença no período
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 text-right normal-case">
                        Dias
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-100">
                  {linhas.map((m) => (
                     <TableRow key={m.userId} className="bg-white">
                        <TableCell className="max-w-0 px-3">
                           <span
                              className="block truncate font-semibold text-slate-800 uppercase"
                              title={`${m.user.p_g} ${m.user.nome_guerra}`}
                           >
                              {m.user.p_g} {m.user.nome_guerra}
                           </span>
                        </TableCell>
                        <TableCell className="w-px px-3">
                           <div className="flex flex-col gap-1">
                              {m.periodos.map((p) => (
                                 <span
                                    key={p.id}
                                    className={`inline-block rounded px-1.5 py-0.5 text-center text-[10px] font-bold uppercase ring-1 ring-inset ${FUNC_STYLE[p.func].badge}`}
                                 >
                                    {p.func}
                                 </span>
                              ))}
                           </div>
                        </TableCell>
                        <TableCell className="w-px px-3">
                           <div className="flex flex-col gap-1">
                              {m.periodos.map((p) => (
                                 <span
                                    key={p.id}
                                    title={SIT_LABEL[p.sit]}
                                    className={`inline-block rounded px-1.5 py-0.5 text-center text-[10px] font-bold uppercase ring-1 ring-inset ${SIT_STYLE[p.sit].badge}`}
                                 >
                                    {p.sit}
                                 </span>
                              ))}
                           </div>
                        </TableCell>
                        <TableCell className="px-3">
                           <BarraPresenca
                              periodos={m.periodos}
                              opInicio={op.data_inicio}
                              opFim={op.data_fim}
                           />
                        </TableCell>
                        <TableCell className="w-px px-3 text-right font-mono font-bold whitespace-nowrap text-slate-900 tabular-nums">
                           {m.diasTotal}
                           {m.periodos.length > 1 && (
                              <span className="block text-[10px] font-normal text-slate-500">
                                 {m.periodos.map((p) => p.dias).join(" + ")}
                              </span>
                           )}
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </PainelResumo>
   );
}
