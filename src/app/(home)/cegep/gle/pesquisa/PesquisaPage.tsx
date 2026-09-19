"use client";

import { useMemo, useState } from "react";
import { Button, Label, Select, TextInput } from "flowbite-react";
import clsx from "clsx";
import { HiInformationCircle, HiSearch, HiX } from "react-icons/hi";
import { TbMapPin } from "react-icons/tb";

import { dateToIso, todayIso } from "@/../utils/dateHandler";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLocalidades, usePesquisaLocEsp } from "@/hooks/queries/useGle";
import { GRUPO_A, GRUPO_B } from "services/routes/cegep/gle";

import { MissaoCard } from "./components/MissaoCard";
import { PesquisaSkeleton } from "./components/PesquisaSkeleton";

/**
 * Janela padrão: 1º de janeiro do ano corrente até hoje — o exercício em
 * curso, que é o recorte pelo qual a GLE é apurada. Mesmo critério de
 * `ops/om`, em fuso local (`dateToIso`), nunca `toISOString()`, que
 * deslocaria o dia perto da meia-noite.
 *
 * Calculado uma vez por montagem: se o usuário deixar a aba aberta na
 * virada do ano, o período não muda sozinho debaixo dele.
 */
function periodoPadrao() {
   const hoje = new Date();
   return {
      ini: dateToIso(new Date(hoje.getFullYear(), 0, 1)),
      fim: todayIso(),
   };
}

