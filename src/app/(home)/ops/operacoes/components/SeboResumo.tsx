"use client";

import { useMemo, useState } from "react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import { useFuncoes } from "@/hooks/queries/useFuncoes";
import type { SeboRow } from "services/routes/ops/operacoes";
import { PainelResumo, PainelVazio } from "./PainelResumo";
import { Segmented } from "./Segmented";

const TOPO = 5;

/**
 * Pau de sebo no dossiê — os cinco primeiros.
 *
 * Único painel do dossiê com filtro próprio. A regra geral é "filtrar é
 * trabalho, e trabalho mora no modal", mas aqui o recorte por função é leitura:
 * a pergunta "quem mais voou" quase sempre vem qualificada por função, e sem o
 * filtro os cinco primeiros são pilotos em toda operação — mecânico e loadmaster
 * nunca apareceriam no dossiê.
 *
 * A ordem dos chips é a do catálogo de funções da organização
 * (`funcoes.ordem`), não alfabética: é hierarquia de tripulação, e cada
 * unidade pode ordenar a sua.
 */
export function SeboResumo({
   sebo,
   onVerTudo,
}: {
   sebo: SeboRow[];
   onVerTudo: () => void;
}) {
   const [func, setFunc] = useState<string | null>(null);
   const catalogo = useFuncoes();

   // Quais funções aparecem vem do dado; em que ordem, do catálogo da org.
   const funcoes = useMemo(() => {
      const contagem = new Map<string, number>();
      for (const s of sebo)
         contagem.set(s.func, (contagem.get(s.func) ?? 0) + 1);
      return Array.from(contagem.entries()).sort(
         (a, b) => catalogo.ordem(a[0]) - catalogo.ordem(b[0])
      );
   }, [sebo, catalogo]);

   const ativo = func && funcoes.some(([f]) => f === func) ? func : null;
   const linhas = (ativo ? sebo.filter((s) => s.func === ativo) : sebo).slice(
      0,
      TOPO
   );

   // Completa até TOPO com linhas vazias: trocar de função com menos de cinco
   // tripulantes encolheria o painel e faria o resto da página saltar.
   const vazias = Math.max(0, TOPO - linhas.length);

   return (
      <PainelResumo
         titulo="Pau de sebo"
         resumo={`${sebo.length} ${sebo.length === 1 ? "tripulante" : "tripulantes"}`}
         filtro={
            funcoes.length > 1 ? (
               <Segmented
                  size="xs"
                  ariaLabel="Filtrar por função"
                  value={ativo}
                  onChange={setFunc}
                  options={[
                     { value: null, label: "Todas", count: sebo.length },
                     ...funcoes.map(([f, n]) => ({
                        value: f,
                        label: f.toUpperCase(),
                        count: n,
                     })),
                  ]}
               />
            ) : undefined
         }
         verTudo={
            sebo.length === 1
               ? "Ver o tripulante"
               : `Ver os ${sebo.length} tripulantes`
         }
         onVerTudo={onVerTudo}
      >
         {sebo.length === 0 ? (
            <PainelVazio>
               Nenhuma tripulação registrada nas etapas associadas.
            </PainelVazio>
         ) : (
            // Altura cravada na moldura, não na tabela: cada linha cai numa
            // posição fracionária e arredonda para 32,5 ou 33px conforme onde
            // cai, então somar cinco linhas dava 293 a 294px conforme o filtro.
            // O teto aqui absorve a fração — e a tabela continua tabela, com as
            // colunas alinhadas ao cabeçalho.
            <div className="h-[198px] overflow-hidden">
               <Table>
                  <TableHead>
                     <TableRow>
                        <TableHeadCell className="px-3 normal-case">
                           Tripulante
                        </TableHeadCell>
                        <TableHeadCell className="w-px px-2 normal-case">
                           Função
                        </TableHeadCell>
                        <TableHeadCell className="w-px px-2 text-right normal-case">
                           Et.
                        </TableHeadCell>
                        <TableHeadCell className="w-px px-3 text-right normal-case">
                           Horas
                        </TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-slate-100">
                     {linhas.map((s) => (
                        <TableRow key={s.trip_id} className="bg-white">
                           <TableCell className="max-w-0 px-3">
                              <span
                                 className="block truncate font-semibold text-slate-800 uppercase"
                                 title={s.nome}
                              >
                                 {s.nome}
                              </span>
                           </TableCell>
                           <TableCell className="w-px px-2">
                              <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                 {s.func}
                              </span>
                           </TableCell>
                           <TableCell className="w-px px-2 text-right font-mono text-slate-600 tabular-nums">
                              {s.etapas}
                           </TableCell>
                           <TableCell className="w-px px-3 text-right font-mono font-bold whitespace-nowrap text-slate-900 tabular-nums">
                              {minutesToTime(s.horas)}
                           </TableCell>
                        </TableRow>
                     ))}
                     {Array.from({ length: vazias }).map((_, i) => (
                        <TableRow
                           key={`vazia-${i}`}
                           aria-hidden
                           className="bg-white"
                        >
                           <TableCell className="px-3 py-2" colSpan={4}>
                              <span className="block h-5" />
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         )}
      </PainelResumo>
   );
}
