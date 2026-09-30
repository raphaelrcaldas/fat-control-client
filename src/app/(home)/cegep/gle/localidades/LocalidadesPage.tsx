"use client";

import { useMemo, useState } from "react";
import { Button, Select, TextInput } from "flowbite-react";
import clsx from "clsx";
import { HiPlus, HiSearch, HiX } from "react-icons/hi";
import { MdErrorOutline } from "react-icons/md";
import { TbMapPin, TbPlaneInflight } from "react-icons/tb";

import { EmptyState } from "@/components/ui/EmptyState";
import { KpiCard } from "@/components/ui/KpiCard";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useToast } from "@/app/context/toast";
import {
   useCreateLocalidade,
   useDeleteLocalidade,
   useLocalidades,
   useUpdateLocalidade,
} from "@/hooks/queries/useGle";
import { GRUPO_A, GRUPO_B, type LocEsp } from "services/routes/cegep/gle";

import { LocEspFormModal } from "./components/LocEspFormModal";
import { LocEspTable } from "./components/LocEspTable";
import { LocEspTableSkeleton } from "./components/LocEspTableSkeleton";
import { formatLocalidadeError } from "./localidadeErrors";

export function LocalidadesPage() {
   const { push } = useToast();

   const [busca, setBusca] = useState("");
   const [grupo, setGrupo] = useState<string>("");
   const [uf, setUf] = useState<string>("");
   const buscaDebounced = useDebouncedValue(busca, 400);

   const [modalAberto, setModalAberto] = useState(false);
   const [emEdicao, setEmEdicao] = useState<LocEsp | null>(null);

   const filtros = useMemo(
      () => ({
         search: buscaDebounced || undefined,
         grupo: grupo ? Number(grupo) : undefined,
         uf: uf || undefined,
      }),
      [buscaDebounced, grupo, uf]
   );

   const { data, isLoading, isFetching, isError, error, refetch } =
      useLocalidades(filtros);
   const localidades = data ?? [];

   const criar = useCreateLocalidade();
   const atualizar = useUpdateLocalidade();
   const remover = useDeleteLocalidade();

   // As UFs da lista completa, não da filtrada: um seletor que perde opções
   // conforme filtra impede voltar atrás.
   const {
      data: todas,
      isLoading: carregandoTodas,
      isError: erroTodas,
   } = useLocalidades(undefined);
   const ufsDisponiveis = useMemo(() => {
      const ufs = new Set((todas ?? []).map((l) => l.cidade.uf));
      return [...ufs].sort();
   }, [todas]);

   const resumo = useMemo(() => {
      const base = todas ?? [];
      return {
         total: base.length,
         grupoA: base.filter((l) => l.grupo === GRUPO_A).length,
         grupoB: base.filter((l) => l.grupo === GRUPO_B).length,
         icaos: base.reduce((soma, l) => soma + l.icaos.length, 0),
      };
   }, [todas]);

   // Falha ao carregar a lista completa não é "0 localidades": o KpiCard rende
   // "Indisponível" para `null`.
   const valorResumo = (n: number) => (todas || !erroTodas ? String(n) : null);

   const temFiltro = Boolean(busca || grupo || uf);

   function limparFiltros() {
      setBusca("");
      setGrupo("");
      setUf("");
   }

   function abrirCriacao() {
      setEmEdicao(null);
      setModalAberto(true);
   }

   function abrirEdicao(loc: LocEsp) {
      setEmEdicao(loc);
      setModalAberto(true);
   }

   async function handleSave(payload: Parameters<typeof criar.mutateAsync>[0]) {
      try {
         if (emEdicao) {
            await atualizar.mutateAsync({ id: emEdicao.id, data: payload });
            push({ message: "Localidade atualizada.", type: "success" });
         } else {
            await criar.mutateAsync(payload);
            push({ message: "Localidade cadastrada.", type: "success" });
         }
         setModalAberto(false);
      } catch (err) {
         push({
            title: "Não foi possível salvar",
            message: formatLocalidadeError(err, "Erro inesperado."),
            type: "error",
         });
      }
   }

   async function handleDelete(id: number) {
      try {
         await remover.mutateAsync(id);
         push({ message: "Localidade removida.", type: "success" });
         setModalAberto(false);
      } catch (err) {
         push({
            title: "Não foi possível remover",
            message: formatLocalidadeError(err, "Erro inesperado."),
            type: "error",
         });
      }
   }

   return (
      <div className="space-y-2">
         {/* Resumo — lido da lista completa, estável sob filtro */}
         <div role={carregandoTodas ? "status" : undefined}>
            {carregandoTodas && (
               <span className="sr-only">
                  Carregando resumo das localidades…
               </span>
            )}
            <div
               aria-hidden={carregandoTodas || undefined}
               className="grid grid-cols-2 gap-2 lg:grid-cols-4"
            >
               <KpiCard
                  icon={<TbMapPin className="h-5 w-5" />}
                  label="Localidades"
                  value={valorResumo(resumo.total)}
                  size="md"
                  isLoading={carregandoTodas}
               />
               <KpiCard
                  icon={<span className="text-sm font-bold">A</span>}
                  label="Grupo A"
                  value={valorResumo(resumo.grupoA)}
                  size="md"
                  isLoading={carregandoTodas}
               />
               <KpiCard
                  icon={<span className="text-sm font-bold">B</span>}
                  label="Grupo B"
                  value={valorResumo(resumo.grupoB)}
                  size="md"
                  isLoading={carregandoTodas}
               />
               <KpiCard
                  icon={<TbPlaneInflight className="h-5 w-5" />}
                  label="Aeródromos"
                  value={valorResumo(resumo.icaos)}
                  size="md"
                  isLoading={carregandoTodas}
               />
            </div>
         </div>

         {/* Toolbar + tabela na mesma superfície */}
         <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-2">
               <TextInput
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Município ou ICAO…"
                  icon={HiSearch}
                  className="min-w-[200px] flex-1"
                  aria-label="Buscar por município ou ICAO"
               />

               {/* Largura mínima explícita: sem ela o rótulo mais longo passa
                   por baixo da seta do select e sai cortado. */}
               <Select
                  value={grupo}
                  onChange={(e) => setGrupo(e.target.value)}
                  aria-label="Filtrar por grupo"
                  className="min-w-[150px]"
               >
                  <option value="">Todos os grupos</option>
                  <option value={GRUPO_A}>Grupo A</option>
                  <option value={GRUPO_B}>Grupo B</option>
               </Select>

               <Select
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  aria-label="Filtrar por UF"
                  className="min-w-[130px]"
                  disabled={carregandoTodas}
               >
                  <option value="">Todas as UFs</option>
                  {ufsDisponiveis.map((sigla) => (
                     <option key={sigla} value={sigla}>
                        {sigla}
                     </option>
                  ))}
               </Select>

               {temFiltro && (
                  <Button
                     color="light"
                     onClick={limparFiltros}
                     aria-label="Limpar filtros"
                  >
                     <HiX className="h-4 w-4 sm:mr-2" />
                     <span className="hidden sm:inline">Limpar</span>
                  </Button>
               )}

               <PermBased resource="cegep.gle" requiredPerm="create">
                  <Button
                     color="primary"
                     onClick={abrirCriacao}
                     className="font-semibold whitespace-nowrap"
                  >
                     <HiPlus className="mr-2 h-4 w-4" />
                     {/* Rótulo curto no celular em vez de ícone mudo: "+"
                         sozinho não diz o que cria. */}
                     <span className="hidden sm:inline">Nova localidade</span>
                     <span className="sm:hidden">Nova</span>
                  </Button>
               </PermBased>
            </div>

            {isLoading ? (
               <LocEspTableSkeleton />
            ) : isError && !data ? (
               <div
                  role="alert"
                  className="flex flex-col items-center gap-3 p-8 text-center"
               >
                  <p className="text-sm font-medium text-red-800">
                     Não foi possível carregar as localidades
                     {error instanceof Error ? `: ${error.message}` : "."}
                  </p>
                  <Button
                     color="light"
                     size="sm"
                     onClick={() => refetch()}
                     disabled={isFetching}
                  >
                     Tentar novamente
                  </Button>
               </div>
            ) : localidades.length === 0 ? (
               <div className="p-6">
                  <EmptyState
                     icon={TbMapPin}
                     title={
                        temFiltro
                           ? "Nenhuma localidade para este filtro"
                           : "Nenhuma localidade especial cadastrada"
                     }
                     description={
                        temFiltro
                           ? "Ajuste a busca, o grupo ou a UF."
                           : "Cadastre os municípios classificados como localidade especial para que as etapas de voo passem a ser identificadas."
                     }
                     action={
                        temFiltro ? (
                           <Button color="light" onClick={limparFiltros}>
                              Limpar filtros
                           </Button>
                        ) : undefined
                     }
                  />
               </div>
            ) : (
               <>
                  {/* Refetch que falha com a lista em tela: mantém o dado e
                      avisa, sem trocar a tela pelo erro. */}
                  {isError && (
                     <p
                        role="status"
                        className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
                     >
                        <MdErrorOutline
                           aria-hidden
                           className="size-3.5 shrink-0"
                        />
                        <span className="min-w-0 flex-1 truncate">
                           Não foi possível atualizar a lista
                        </span>
                        <button
                           type="button"
                           onClick={() => refetch()}
                           disabled={isFetching}
                           className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
                        >
                           Tentar novamente
                        </button>
                     </p>
                  )}
                  <div
                     className={clsx(
                        "transition-opacity",
                        isFetching && "opacity-50"
                     )}
                  >
                     <LocEspTable
                        localidades={localidades}
                        onEdit={abrirEdicao}
                     />
                  </div>
               </>
            )}
         </div>

         <LocEspFormModal
            show={modalAberto}
            localidade={emEdicao}
            isSaving={criar.isPending || atualizar.isPending}
            isDeleting={remover.isPending}
            onClose={() => setModalAberto(false)}
            onSave={handleSave}
            onDelete={handleDelete}
         />
      </div>
   );
}
