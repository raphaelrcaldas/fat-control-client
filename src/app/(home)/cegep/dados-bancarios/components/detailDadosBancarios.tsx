import { useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   TextInput,
   Select,
} from "flowbite-react";
import { HiCloudDownload, HiTrash } from "react-icons/hi";
import { DadosBancariosWithUser } from "services/routes/cegep/dadosBancarios";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
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

   const handleConfirmDelete = async () => {
      await remove();
      setShowDeleteConfirm(false);
   };

   return (
      <>
         <Modal show={show} onClose={onClose} size="lg" dismissible>
            <ModalHeader>
               {isEdit ? "Editar Dados Bancários" : "Cadastrar Dados Bancários"}
            </ModalHeader>
            <ModalBody>
               <div className="space-y-6">
                  <UserSelector
                     value={selectedUser}
                     onChange={setSelectedUser}
                     readOnly={isEdit}
                     error={errors.user}
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
                        <Label htmlFor="agencia" className="text-xs">
                           Agência
                        </Label>
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
                        <Label htmlFor="conta" className="text-xs">
                           Conta Corrente
                        </Label>
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
                     <div className="flex items-end gap-2">
                        <MesAnoPicker
                           value={formData.mes_ano}
                           onChange={setMesAno}
                           error={!!errors.mes_ano}
                        />
                        <Button
                           color="light"
                           size="sm"
                           onClick={handleSyncPortal}
                           disabled={isSyncing || isLoading}
                           title="Buscar remuneração no Portal da Transparência"
                        >
                           <HiCloudDownload className="mr-2 h-4 w-4" />
                           {isSyncing ? "Buscando..." : "Buscar no Portal"}
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
                        <Label htmlFor="remuneracao" className="text-xs">
                           Remuneração (R$)
                        </Label>
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
                        {errors.remuneracao && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.remuneracao}
                           </p>
                        )}
                     </div>
                     <div>
                        <Label htmlFor="aux_transp" className="text-xs">
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
                        {errors.aux_transp && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.aux_transp}
                           </p>
                        )}
                     </div>
                  </div>
               </div>
            </ModalBody>
            <ModalFooter>
               <div className="flex w-full justify-between">
                  <div>
                     {isEdit && (
                        <PermBased
                           resource="dados_bancarios"
                           requiredPerm="delete"
                        >
                           <Button
                              color="red"
                              onClick={() => setShowDeleteConfirm(true)}
                              disabled={isLoading}
                           >
                              <HiTrash className="mr-2" />
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
                        Cancelar
                     </Button>
                     <PermBased
                        resource="dados_bancarios"
                        requiredPerm={isEdit ? "update" : "create"}
                     >
                        <Button
                           color="primary"
                           onClick={save}
                           disabled={isLoading}
                        >
                           {isLoading
                              ? "Salvando..."
                              : isEdit
                                ? "Atualizar"
                                : "Cadastrar"}
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
            message={
               <>
                  Tem certeza que deseja deletar os dados bancários de{" "}
                  <strong className="uppercase">
                     {selectedUser?.posto.short} {selectedUser?.nome_guerra}
                  </strong>
                  ? Esta ação não pode ser desfeita.
               </>
            }
            confirmLabel="Deletar"
            confirmColor="red"
            isLoading={isDeleting}
         />
      </>
   );
}