export function PesquisaPage() {
   const [padrao] = useState(periodoPadrao);
   const [dataIni, setDataIni] = useState(padrao.ini);
   const [dataFim, setDataFim] = useState(padrao.fim);
   const [grupo, setGrupo] = useState("");
   const [locEspId, setLocEspId] = useState("");

   const filtros = useMemo(
      () => ({
         data_ini: dataIni || undefined,
         data_fim: dataFim || undefined,
         grupo: grupo ? Number(grupo) : undefined,
         loc_esp_id: locEspId ? Number(locEspId) : undefined,
      }),
      [dataIni, dataFim, grupo, locEspId]
   );

   // A aba entra por `cegep.gle.view` (menu e rota), mas o endpoint é
   // gateado por `estatistica.etapas.view` — a pesquisa lê etapa. Quem tem
   // um e não o outro veria a faixa vermelha de erro como primeira
   // impressão da tela; aqui o motivo é dito, e nem se chama a API.
   const { hasPerm } = usePermBased();
   const podeConsultar = hasPerm("estatistica.etapas", "view");

   const { data, isLoading, isFetching, isError, error } = usePesquisaLocEsp(
      podeConsultar ? filtros : undefined,
      { enabled: podeConsultar }
   );
   // Para o seletor de localidade: a lista de referência, não o resultado.
   const { data: localidades } = useLocalidades(undefined);

   // "Tem filtro" = difere do padrão. O período padrão não conta como filtro
   // do usuário, senão o botão de limpar nasceria sempre visível.
   const temFiltro =
      dataIni !== padrao.ini ||
      dataFim !== padrao.fim ||
      Boolean(grupo) ||
      Boolean(locEspId);
   const missoes = data?.missoes ?? [];

   // A aba vive no `?tab=` da página pai: mudar o param basta, e com `push`
   // o usuário volta para a Pesquisa pelo botão voltar.
   const { setParams } = useSearchParamsUpdater();
   function irParaLocalidades() {
      setParams({ tab: "localidades" }, { push: true });
   }

   function limpar() {
      setDataIni(padrao.ini);
      setDataFim(padrao.fim);
      setGrupo("");
      setLocEspId("");
   }

   return (
      <div className="space-y-2">
         {/* A ressalva do cruzamento não é detalhe: um resultado vazio pode
             significar "não passou" ou "a localidade não está cadastrada", e
             o usuário não tem como distinguir sem saber disso. Por isso o
             aviso é permanente e aponta para a aba que resolve. */}
         <div className="flex gap-2.5 rounded border border-slate-200 bg-slate-50 p-3">
            <HiInformationCircle
               className="h-4 w-4 shrink-0 text-slate-400"
               aria-hidden
            />
            <p className="text-xs leading-relaxed text-slate-600">
               Cruza as <strong className="font-semibold">etapas de voo</strong>{" "}
               já realizadas com as localidades especiais, para identificar as
               missões que passaram por elas. Uma etapa entra quando decola de
               ou pousa numa dessas localidades e tem esforço aéreo lançado.{" "}
               <strong className="font-semibold text-slate-700">
                  Só entram no cruzamento as localidades cadastradas
               </strong>{" "}
               na aba{" "}
               <button
                  type="button"
                  onClick={irParaLocalidades}
                  className="text-primary-700 hover:text-primary-800 min-h-[24px] font-semibold underline underline-offset-2"
               >
                  Localidades
               </button>
               {" — "}
               se faltar alguma, as missões que passaram por lá não aparecem
               aqui.
            </p>
         </div>

         {/* Filtros */}
         <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
               <div>
                  <Label htmlFor="data_ini" className="mb-1 block text-xs">
                     De
                  </Label>
                  <TextInput
                     id="data_ini"
                     type="date"
                     value={dataIni}
                     onChange={(e) => setDataIni(e.target.value)}
                     sizing="sm"
                  />
               </div>

               <div>
                  <Label htmlFor="data_fim" className="mb-1 block text-xs">
                     Até
                  </Label>
                  <TextInput
                     id="data_fim"
                     type="date"
                     value={dataFim}
                     onChange={(e) => setDataFim(e.target.value)}
                     sizing="sm"
                  />
               </div>

               <div>
                  <Label htmlFor="f_grupo" className="mb-1 block text-xs">
                     Grupo
                  </Label>
                  <Select
                     id="f_grupo"
                     value={grupo}
                     onChange={(e) => setGrupo(e.target.value)}
                     sizing="sm"
                  >
                     <option value="">Todos</option>
                     <option value={GRUPO_A}>A</option>
                     <option value={GRUPO_B}>B</option>
                  </Select>
               </div>

               <div>
                  <Label htmlFor="f_local" className="mb-1 block text-xs">
                     Localidade
                  </Label>
                  <Select
                     id="f_local"
                     value={locEspId}
                     onChange={(e) => setLocEspId(e.target.value)}
                     sizing="sm"
                  >
                     <option value="">Todas</option>
                     {(localidades ?? []).map((loc) => (
                        <option key={loc.id} value={loc.id}>
                           {loc.cidade.nome} - {loc.cidade.uf}
                        </option>
                     ))}
                  </Select>
               </div>
            </div>

            {temFiltro && (
               <div className="mt-3 flex justify-end">
                  <Button color="light" size="xs" onClick={limpar}>
                     <HiX className="mr-1.5 h-3.5 w-3.5" />
                     Restaurar padrão
                  </Button>
               </div>
            )}
         </div>

         {/* Resultado */}
         {!podeConsultar ? (
            <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
               <EmptyState
                  icon={HiSearch}
                  title="Consulta indisponível"
                  description="A pesquisa cruza as etapas de voo registradas, e você não tem permissão para consultá-las. Peça acesso a “Etapas” em Estatística."
               />
            </div>
         ) : isError ? (
            <div
               className="rounded border border-slate-200 bg-white p-4 text-sm text-red-800 shadow-sm"
               role="alert"
            >
               Não foi possível pesquisar
               {error instanceof Error ? `: ${error.message}` : "."}
            </div>
         ) : isLoading ? (
            <PesquisaSkeleton />
         ) : missoes.length === 0 ? (
            <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
               <EmptyState
                  icon={TbMapPin}
                  title="Nenhuma missão passou por localidade especial"
                  description={
                     temFiltro
                        ? "Nenhuma missão no período ou na localidade escolhida. Ajuste os filtros — ou confira se a localidade está cadastrada."
                        : "Quando uma etapa decolar de ou pousar numa localidade especial cadastrada, a missão aparece aqui."
                  }
                  action={
                     temFiltro ? (
                        <Button color="light" onClick={limpar}>
                           Limpar filtros
                        </Button>
                     ) : undefined
                  }
               />
            </div>
         ) : (
            <div
               className={clsx(
                  "space-y-2 transition-opacity",
                  isFetching && !isLoading && "opacity-50"
               )}
            >
               <p className="flex items-center gap-1.5 px-1 text-sm text-slate-600">
                  <HiSearch className="h-4 w-4 shrink-0 text-slate-400" />
                  <strong className="font-semibold text-slate-900">
                     {data?.total_missoes}
                  </strong>
                  {data?.total_missoes === 1
                     ? "missão passou"
                     : "missões passaram"}{" "}
                  por localidade especial
               </p>

               {missoes.map((missao) => (
                  <MissaoCard key={missao.missao_id} missao={missao} />
               ))}
            </div>
         )}
      </div>
   );
}
