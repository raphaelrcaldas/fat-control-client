import { useState } from "react";
import { useToast } from "@/app/context/toast";
import { useUpsertCartao, useDeleteCartao } from "@/hooks/queries";
import type {
   TripCartoesOut,
   CartoesUpsert,
} from "services/routes/instrucao/cartoes";

interface CartaoFormState {
   ptai_validade: string;
   tai_s_validade: string;
   tai_s1_validade: string;
   cvi_validade: string;
   hab_espanhol: string;
   val_espanhol: string;
   hab_ingles: string;
   val_ingles: string;
}

function buildFormState(item: TripCartoesOut): CartaoFormState {
   return {
      ptai_validade: item.cartao?.ptai_validade ?? "",
      tai_s_validade: item.cartao?.tai_s_validade ?? "",
      tai_s1_validade: item.cartao?.tai_s1_validade ?? "",
      cvi_validade: item.cartao?.cvi_validade ?? "",
      hab_espanhol: item.cartao?.hab_espanhol ?? "",
      val_espanhol: item.cartao?.val_espanhol ?? "",
      hab_ingles: item.cartao?.hab_ingles ?? "",
      val_ingles: item.cartao?.val_ingles ?? "",
   };
}

// Encapsula estado do form + mutations + toast. O drawer fica só com
// apresentação. O componente remonta a cada novo `item` (page usa
// `editItem && <Drawer item={editItem}>`), então o initializer do useState
// basta — sem necessidade de useEffect de reset.
export function useCartaoForm(item: TripCartoesOut, onClose: () => void) {
   const { push } = useToast();
   const isEdit = !!item.cartao;

   const upsertMutation = useUpsertCartao();
   const deleteMutation = useDeleteCartao();

   const [formData, setFormData] = useState<CartaoFormState>(() =>
      buildFormState(item)
   );

   const handleInput = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSave = async () => {
      try {
         const data: CartoesUpsert = {
            ptai_validade: formData.ptai_validade || null,
            tai_s_validade: formData.tai_s_validade || null,
            tai_s1_validade: formData.tai_s1_validade || null,
            cvi_validade: formData.cvi_validade || null,
            hab_espanhol: formData.hab_espanhol || null,
            val_espanhol: formData.val_espanhol || null,
            hab_ingles: formData.hab_ingles || null,
            val_ingles: formData.val_ingles || null,
         };
         await upsertMutation.mutateAsync({ trip_id: item.trip_id, data });
         push({
            message: isEdit
               ? "Cartão atualizado com sucesso"
               : "Cartão cadastrado com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao salvar cartão";
         push({ title: "Erro", message, type: "error" });
      }
   };

   const handleDelete = async () => {
      try {
         await deleteMutation.mutateAsync(item.trip_id);
         push({ message: "Cartão removido com sucesso", type: "success" });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao remover cartão";
         push({ title: "Erro", message, type: "error" });
      }
   };

   return {
      formData,
      handleInput,
      handleSave,
      handleDelete,
      isEdit,
      isSaving: upsertMutation.isPending,
      isDeleting: deleteMutation.isPending,
   };
}
