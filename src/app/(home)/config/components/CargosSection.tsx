"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineUser } from "react-icons/hi";
import { useAuth } from "@/app/context/auth";
import { useToast } from "@/app/context/toast";
import { useCargos, useSetCargo, useDeleteCargo } from "@/hooks/queries";
import {
   CARGOS,
   linhaAssinatura,
   type Cargo,
   type CargoTitular,
} from "services/routes/config";
import type { UserPublic } from "services/routes/users";
import { SearchUser } from "../../users/components/searchUser";

// Rótulo do cargo enquanto não há titular (o `label` autoritativo vem do
// backend junto do titular — aqui só nomeamos a linha vazia).
const CARGO_TITULOS: Record<Cargo, string> = {
   comandante: "Comandante",
   "chefe-operacoes": "Chefe de Operações",
};

export function CargosSection() {
   const { push } = useToast();
   const { activeOrg } = useAuth();

   const { data: cargos = [], isLoading } = useCargos(activeOrg);
   const setMutation = useSetCargo(activeOrg);
   const deleteMutation = useDeleteCargo(activeOrg);

   // Cargo cujo titular está sendo escolhido (abre o modal de busca)
   const [editando, setEditando] = useState<Cargo | null>(null);

   const busy = setMutation.isPending || deleteMutation.isPending;

   // A busca de usuários já vem escopada pela org ativa (o backend filtra por
   // User.unidade), então não há como escolher militar de outra unidade aqui.
   async function handleSelectUser(user: UserPublic) {
      if (!editando) return;
      try {
         const result = await setMutation.mutateAsync({
            cargo: editando,
            userId: user.id,
         });
         push(
            result.ok
               ? { type: "success", message: "Titular definido!" }
               : {
                    type: "error",
                    message: result.message || "Erro ao definir o titular",
                 }
         );
      } catch (err) {
         console.error("setCargo failed", err);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      } finally {
         setEditando(null);
      }
   }

   async function handleRemove(cargo: Cargo) {
      try {
         const result = await deleteMutation.mutateAsync(cargo);
         push(
            result.ok
               ? { type: "success", message: "Titular removido!" }
               : {
                    type: "error",
                    message: result.message || "Erro ao remover o titular",
                 }
         );
      } catch (err) {
         console.error("deleteCargo failed", err);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   }

   return (
      <section className="space-y-2 rounded border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
         <div>
            <h2 className="text-sm font-semibold text-slate-700">
               Cargos que assinam
            </h2>
            <p className="text-xs text-slate-500">
               Titulares impressos no rodapé dos documentos oficiais (Ordem de
               Missão). Posto e nome são lidos do cadastro do militar na hora da
               geração — uma promoção se propaga sozinha.
            </p>
         </div>

         {isLoading ? (
            <CargosSkeleton />
         ) : (
            <ul className="divide-y divide-slate-100 rounded border border-slate-200">
               {CARGOS.map((cargo) => {
                  const titular: CargoTitular | undefined = cargos.find(
                     (c) => c.cargo === cargo
                  );
                  // O nome completo é exigido ao definir o titular, mas o
                  // cadastro pode ser esvaziado depois — nesse caso não há
                  // assinatura possível e a OM fica bloqueada. Sinalizar aqui,
                  // que é onde o admin resolve.
                  const assinatura = titular ? linhaAssinatura(titular) : null;
                  return (
                     <li
                        key={cargo}
                        className="flex items-center gap-3 px-4 py-3"
                     >
                        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                           <HiOutlineUser className="size-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                           <p className="text-xs font-medium text-slate-500">
                              {CARGO_TITULOS[cargo]}
                           </p>
                           {assinatura ? (
                              <p className="truncate text-sm font-semibold text-slate-800">
                                 {assinatura}
                              </p>
                           ) : titular ? (
                              <p className="truncate text-sm font-semibold text-red-600">
                                 {titular.user.nome_guerra.toUpperCase()} — sem
                                 nome completo cadastrado
                              </p>
                           ) : (
                              <p className="text-sm text-slate-400 italic">
                                 Não definido
                              </p>
                           )}
                        </div>

                        <Button
                           size="xs"
                           color="light"
                           disabled={busy}
                           onClick={() => setEditando(cargo)}
                        >
                           <HiOutlinePencil className="mr-1 size-4" />
                           {titular ? "Trocar" : "Definir"}
                        </Button>

                        {titular && (
                           <Button
                              size="xs"
                              color="red"
                              disabled={busy}
                              onClick={() => handleRemove(cargo)}
                           >
                              <HiOutlineTrash className="size-4" />
                           </Button>
                        )}
                     </li>
                  );
               })}
            </ul>
         )}

         <SearchUser
            show={editando !== null}
            setShow={(show) => {
               if (!show) setEditando(null);
            }}
            setUser={handleSelectUser}
         />
      </section>
   );
}

function CargosSkeleton() {
   return (
      <ul className="divide-y divide-slate-100 rounded border border-slate-200">
         {CARGOS.map((cargo) => (
            <li key={cargo} className="flex items-center gap-3 px-4 py-3">
               <div className="size-9 shrink-0 animate-pulse rounded-md bg-slate-200" />
               <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
               </div>
               <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
            </li>
         ))}
      </ul>
   );
}
