import { useToast } from "../../../../context/toast";
import {
   useCreateSoldo,
   useUpdateSoldo,
   useDeleteSoldo,
} from "@/hooks/queries";
import { SoldoPublic } from "services/routes/admin/soldos";
import { SoldoFormData } from "../schemas/soldoSchema";
import { formatSoldoSaveError } from "../soldoErrors";

/**
 * Orquestra a escrita de soldos (criar/atualizar/excluir) com toast, mantendo
 * a página declarativa. `save` decide create vs update a partir de `editing`.
 *
 * `save` **relança** a falha em vez de engoli-la: quem chama é o formulário, e
 * só ele pode devolver o erro de validação (422) ao input correspondente. A
 * confirmação de exclusão também não mora aqui — é da página, que tem o modal.
 */
export function useSoldoMutations() {
   const { push } = useToast();
   const createMutation = useCreateSoldo();
   const updateMutation = useUpdateSoldo();
   const deleteMutation = useDeleteSoldo();

   const save = async (
      formData: SoldoFormData,
      editing: SoldoPublic | null
   ): Promise<void> => {
      const payload = {
         pg: formData.pg,
         data_inicio: formData.data_inicio,
         data_fim: formData.data_fim || null,
         valor: formData.valor,
      };

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
   };

   const remove = async (soldo: SoldoPublic): Promise<boolean> => {
      try {
         await deleteMutation.mutateAsync(soldo.id);
         push({
            title: "Sucesso!",
            message: "Soldo excluído com sucesso",
            type: "success",
         });
         return true;
      } catch (err: unknown) {
         push({
            title: "Erro",
            message: formatSoldoSaveError(err, "Erro ao excluir soldo"),
            type: "error",
         });
         return false;
      }
   };

   const isSaving = createMutation.isPending || updateMutation.isPending;

   return { save, remove, isSaving, isDeleting: deleteMutation.isPending };
}
