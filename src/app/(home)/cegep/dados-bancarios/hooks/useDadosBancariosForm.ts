import { useEffect, useState } from "react";
import { UserPublic } from "services/routes/users";
import { DadosBancariosWithUser } from "services/routes/cegep/dadosBancarios";
import { useToast } from "@/app/context/toast";
import {
   useCreateDadosBancarios,
   useUpdateDadosBancarios,
   useDeleteDadosBancarios,
   useSyncRemuneracaoPortal,
} from "@/hooks/queries";
import { monthInputToIso } from "@/../utils/dateHandler";
import { realCurrency } from "@/../utils/financeiro";
import { BANCOS_BRASILEIROS } from "../constants/bancos";
import {
   DadosBancariosFormData,
   createEmptyForm,
   formFromDados,
   toDadosBancariosPayload,
   validateDadosBancariosForm,
} from "../helpers/dadosBancariosForm";

interface UseDadosBancariosFormParams {
   show: boolean;
   dados?: DadosBancariosWithUser;
   onClose: () => void;
}

/**
 * Concentra todo o estado e a lógica do formulário de dados bancários
 * (criação/edição), mantendo o componente de UI apenas com a composição.
 */
export function useDadosBancariosForm({
   show,
   dados,
   onClose,
}: UseDadosBancariosFormParams) {
   const { push } = useToast();
   const isEdit = !!dados;

   const createMutation = useCreateDadosBancarios();
   const updateMutation = useUpdateDadosBancarios();
   const deleteMutation = useDeleteDadosBancarios();
   const syncMutation = useSyncRemuneracaoPortal();

   const isLoading = createMutation.isPending || updateMutation.isPending;
   const isDeleting = deleteMutation.isPending;
   const isSyncing = syncMutation.isPending;

   const [selectedUser, setSelectedUser] = useState<UserPublic | null>(
      dados?.user ?? null
   );
   const [formData, setFormData] = useState<DadosBancariosFormData>(() =>
      dados ? formFromDados(dados) : createEmptyForm()
   );
   const [errors, setErrors] = useState<Record<string, string>>({});

   // Resetar formulário quando o modal abrir
   useEffect(() => {
      if (!show) return;
      setSelectedUser(dados?.user ?? null);
      setFormData(dados ? formFromDados(dados) : createEmptyForm());
      setErrors({});
   }, [show, dados]);

   const clearError = (name: string) => {
      setErrors((prev) => {
         if (!prev[name]) return prev;
         const next = { ...prev };
         delete next[name];
         return next;
      });
   };

   const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      clearError(name);
   };

   const handleBancoSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const codigo = e.target.value;
      const banco = BANCOS_BRASILEIROS.find((b) => b.codigo === codigo);
      if (!banco) return;
      setFormData((prev) => ({
         ...prev,
         codigo_banco: banco.codigo,
         banco: banco.nome,
      }));
      setErrors((prev) => {
         const next = { ...prev };
         delete next.codigo_banco;
         delete next.banco;
         return next;
      });
   };

   const setMesAno = (value: string) => {
      setFormData((prev) => ({ ...prev, mes_ano: value }));
      clearError("mes_ano");
   };

   const handleSyncPortal = async () => {
      const userId = isEdit ? dados!.user.id : selectedUser?.id;
      if (!userId) {
         setErrors((prev) => ({
            ...prev,
            user: "Selecione um usuário antes de buscar no Portal",
         }));
         return;
      }
      if (!formData.mes_ano) {
         setErrors((prev) => ({
            ...prev,
            mes_ano: "Informe o mês/ano antes de buscar no Portal",
         }));
         return;
      }

      try {
         const result = await syncMutation.mutateAsync({
            user_id: userId,
            mes_ano: monthInputToIso(formData.mes_ano),
         });

         const valor = result.remuneracao_bruta;
         if (valor == null) {
            push({
               title: "Atenção",
               message: "Portal não retornou remuneração bruta para este mês.",
               type: "warning",
            });
            return;
         }

         setFormData((prev) => ({ ...prev, remuneracao: String(valor) }));
         push({
            message: `Remuneração bruta de ${realCurrency(
               valor
            )} preenchida. Revise e clique em Atualizar para salvar.`,
            type: "success",
         });
      } catch (err) {
         push({
            title: "Erro Portal da Transparência",
            message:
               err instanceof Error
                  ? err.message
                  : "Falha ao consultar o Portal",
            type: "error",
         });
      }
   };

   const save = async () => {
      const validationErrors = validateDadosBancariosForm(formData, {
         isEdit,
         selectedUser,
      });
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;

      const payload = toDadosBancariosPayload(formData);

      try {
         if (isEdit) {
            await updateMutation.mutateAsync({ id: dados!.id, data: payload });
         } else {
            if (!selectedUser) return;
            await createMutation.mutateAsync({
               user_id: selectedUser.id,
               ...payload,
            });
         }
         push({
            message: isEdit
               ? "Dados bancários atualizados com sucesso"
               : "Dados bancários cadastrados com sucesso",
            type: "success",
         });
         onClose();
      } catch (err) {
         push({
            title: "Erro",
            message:
               err instanceof Error
                  ? err.message
                  : "Erro ao salvar dados bancários",
            type: "error",
         });
      }
   };

   const remove = async () => {
      if (!dados?.id) return;
      try {
         await deleteMutation.mutateAsync(dados.id);
         push({
            message: "Dados bancários deletados com sucesso",
            type: "success",
         });
         onClose();
      } catch (err) {
         push({
            title: "Erro",
            message:
               err instanceof Error
                  ? err.message
                  : "Erro ao deletar dados bancários",
            type: "error",
         });
      }
   };

   return {
      isEdit,
      formData,
      errors,
      selectedUser,
      setSelectedUser,
      handleChange,
      handleBancoSelect,
      setMesAno,
      handleSyncPortal,
      save,
      remove,
      isLoading,
      isDeleting,
      isSyncing,
   };
}
