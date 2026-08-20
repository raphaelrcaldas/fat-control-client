"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { FaUserGroup, FaTriangleExclamation } from "react-icons/fa6";
import { useToast } from "@/app/context/toast";
import { usePaop, useSetItemTripulantes } from "@/hooks/queries";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { TripulanteMatriculado } from "services/routes/instrucao/paops";
import { MatriculaModal } from "../../components/MatriculaModal";
import { ItemHeader } from "./components/ItemHeader";
import {
   MatriculadosTable,
   MatriculadosTableSkeleton,
} from "./components/MatriculadosTable";

/**
 * Um subprograma dentro do PAOP: quem está matriculado nele.
 *
 * Os dados vêm do detalhe do plano (`GET /instrucao/paops/{id}`), que a
 * listagem já carregou — a navegação reaproveita o cache em vez de pedir um
 * endpoint só para o item.
 */
export default function PaopItemPage() {
   const params = useParams<{ paopId: string; itemId: string }>();
   const paopId = Number(params.paopId);
   const itemId = Number(params.itemId);

   const { push } = useToast();
   const { data: paop, isLoading, error } = usePaop(paopId);
   const matriculaMutation = useSetItemTripulantes();

   const [showMatricula, setShowMatricula] = useState(false);
   const [removendo, setRemovendo] = useState<TripulanteMatriculado | null>(
      null
   );

   const item = paop?.subprogramas.find((i) => i.id === itemId) ?? null;

   async function salvar(tripIds: number[], mensagem: string) {
      try {
         await matriculaMutation.mutateAsync({ paopId, itemId, tripIds });
         push({ type: "success", message: mensagem });
         return true;
      } catch (err) {
         push({
            type: "error",
            message:
               err instanceof Error
                  ? err.message
                  : "Erro ao salvar as matrículas",
         });
         return false;
      }
   }

   async function handleMatricular(tripIds: number[]) {
      if (await salvar(tripIds, "Matrículas atualizadas")) {
         setShowMatricula(false);
      }
   }

   async function handleRemover() {
      if (!item || !removendo) return;
      const restantes = item.tripulantes
         .filter((t) => t.trip_id !== removendo.trip_id)
         .map((t) => t.trip_id);
      if (await salvar(restantes, "Tripulante desmatriculado")) {
         setRemovendo(null);
      }
   }

   if (isLoading) {
      return (
         <div className="space-y-2">
            <MatriculadosTableSkeleton />
         </div>
      );
   }

   if (error || !paop || !item) {
      return (
         <EmptyState
            icon={FaTriangleExclamation}
            titleAs="h1"
            title="Subprograma não encontrado neste PAOP"
            description={
               error instanceof Error
                  ? error.message
                  : "Volte ao plano e escolha um subprograma da relação."
            }
         />
      );
   }

   return (
      <div className="space-y-2">
         <ItemHeader
            paop={paop}
            item={item}
            isBusy={matriculaMutation.isPending}
            onMatricular={() => setShowMatricula(true)}
         />

         {item.tripulantes.length === 0 ? (
            <EmptyState
               icon={FaUserGroup}
               title="Nenhum tripulante matriculado"
               description="Use “Matricular” para cadastrar quem cumpre este subprograma."
            />
         ) : (
            <MatriculadosTable
               tripulantes={item.tripulantes}
               isBusy={matriculaMutation.isPending}
               onRemover={setRemovendo}
            />
         )}

         <MatriculaModal
            show={showMatricula}
            item={item}
            isSaving={matriculaMutation.isPending}
            onClose={() => setShowMatricula(false)}
            onSubmit={handleMatricular}
         />

         <ConfirmModal
            show={removendo !== null}
            title={`Desmatricular ${removendo?.nome_guerra?.toUpperCase() ?? ""}?`}
            description="O tripulante sai deste subprograma do plano."
            isLoading={matriculaMutation.isPending}
            onClose={() => setRemovendo(null)}
            onConfirm={handleRemover}
            confirmButtonText="Desmatricular"
         />
      </div>
   );
}
