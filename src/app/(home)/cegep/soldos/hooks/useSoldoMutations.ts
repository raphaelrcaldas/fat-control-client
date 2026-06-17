import { useToast } from "../../../../context/toast";
import {
   useCreateSoldo,
   useUpdateSoldo,
   useDeleteSoldo,
} from "@/hooks/queries";
import { SoldoPublic } from "services/routes/cegep/soldos";
import { SoldoFormData } from "../schemas/soldoSchema";
import { resolveMid } from "../helpers/soldoHelpers";

/**
 * Orquestra a escrita de soldos (criar/atualizar/excluir) com toast e
 * confirmação, mantendo a página declarativa. `save` decide create vs update
 * a partir de `editing`; `remove` confirma antes de excluir.
 */
export function useSoldoMutations() {
   const { push } = useToast();
   const createMutation = useCreateSoldo();
   const updateMutation = useUpdateSoldo();
   const deleteMutation = useDeleteSoldo();

   const save = async (
      formData: SoldoFormData,
      editing: SoldoPublic | null
   ): Promise<boolean> => {
      const payload = {
         pg: formData.pg,
         data_inicio: formData.data_inicio,
         data_fim: formData.data_fim || null,
         valor: formData.valor,
      };

      try {
         if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: payload });
            push({
               title: "Sucesso!",
               message: "Soldo atualizado com sucesso",
               type: "success",
            });
         } else {
            await createMutation.mutateAsync(payload);
            push({
               title: "Sucesso!",
               message: "Soldo cadastrado com sucesso",
               type: "success",
            });
         }
         return true;
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao salvar soldo",
            type: "error",
         });
         return false;
      }
   };

   const remove = async (soldo: SoldoPublic): Promise<void> => {
      if (
         !confirm(
            `Tem certeza que deseja excluir o soldo de ${resolveMid(soldo)}?`
         )
      ) {
         return;
      }

      try {
         await deleteMutation.mutateAsync(soldo.id);
         push({
            title: "Sucesso!",
            message: "Soldo excluido com sucesso",
            type: "success",
         });
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao excluir soldo",
            type: "error",
         });
      }
   };

   const isSaving = createMutation.isPending || updateMutation.isPending;

   return { save, remove, isSaving };
}
