"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Label, Select } from "flowbite-react";
import clsx from "clsx";
import {
   HiPlus,
   HiOutlineBeaker,
   HiOutlineExclamationCircle,
} from "react-icons/hi";
import { usePropostas, useDeleteProposta } from "@/hooks/queries/usePropostas";
import type { PropostaListItem } from "services/routes/cegep/propostas";
import { useToast } from "@/app/context/toast";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { getDefaultFiscalYear, getFiscalYears } from "../fiscalYears";
import { ComissSubheader } from "../components/ComissSubheader";
import { PropostasList } from "./components/PropostasList";
import { PropostasListSkeleton } from "./components/PropostasListSkeleton";
import { CreatePropostaModal } from "./components/CreatePropostaModal";
import { DeletePropostaModal } from "./components/DeletePropostaModal";

/**
 * Aba "Propostas": lista as propostas do sandbox (simulações de
 * comissionamentos contra o teto orçamentário) e cuida de criar/excluir.
 * Abrir uma proposta navega para o sandbox em `/cegep/comiss/propostas/[id]`.
 */
export function PropostasTab() {
   const router = useRouter();
   const { push } = useToast();

   // Mesma régua da Gestão Fiscal: a aba abre no exercício corrente. Ver
   // propostas de outro ano é uma escolha explícita, não o estado inicial.
   const [ano, setAno] = useState<number>(getDefaultFiscalYear());
   const yearsRange = useMemo(() => getFiscalYears(), []);

   const {
      data: propostas,
      isLoading,
      isFetching,
      isError,
      refetch,
   } = usePropostas({ ano_ref: ano });
   const deleteMutation = useDeleteProposta();

   const [showCreate, setShowCreate] = useState(false);
   const [propostaToDelete, setPropostaToDelete] =
      useState<PropostaListItem | null>(null);

   function abrirProposta(id: number) {
      router.push(`/cegep/comiss/propostas/${id}`);
   }

   async function confirmarExclusao() {
      if (!propostaToDelete) return;
      try {
         await deleteMutation.mutateAsync(propostaToDelete.id);
         setPropostaToDelete(null);
         push({
            title: "Proposta excluída",
            message: `"${propostaToDelete.nome}" foi removida.`,
            type: "success",
         });
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao excluir a proposta";
         push({ title: "Erro", message, type: "error" });
      }
   }

   const lista = propostas ?? [];
   // Lista vazia: o CTA primário é o do estado vazio; o do subheader recua para
   // não competir com ele. `isError` sai da conta de propósito — falha de carga
   // não é ausência de propostas, e anunciar uma como a outra faria o usuário
   // criar de novo o que já existe.
   const vazio = !isLoading && !isError && lista.length === 0;

   return (
      <div className="flex flex-col gap-2">
         {/* Subheader da aba — renderizado de cara (shell imediato) */}
         <ComissSubheader
            actions={
               <>
                  <div className="flex items-center gap-2">
                     <Label
                        htmlFor="propostas-exercicio"
                        className="text-sm text-slate-600"
                     >
                        Exercício
                     </Label>
                     <Select
                        id="propostas-exercicio"
                        sizing="sm"
                        value={ano}
                        onChange={(e) => setAno(Number(e.target.value))}
                        className="min-w-28"
                     >
                        {yearsRange.map((y) => (
                           <option key={y} value={y}>
                              {y}
                           </option>
                        ))}
                     </Select>
                  </div>
                  <PermBased resource="comiss" requiredPerm="create">
                     <Button
                        size="sm"
                        color={vazio ? "light" : "primary"}
                        onClick={() => setShowCreate(true)}
                     >
                        <HiPlus className="mr-2 h-4 w-4" />
                        Nova Proposta
                     </Button>
                  </PermBased>
               </>
            }
         >
            <h2 className="text-base font-semibold text-slate-900">
               Propostas
            </h2>
            <p className="text-sm text-slate-500">
               Simulações de comissionamentos por exercício, sem efeito nos
               registros.
            </p>
         </ComissSubheader>

         {isLoading ? (
            <PropostasListSkeleton />
         ) : isError ? (
            <div className="flex flex-col items-center gap-3 rounded border border-red-200 bg-red-50 py-10 text-center">
               <HiOutlineExclamationCircle
                  aria-hidden
                  className="h-8 w-8 text-red-400"
               />
               <p className="text-sm font-medium text-red-800">
                  Não foi possível carregar as propostas de {ano}.
               </p>
               <Button size="sm" color="light" onClick={() => refetch()}>
                  Tentar novamente
               </Button>
            </div>
         ) : vazio ? (
            <div className="flex flex-col items-center gap-3 rounded border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
               <HiOutlineBeaker
                  aria-hidden
                  className="h-8 w-8 text-slate-400"
               />
               <p className="text-sm font-medium text-slate-600">
                  Nenhuma proposta para {ano}.
               </p>
               <PermBased resource="comiss" requiredPerm="create">
                  <Button
                     size="sm"
                     color="primary"
                     onClick={() => setShowCreate(true)}
                  >
                     Criar proposta para {ano}
                  </Button>
               </PermBased>
            </div>
         ) : (
            // Troca de exercício mantém a lista anterior em tela e só esmaece
            // (keepPreviousData) — sem piscar skeleton a cada ano.
            <div
               className={clsx(
                  "transition-opacity",
                  isFetching && "opacity-50"
               )}
            >
               <PropostasList
                  propostas={lista}
                  onOpen={abrirProposta}
                  onDelete={setPropostaToDelete}
               />
            </div>
         )}

         <CreatePropostaModal
            show={showCreate}
            anoInicial={ano}
            /* Sugestão derivada do que já existe no exercício, não um rótulo
               fixo: "Proposta 4" quando três já foram criadas em 2026. */
            sugestaoNome={`Proposta ${lista.length + 1}`}
            onClose={() => setShowCreate(false)}
            onCreated={(id) => {
               setShowCreate(false);
               abrirProposta(id);
            }}
         />

         <DeletePropostaModal
            proposta={propostaToDelete}
            isDeleting={deleteMutation.isPending}
            onClose={() => setPropostaToDelete(null)}
            onConfirm={confirmarExclusao}
         />
      </div>
   );
}
