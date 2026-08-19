"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { HiOutlineCheck, HiOutlineUserGroup } from "react-icons/hi";
import { useToast } from "@/app/context/toast";
import {
   useFuncoes,
   useFuncoesCatalogo,
   useSetFuncoesOrg,
} from "@/hooks/queries";
import { getFuncColors } from "@/constants/tripulantes/funcoes";
import type { FuncaoOrgItem } from "services/routes/funcs";

/**
 * Funções que a unidade opera.
 *
 * O catálogo (código, rótulo, cor, posições a bordo) é de sistema; aqui a
 * unidade marca o que opera e, se quiser, dá outro nome à função. É esse
 * conjunto que o cadastro de tripulante, a escala e os quadrinhos oferecem —
 * e que o backend valida na escrita.
 */
export function FuncoesSection() {
   const { push } = useToast();
   const { data: catalogo = [], isLoading: loadingCatalogo } =
      useFuncoesCatalogo(false);
   const { funcoes: operadas, isLoading: loadingOperadas } = useFuncoes();
   const salvar = useSetFuncoesOrg();

   const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
   const [nomes, setNomes] = useState<Record<string, string>>({});

   // O estado local espelha o que veio do servidor até o admin mexer; o
   // efeito re-sincroniza quando a query recarrega (troca de org, por ex.).
   useEffect(() => {
      setSelecionadas(new Set(operadas.map((f) => f.cod)));
      setNomes(
         Object.fromEntries(
            operadas
               .filter((f) => f.nome !== catalogoNome(catalogo, f.cod))
               .map((f) => [f.cod, f.nome])
         )
      );
   }, [operadas, catalogo]);

   const isLoading = loadingCatalogo || loadingOperadas;

   const alterado = useMemo(() => {
      const atuais = new Set(operadas.map((f) => f.cod));
      if (atuais.size !== selecionadas.size) return true;
      if ([...atuais].some((cod) => !selecionadas.has(cod))) return true;
      return operadas.some((f) => (nomes[f.cod] ?? f.nome) !== f.nome);
   }, [operadas, selecionadas, nomes]);

   function toggle(cod: string) {
      setSelecionadas((prev) => {
         const next = new Set(prev);
         if (next.has(cod)) {
            next.delete(cod);
         } else {
            next.add(cod);
         }
         return next;
      });
   }

   async function handleSalvar() {
      // A ordem do catálogo é a canônica; a unidade só escolhe o conjunto.
      const payload: FuncaoOrgItem[] = catalogo
         .filter((f) => selecionadas.has(f.cod))
         .map((f, index) => ({
            cod: f.cod,
            nome_custom:
               nomes[f.cod] && nomes[f.cod] !== f.nome ? nomes[f.cod] : null,
            ordem: index + 1,
         }));

      try {
         await salvar.mutateAsync(payload);
         push({ type: "success", message: "Funções da unidade atualizadas" });
      } catch (err) {
         push({
            type: "error",
            message:
               err instanceof Error
                  ? err.message
                  : "Erro ao salvar as funções da unidade",
         });
      }
   }

   return (
      <section className="space-y-2 rounded border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
         <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
               <h2 className="text-sm font-semibold text-slate-700">
                  Funções operadas
               </h2>
               <p className="text-xs text-slate-500">
                  Define o que aparece no cadastro de tripulante, na escala e
                  nos quadrinhos. Função com tripulante ativo não pode ser
                  desmarcada.
               </p>
            </div>

            <Button
               size="xs"
               color="primary"
               disabled={!alterado || salvar.isPending}
               onClick={handleSalvar}
            >
               <HiOutlineCheck className="mr-1 size-4" />
               {salvar.isPending ? "Salvando..." : "Salvar"}
            </Button>
         </div>

         {isLoading ? (
            <FuncoesSkeleton />
         ) : (
            <ul className="divide-y divide-slate-100 rounded border border-slate-200">
               {catalogo.map((func) => {
                  const marcada = selecionadas.has(func.cod);
                  const colors = getFuncColors(func.cor);

                  return (
                     <li
                        key={func.cod}
                        className="flex flex-wrap items-center gap-3 px-4 py-3"
                     >
                        <Checkbox
                           id={`func-${func.cod}`}
                           color="primary"
                           checked={marcada}
                           onChange={() => toggle(func.cod)}
                        />

                        <span
                           className={`grid size-9 shrink-0 place-items-center rounded-md font-mono text-xs font-bold uppercase ${colors.badge}`}
                        >
                           {func.cod}
                        </span>

                        <Label
                           htmlFor={`func-${func.cod}`}
                           className="min-w-0 flex-1 cursor-pointer"
                        >
                           <span className="block text-sm font-semibold text-slate-800">
                              {func.nome}
                           </span>
                           <span className="block text-xs text-slate-500">
                              {func.posicoes.length > 0
                                 ? func.posicoes.map((p) => p.cod).join(" · ")
                                 : "sem posição a bordo"}
                           </span>
                        </Label>

                        <TextInput
                           sizing="sm"
                           className="w-full sm:w-56"
                           placeholder="Nome nesta unidade (opcional)"
                           disabled={!marcada}
                           value={nomes[func.cod] ?? ""}
                           onChange={(e) =>
                              setNomes((prev) => ({
                                 ...prev,
                                 [func.cod]: e.target.value,
                              }))
                           }
                        />
                     </li>
                  );
               })}
            </ul>
         )}
      </section>
   );
}

/** Rótulo do catálogo, para distinguir o que é nome customizado da org. */
function catalogoNome(
   catalogo: { cod: string; nome: string }[],
   cod: string
): string | undefined {
   return catalogo.find((f) => f.cod === cod)?.nome;
}

function FuncoesSkeleton() {
   return (
      <ul className="divide-y divide-slate-100 rounded border border-slate-200">
         {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
               <div className="size-4 shrink-0 animate-pulse rounded bg-slate-200" />
               <div className="size-9 shrink-0 animate-pulse rounded-md bg-slate-200" />
               <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
               </div>
               <div className="h-8 w-56 animate-pulse rounded bg-slate-100" />
            </li>
         ))}
      </ul>
   );
}
