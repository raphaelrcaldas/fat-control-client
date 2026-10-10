import { useState } from "react";
import { useToast } from "@/app/context/toast";
import { useUpsertCartao, useDeleteCartao } from "@/hooks/queries";
import { usePermBased } from "../../../hooks/usePermBased";
import { formatSaveError, type ApiErrorLabels } from "@/../utils/apiErrors";
import type {
   TripCartoesOut,
   CartoesUpsert,
} from "services/routes/instrucao/cartoes";
import { LANG_FIELDS, PROVA_FIELDS } from "../cartoes.config";

export interface CartaoFormState {
   ptai_validade: string;
   tai_s_validade: string;
   tai_s1_validade: string;
   cvi_validade: string;
   hab_espanhol: string;
   val_espanhol: string;
   hab_ingles: string;
   val_ingles: string;
}

export type CartaoFormErrors = Partial<Record<keyof CartaoFormState, string>>;

// Rótulos do 422 (`body.val_espanhol` → "Validade do Espanhol"), derivados das
// mesmas fontes do formulário.
const ERROR_LABELS: ApiErrorLabels = {
   fields: Object.fromEntries([
      ...PROVA_FIELDS.map((f) => [`${f.key}_validade`, f.label]),
      ...LANG_FIELDS.flatMap((f) => [
         [f.levelName, `Nível de ${f.lang}`],
         [f.validadeName, `Validade de ${f.lang}`],
      ]),
   ]),
};

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

// Espelha o `validade_requer_habilitacao` do backend: validade de idioma sem
// nível é recusada lá, então barra aqui com o erro no próprio campo em vez de
// um 422 depois do clique.
function validate(form: CartaoFormState): CartaoFormErrors {
   const errors: CartaoFormErrors = {};
   for (const f of LANG_FIELDS) {
      if (form[f.validadeName] && !form[f.levelName]) {
         errors[f.levelName] = "Informe o nível para registrar a validade.";
      }
   }
   return errors;
}

// Encapsula estado do form + mutations + toast. O modal fica só com
// apresentação. O componente remonta a cada novo `item` (page usa
// `editItem && <Modal item={editItem}>`), então o initializer do useState
// basta — sem necessidade de useEffect de reset.
export function useCartaoForm(item: TripCartoesOut, onClose: () => void) {
   const { push } = useToast();
   const { hasPerm } = usePermBased();
   const isEdit = !!item.cartao;

   const upsertMutation = useUpsertCartao();
   const deleteMutation = useDeleteCartao();

   const [formData, setFormData] = useState<CartaoFormState>(() =>
      buildFormState(item)
   );
   const [errors, setErrors] = useState<CartaoFormErrors>({});

   const handleInput = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Qualquer edição no par do idioma pode resolver o erro do nível.
      const lang = LANG_FIELDS.find(
         (f) => f.levelName === name || f.validadeName === name
      );
      if (lang && errors[lang.levelName]) {
         setErrors((prev) => ({ ...prev, [lang.levelName]: undefined }));
      }
   };

   const handleSave = async () => {
      const found = validate(formData);
      const invalidos = LANG_FIELDS.filter((f) => found[f.levelName]);
      if (invalidos.length > 0) {
         setErrors(found);
         // O erro no campo pode estar abaixo da dobra do modal e só é lido
         // pelo leitor de tela com foco no Select: foca o primeiro e resume
         // no toast.
         document.getElementById(invalidos[0].levelName)?.focus();
         push({
            title: "Atenção",
            message: `Informe o nível de ${invalidos
               .map((f) => f.lang)
               .join(" e ")} para registrar a validade.`,
            type: "error",
         });
         return;
      }

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
      // Evita persistir um cartão totalmente vazio (todos os campos null),
      // que criaria um registro sem conteúdo mas marcado como cadastrado.
      const hasAnyValue = Object.values(data).some((v) => v !== null);
      if (!hasAnyValue) {
         push({
            title: "Atenção",
            // O "Remover cadastro" só existe para quem tem `delete`.
            message:
               isEdit && hasPerm("instrucao.cartoes", "delete")
                  ? "Todos os campos estão vazios. Para apagar o cartão, use “Remover cadastro”."
                  : "Preencha ao menos um campo para salvar.",
            type: "error",
         });
         return;
      }

      try {
         await upsertMutation.mutateAsync({ trip_id: item.trip_id, data });
         push({
            message: isEdit
               ? "Cartão atualizado com sucesso"
               : "Cartão cadastrado com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message: formatSaveError(
               err,
               "Erro ao salvar cartão",
               ERROR_LABELS
            ),
            type: "error",
         });
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
      errors,
      handleInput,
      handleSave,
      handleDelete,
      isEdit,
      isSaving: upsertMutation.isPending,
      isDeleting: deleteMutation.isPending,
   };
}
