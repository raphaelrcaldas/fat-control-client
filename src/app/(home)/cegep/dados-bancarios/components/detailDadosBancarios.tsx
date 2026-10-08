import { useMemo, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   TextInput,
   Select,
   Spinner,
} from "flowbite-react";
import { HiCloudDownload, HiTrash } from "react-icons/hi";
import { DadosBancariosWithUser } from "services/routes/cegep/dadosBancarios";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";
import { useDadosBancarios } from "@/hooks/queries";
import { realCurrency } from "@/../utils/financeiro";
import { useDadosBancariosForm } from "../hooks/useDadosBancariosForm";
import { BANCOS_BRASILEIROS } from "../constants/bancos";
import { UserSelector } from "./UserSelector";
import { MesAnoPicker } from "./MesAnoPicker";

interface DetailDadosBancariosProps {
   show: boolean;
   onClose: () => void;
   dados?: DadosBancariosWithUser;
}

export default function DetailDadosBancarios({
   show,
   onClose,
   dados,
}: DetailDadosBancariosProps) {
   const {
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
   } = useDadosBancariosForm({ show, dados, onClose });

   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

   // Sem permissão de gravar, o modal é só consulta: campos desabilitados em
   // vez de editáveis sem botão de salvar.
   const { hasPerm } = usePermBased();
   const canSave = hasPerm(
      "cegep.dados_bancarios",
      isEdit ? "update" : "create"
   );
   const isBusy = isLoading || isDeleting;

   // No cadastro, quem já tem conta sai desabilitado na busca: escolhê-lo só
   // falhava no salvar, com o formulário inteiro preenchido. Mesma chave da
   // lista sem busca da página, então costuma vir do cache.
   const { data: cadastrados } = useDadosBancarios({}, { enabled: !isEdit });
   const idsCadastrados = useMemo(
      () => cadastrados?.map((d) => d.user_id),
      [cadastrados]
   );

   const handleConfirmDelete = async () => {
      await remove();
      setShowDeleteConfirm(false);
   };

   return (
      <>
         <Modal show={show} onClose={onClose} size="lg" dismissible={!isBusy}>
            <ModalHeader>
               {!isEdit
                  ? "Cadastrar Dados Bancários"
                  : canSave
                    ? "Editar Dados Bancários"
                    : "Dados Bancários"}
            </ModalHeader>
            <ModalBody>
               <fieldset
                  disabled={!canSave || isLoading}
                  className="min-w-0 space-y-6"
               >
                  <UserSelector
                     value={selectedUser}
                     onChange={setSelectedUser}
                     readOnly={isEdit}
                     error={errors.user}
                     userIdsIgnr={idsCadastrados}
                  />

                  <div className="border-t border-slate-200 dark:border-gray-700" />

                  {/* Seleção de Banco */}
                  <div>
                     <Label htmlFor="banco_select">Banco *</Label>
                     <p className="mt-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
                        Selecione a instituição bancária
                     </p>
                     <Select
                        id="banco_select"
                        value={formData.codigo_banco}
                        onChange={handleBancoSelect}
                        color={
                           errors.codigo_banco || errors.banco
                              ? "failure"
                              : "gray"
                        }
                     >
                        <option value="">Selecione um banco...</option>
                        {BANCOS_BRASILEIROS.map((banco) => (
                           <option key={banco.codigo} value={banco.codigo}>
                              {banco.codigo} - {banco.nome}
                           </option>
                        ))}
                     </Select>
                     {(errors.banco || errors.codigo_banco) && (
                        <p className="mt-1 text-sm text-red-600">
                           {errors.banco || errors.codigo_banco}
                        </p>
                     )}
                  </div>

                  {/* Agência e Conta */}
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <Label htmlFor="agencia">Agência *</Label>
                        <TextInput
                           id="agencia"
                           name="agencia"
                           value={formData.agencia}
                           onChange={handleChange}
                           placeholder="0000"
                           color={errors.agencia ? "failure" : "gray"}
                        />
                        {errors.agencia && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.agencia}
                           </p>
                        )}
                     </div>
                     <div>
                        <Label htmlFor="conta">Conta Corrente *</Label>
                        <TextInput
                           id="conta"
                           name="conta"
                           value={formData.conta}
                           onChange={handleChange}
                           placeholder="00000-0"
                           color={errors.conta ? "failure" : "gray"}
                        />
                        {errors.conta && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.conta}
                           </p>
                        )}
                     </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-gray-700" />

                  {/* Mês/Ano de referência */}
                  <div>
                     <Label htmlFor="mes_ano_mes">Mês/Ano de referência</Label>
                     <p className="mt-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
                        Mês a que os valores de remuneração e auxílio transporte
                        se referem
                     </p>
                     {/* No celular o botão desce para a linha de baixo: lado a
                         lado, o select do mês ficava com ~40px. */}
                     <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="flex min-w-0 flex-1 gap-2">
                           <MesAnoPicker
                              value={formData.mes_ano}
                              onChange={setMesAno}
                              error={!!errors.mes_ano}
                           />
                        </div>
                        {/* sm:h-auto: o h-10 do Button (35px) ficava 1,6px
                            abaixo dos selects (36,6px); sem ele, estica na
                            linha. */}
                        <Button
                           color="light"
                           className="shrink-0 sm:h-auto"
                           onClick={handleSyncPortal}
                           disabled={isSyncing || isLoading}
                           aria-busy={isSyncing}
                           title="Buscar remuneração no Portal da Transparência"
                        >
                           {isSyncing ? (
                              <Spinner
                                 size="sm"
                                 color="primary"
                                 className="mr-2"
                              />
                           ) : (
                              <HiCloudDownload className="mr-2 h-4 w-4" />
                           )}
                           {isSyncing ? "Buscando…" : "Buscar no Portal"}
                        </Button>
                     </div>
                     {errors.mes_ano && (
                        <p className="mt-1 text-sm text-red-600">
                           {errors.mes_ano}
                        </p>
                     )}
                  </div>

                  {/* Remuneração e Auxílio Transporte */}
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <Label htmlFor="remuneracao">Remuneração (R$)</Label>
                        <TextInput
                           id="remuneracao"
                           name="remuneracao"
                           type="number"
                           step="0.01"
                           min="0"
                           value={formData.remuneracao}
                           onChange={handleChange}
                           placeholder="0,00"
                           color={errors.remuneracao ? "failure" : "gray"}
                        />
                        {errors.remuneracao ? (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.remuneracao}
                           </p>
                        ) : (
                           formData.remuneracao !== "" && (
                              <p className="mt-1 text-xs text-slate-500 tabular-nums">
                                 = {realCurrency(Number(formData.remuneracao))}
                              </p>
                           )
                        )}
                     </div>
                     <div>
                        <Label htmlFor="aux_transp">
                           Auxílio Transporte (R$)
                        </Label>
                        <TextInput
                           id="aux_transp"
                           name="aux_transp"
                           type="number"
                           step="0.01"
                           min="0"
                           value={formData.aux_transp}
                           onChange={handleChange}
                           placeholder="0,00"
                           color={errors.aux_transp ? "failure" : "gray"}
                        />
                        {errors.aux_transp ? (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.aux_transp}
                           </p>
                        ) : (
                           formData.aux_transp !== "" && (
                              <p className="mt-1 text-xs text-slate-500 tabular-nums">
                                 = {realCurrency(Number(formData.aux_transp))}
                              </p>
                           )
                        )}
                     </div>
                  </div>
               </fieldset>
            </ModalBody>
            <ModalFooter>
               <div className="flex w-full justify-between">
                  <div>
                     {isEdit && (
                        <PermBased
                           resource="cegep.dados_bancarios"
                           requiredPerm="delete"
                        >
                           {/* Contorno com texto vermelho: na 11GT a marca é
                               vermelha e o "Atualizar" (primary) ficava idêntico
                               a um Deletar preenchido. */}
                           <Button
                              color="light"
                              className="text-red-700 hover:bg-red-50"
                              onClick={() => setShowDeleteConfirm(true)}
                              disabled={isLoading}
                           >
                              <HiTrash className="mr-2 h-4 w-4" />
                              Deletar
                           </Button>
                        </PermBased>
                     )}
                  </div>
                  <div className="flex gap-2">
                     <Button
                        color="gray"
                        onClick={onClose}
                        disabled={isLoading}
                     >
                        {canSave ? "Cancelar" : "Fechar"}
                     </Button>
                     <PermBased
                        resource="cegep.dados_bancarios"
                        requiredPerm={isEdit ? "update" : "create"}
                     >
                        <Button
                           color="primary"
                           onClick={save}
                           disabled={isLoading}
                           aria-busy={isLoading}
                        >
                           {isLoading ? (
                              <>
                                 <Spinner
                                    size="sm"
                                    color="white"
                                    className="mr-2"
                                 />
                                 Salvando…
                              </>
                           ) : isEdit ? (
                              "Atualizar"
                           ) : (
                              "Cadastrar"
                           )}
                        </Button>
                     </PermBased>
                  </div>
               </div>
            </ModalFooter>
         </Modal>

         <ConfirmModal
            show={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleConfirmDelete}
            title="Confirmar Exclusão"
            description={
               <>
                  Tem certeza que deseja deletar os dados bancários de{" "}
                  <strong className="uppercase">
                     {selectedUser?.posto.short} {selectedUser?.nome_guerra}
                  </strong>
                  ? Esta ação não pode ser desfeita.
               </>
            }
            confirmButtonText="Deletar"
            confirmButtonColor="red"
            isLoading={isDeleting}
         />
      </>
   );
}
