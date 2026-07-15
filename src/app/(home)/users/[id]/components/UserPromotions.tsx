/**
 * Histórico de promoções (progressão de carreira) do usuário.
 * Permite visualizar, adicionar e remover promoções.
 * A validação de hierarquia (progressão ascendente) é feita no backend.
 */

import { useState } from "react";
import { Button, Label, Select, Spinner, TextInput } from "flowbite-react";
import { HiPlus, HiTrash, HiArrowUp } from "react-icons/hi";
import { postoGradRecords } from "@/constants/militar/postos";
import {
   useUserPromos,
   useCreateUserPromo,
   useDeleteUserPromo,
} from "@/hooks/queries";
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";
import { useToast } from "@/app/context/toast";
import { formatDateFull } from "utils/dateHandler";

// postos ordenados por antiguidade (menor ant = graduação superior)
const pgOptions = [...postoGradRecords]
   .sort((a, b) => a.ant - b.ant)
   .map((pg) => ({ value: pg.short, label: pg.mid }));

function AddPromoForm({ userId }: { userId: number }) {
   const [pg, setPg] = useState("");
   const [data, setData] = useState("");
   const createPromo = useCreateUserPromo();
   const { push } = useToast();

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      if (!pg || !data) {
         push({ message: "Preencha graduação e data", type: "error" });
         return;
      }

      try {
         const result = await createPromo.mutateAsync({
            id: userId,
            data: { p_g: pg, data_promo: data },
         });
         if (result.ok) {
            push({ message: "Promoção registrada", type: "success" });
            setPg("");
            setData("");
         } else {
            push({
               message: result.message || "Erro ao registrar promoção",
               type: "error",
            });
         }
      } catch (err: any) {
         push({ message: err?.message || "Erro ao registrar", type: "error" });
      }
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="flex flex-col gap-3 rounded border border-slate-200 bg-gray-50 p-4 sm:flex-row sm:items-end"
      >
         <div className="flex-1">
            <Label
               htmlFor="promo-pg"
               className="mb-1 block text-xs font-medium tracking-wide text-gray-500 uppercase"
            >
               Graduação
            </Label>
            <Select
               id="promo-pg"
               sizing="sm"
               value={pg}
               onChange={(e) => setPg(e.target.value)}
            >
               <option value="" disabled>
                  Selecione...
               </option>
               {pgOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                     {opt.label}
                  </option>
               ))}
            </Select>
         </div>
         <div className="flex-1">
            <Label
               htmlFor="promo-data"
               className="mb-1 block text-xs font-medium tracking-wide text-gray-500 uppercase"
            >
               Data da Promoção
            </Label>
            <TextInput
               id="promo-data"
               type="date"
               sizing="sm"
               value={data}
               onChange={(e) => setData(e.target.value)}
            />
         </div>
         <Button
            type="submit"
            color="primary"
            size="sm"
            disabled={createPromo.isPending}
            className="shrink-0"
         >
            {createPromo.isPending ? (
               <Spinner size="sm" color="primary" />
            ) : (
               <>
                  <HiPlus className="mr-1.5 h-4 w-4" />
                  Adicionar
               </>
            )}
         </Button>
      </form>
   );
}

function PromoRow({
   userId,
   promoId,
   pgShort,
   dataPromo,
}: {
   userId: number;
   promoId: number;
   pgShort: string;
   dataPromo: string;
}) {
   const deletePromo = useDeleteUserPromo();
   const { push } = useToast();

   const posto = postoGradRecords.find((p) => p.short === pgShort);
   const label = posto ? posto.mid : pgShort;

   async function handleDelete() {
      try {
         const result = await deletePromo.mutateAsync({ id: userId, promoId });
         if (result.ok) {
            push({ message: "Promoção removida", type: "success" });
         } else {
            push({
               message: result.message || "Erro ao remover",
               type: "error",
            });
         }
      } catch (err: any) {
         push({ message: err?.message || "Erro ao remover", type: "error" });
      }
   }

   return (
      <div className="group flex items-center gap-3 px-5 py-3.5">
         <div className="bg-primary-100 shrink-0 rounded-md p-2.5">
            <HiArrowUp className="text-primary-600 h-4 w-4" />
         </div>
         <div className="min-w-0 flex-1">
            <p className="text-sm leading-tight font-semibold text-gray-900 capitalize">
               {label}
            </p>
            <p className="text-xs text-gray-500">{formatDateFull(dataPromo)}</p>
         </div>
         <PermBased resource="user" requiredPerm="update">
            {deletePromo.isPending ? (
               <Spinner size="sm" color="primary" />
            ) : (
               <button
                  onClick={handleDelete}
                  className="shrink-0 rounded p-1.5 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remover promoção"
               >
                  <HiTrash className="h-4 w-4" />
               </button>
            )}
         </PermBased>
      </div>
   );
}

export function UserPromotions({ userId }: { userId: number }) {
   const { data: promos = [], isLoading, error } = useUserPromos(userId);
   const { hasPerm } = usePermBased();
   const canManage = hasPerm("user", "update");

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center py-16">
            <Spinner size="xl" color="primary" />
            <p className="mt-4 text-gray-500">Carregando promoções...</p>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex flex-col items-center justify-center py-16">
            <p className="font-medium text-red-600">
               {error instanceof Error
                  ? error.message
                  : "Erro ao carregar promoções"}
            </p>
         </div>
      );
   }

   return (
      <div className="space-y-5">
         {canManage && <AddPromoForm userId={userId} />}

         <div className="rounded border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-3">
               <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <HiArrowUp className="text-primary-600 h-4 w-4" />
                  Progressão de Carreira
               </h2>
            </div>
            {promos.length === 0 ? (
               <p className="px-5 py-8 text-center text-sm text-gray-500">
                  Nenhuma promoção registrada para este militar.
               </p>
            ) : (
               <div className="divide-y divide-slate-100">
                  {promos.map((promo) => (
                     <PromoRow
                        key={promo.id}
                        userId={userId}
                        promoId={promo.id}
                        pgShort={promo.p_g}
                        dataPromo={promo.data_promo}
                     />
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
