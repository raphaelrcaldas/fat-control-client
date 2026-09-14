"use client";

import { useMemo, useState } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Button,
   TextInput,
} from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { minutesToTime } from "@/../utils/dateHandler";
import { useFuncoes } from "@/hooks/queries/useFuncoes";
import { ListaModal, ModalTools, FiltroGrupo } from "./ListaModal";
import { Segmented } from "./Segmented";
import type { SeboRow } from "services/routes/ops/operacoes";

interface Props {
   show: boolean;
   onClose: () => void;
   opNome: string;
   sebo: SeboRow[];
}

export function SeboModal({ show, onClose, opNome, sebo }: Props) {
   const [busca, setBusca] = useState("");
   const [funcFilter, setFuncFilter] = useState<string | null>(null);

   const catalogo = useFuncoes();

   // Quais funções aparecem vem do dado; em que ordem, do catálogo da org
   // (`funcoes.ordem`) — é hierarquia de tripulação, não ordem alfabética.
   const funcs = useMemo(
      () =>
         Array.from(new Set(sebo.map((s) => s.func))).sort(
            (a, b) => catalogo.ordem(a) - catalogo.ordem(b)
         ),
      [sebo, catalogo]
   );

   const funcOptions = useMemo(
      () => [
         { value: null, label: "Todas", count: sebo.length },
         // A função vem do dado em minúsculas ("pil", "mec"); na tela é
         // sigla, e sigla se lê em caixa alta.
         ...funcs.map((f) => ({
            value: f,
            label: f.toUpperCase(),
            count: sebo.filter((s) => s.func === f).length,
         })),
      ],
      [funcs, sebo]
   );

   const rows = useMemo(() => {
      const termo = busca.trim().toLowerCase();
      return sebo.filter((s) => {
         if (funcFilter && s.func !== funcFilter) return false;
         if (!termo) return true;
         return s.nome.toLowerCase().includes(termo);
      });
   }, [sebo, busca, funcFilter]);

   const totalHoras = useMemo(
      () => rows.reduce((sum, s) => sum + s.horas, 0),
      [rows]
   );

   function limparFiltros() {
      setBusca("");
      setFuncFilter(null);
   }

   return (
      <ListaModal
         show={show}
         onClose={onClose}
         titulo="Pau de sebo"
         contexto={opNome}
         ferramentas={
            <ModalTools>
               <TextInput
                  icon={IoMdSearch}
                  sizing="sm"
                  placeholder="buscar tripulante…"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full"
               />

               {funcs.length > 0 && (
                  <FiltroGrupo label="Função" largura="cheia">
                     <Segmented
                        options={funcOptions}
                        value={funcFilter}
                        onChange={setFuncFilter}
                        ariaLabel="Filtrar por função"
                     />
                  </FiltroGrupo>
               )}
            </ModalTools>
         }
         rodape={
            <>
               <span>
                  Mostrando <strong>{rows.length}</strong> de{" "}
                  <strong>{sebo.length}</strong> tripulantes
               </span>
               <span>
                  Σ <strong>{minutesToTime(totalHoras)}</strong>
               </span>
            </>
         }
      >
         {rows.length === 0 ? (
            <div className="flex min-h-70 flex-col items-center justify-center gap-2 px-4 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhum tripulante neste recorte
               </p>
               <Button color="light" size="xs" onClick={limparFiltros}>
                  Limpar filtros
               </Button>
            </div>
         ) : (
            <Table aria-label="Ranking completo de horas por tripulante">
               <TableHead className="sticky top-0 z-10">
                  <TableRow>
                     <TableHeadCell className="px-3 normal-case">
                        Tripulante
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-2 normal-case">
                        Função
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-2 text-right normal-case">
                        Etapas
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 text-right normal-case">
                        Horas
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-100">
                  {rows.map((s) => (
                     <TableRow key={s.trip_id} className="hover:bg-slate-50">
                        <TableCell className="max-w-0 px-3">
                           <span
                              className="block truncate font-semibold text-slate-900 uppercase"
                              title={s.nome}
                           >
                              {s.nome}
                           </span>
                        </TableCell>
                        <TableCell className="px-2 text-slate-600 uppercase">
                           {s.func}
                        </TableCell>
                        <TableCell className="px-2 text-right text-slate-600 tabular-nums">
                           {s.etapas}
                        </TableCell>
                        <TableCell className="px-3 text-right font-bold whitespace-nowrap text-slate-900 tabular-nums">
                           {minutesToTime(s.horas)}
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         )}
      </ListaModal>
   );
}
