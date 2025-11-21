import { useState, useEffect } from "react";
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
import {
   DadosBancariosWithUser,
   DadosBancariosCreate,
   DadosBancariosUpdate,
   createDadosBancarios,
   updateDadosBancarios,
   deleteDadosBancarios,
} from "services/routes/cegep/dadosBancarios";
import { UserPublic } from "services/routes/users";
import { SearchUser } from "@/app/(home)/users/components/searchUser";
import { useToast } from "@/app/context/toast";
import { HiTrash, HiUser } from "react-icons/hi";

// Lista dos principais bancos brasileiros
const BANCOS_BRASILEIROS = [
   { codigo: "001", nome: "Banco do Brasil" },
   { codigo: "033", nome: "Santander" },
   { codigo: "104", nome: "Caixa Econômica Federal" },
   { codigo: "237", nome: "Bradesco" },
   { codigo: "341", nome: "Itaú Unibanco" },
   { codigo: "077", nome: "Banco Inter" },
   { codigo: "260", nome: "Nubank" },
   { codigo: "290", nome: "PagSeguro" },
   { codigo: "323", nome: "Mercado Pago" },
   { codigo: "380", nome: "PicPay" },
].sort((a, b) => a.codigo.localeCompare(b.codigo));

interface DetailDadosBancariosProps {
   show: boolean;
   onClose: () => void;
   dados?: DadosBancariosWithUser;
   update?: () => void;
}

export default function DetailDadosBancarios({
   show,
   onClose,
   dados,
   update,
}: DetailDadosBancariosProps) {
   const { push } = useToast();
   const isEdit = !!dados;

   // Estado do formulário
   const [selectedUser, setSelectedUser] = useState<UserPublic | null>(
      dados?.user || null
   );
   const [showUserSearch, setShowUserSearch] = useState(false);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);

   const [formData, setFormData] = useState({
      banco: dados?.banco || "",
      codigo_banco: dados?.codigo_banco || "",
      agencia: dados?.agencia || "",
      conta: dados?.conta || "",
   });

   const [errors, setErrors] = useState<Record<string, string>>({});

   // Resetar formulário quando o modal abrir/fechar
   useEffect(() => {
      if (show) {
         if (dados) {
            setSelectedUser(dados.user);
            setFormData({
               banco: dados.banco,
               codigo_banco: dados.codigo_banco,
               agencia: dados.agencia,
               conta: dados.conta,
            });
         } else {
            setSelectedUser(null);
            setFormData({
               banco: "",
               codigo_banco: "",
               agencia: "",
               conta: "",
            });
         }
         setErrors({});
      }
   }, [show, dados]);

   const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Limpar erro do campo quando o usuário começar a digitar
      if (errors[name]) {
         setErrors((prev) => ({ ...prev, [name]: "" }));
      }
   };

   const handleBancoSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const codigo = e.target.value;
      if (codigo) {
         const bancoSelecionado = BANCOS_BRASILEIROS.find(
            (b) => b.codigo === codigo
         );
         if (bancoSelecionado) {
            setFormData((prev) => ({
               ...prev,
               codigo_banco: bancoSelecionado.codigo,
               banco: bancoSelecionado.nome,
            }));
            // Limpar erros
            setErrors((prev) => {
               const newErrors = { ...prev };
               delete newErrors.codigo_banco;
               delete newErrors.banco;
               return newErrors;
            });
         }
      }
   };

   const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!isEdit && !selectedUser) {
         newErrors.user = "Selecione um usuário";
      }

      if (!formData.banco.trim()) {
         newErrors.banco = "Banco é obrigatório";
      }

      if (!formData.codigo_banco.trim()) {
         newErrors.codigo_banco = "Código do banco é obrigatório";
      }

      if (!formData.agencia.trim()) {
         newErrors.agencia = "Agência é obrigatória";
      }

      if (!formData.conta.trim()) {
         newErrors.conta = "Conta é obrigatória";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSave = async () => {
      if (!validateForm()) return;

      setIsLoading(true);
      try {
         let response: Response;

         if (isEdit) {
            // Atualizar
            const updateData: DadosBancariosUpdate = {
               banco: formData.banco,
               codigo_banco: formData.codigo_banco,
               agencia: formData.agencia,
               conta: formData.conta,
            };
            response = await updateDadosBancarios(dados.id, updateData);
         } else {
            // Criar
            if (!selectedUser) return;

            const createData: DadosBancariosCreate = {
               user_id: selectedUser.id,
               banco: formData.banco,
               codigo_banco: formData.codigo_banco,
               agencia: formData.agencia,
               conta: formData.conta,
            };
            response = await createDadosBancarios(createData);
         }

         const data = await response.json();

         if (response.ok) {
            push({
               message: data.detail || "Salvo com sucesso",
               type: "success",
            });
            update?.();
            onClose();
         } else {
            push({
               title: "Erro",
               message: data.detail || "Erro ao salvar dados bancários",
               type: "error",
            });
         }
      } catch (err: any) {
         push({
            title: "Erro",
            message: err?.message || "Erro ao salvar dados bancários",
            type: "error",
         });
      } finally {
         setIsLoading(false);
      }
   };

   const handleDelete = async () => {
      if (!dados?.id) return;

      setIsDeleting(true);
      try {
         const response = await deleteDadosBancarios(dados.id);
         const data = await response.json();

         if (response.ok) {
            push({
               message: data.detail || "Dados bancários deletados com sucesso",
               type: "success",
            });
            update?.();
            onClose();
         } else {
            push({
               title: "Erro",
               message: data.detail || "Erro ao deletar dados bancários",
               type: "error",
            });
         }
      } catch (err: any) {
         push({
            title: "Erro",
            message: err?.message || "Erro ao deletar dados bancários",
            type: "error",
         });
      } finally {
         setIsDeleting(false);
         setShowDeleteConfirm(false);
      }
   };

   return (
      <>
         <Modal show={show} onClose={onClose} size='lg'>
            <ModalHeader>
               {isEdit ? "Editar Dados Bancários" : "Cadastrar Dados Bancários"}
            </ModalHeader>
            <ModalBody>
               <div className='space-y-6'>
                  {/* Descrição do Modal */}
                  <div className='bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800'>
                     <p className='text-sm text-red-800 dark:text-red-200'>
                        {isEdit
                           ? "Atualize as informações bancárias do militar. Apenas contas correntes são aceitas."
                           : "Cadastre os dados da conta corrente do militar para processamento de pagamentos."}
                     </p>
                  </div>

                  {/* Seleção de Usuário (apenas para criação) */}
                  {!isEdit && (
                     <div>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2'>
                           Selecione o militar que terá os dados bancários
                           cadastrados
                        </p>
                        {selectedUser ? (
                           <div className='mt-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-between'>
                              <div className='uppercase'>
                                 <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                                    {selectedUser.posto.short}{" "}
                                    {selectedUser.nome_guerra}
                                 </p>
                                 <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    {selectedUser.nome_completo}
                                 </p>
                              </div>
                              <Button
                                 size='xs'
                                 color='gray'
                                 onClick={() => setSelectedUser(null)}
                              >
                                 Alterar
                              </Button>
                           </div>
                        ) : (
                           <>
                              <Button
                                 color='red'
                                 className='mt-2 w-full'
                                 onClick={() => setShowUserSearch(true)}
                              >
                                 <HiUser className='mr-2' />
                                 Selecionar Usuário
                              </Button>
                              {errors.user && (
                                 <p className='mt-1 text-sm text-red-600'>
                                    {errors.user}
                                 </p>
                              )}
                           </>
                        )}
                     </div>
                  )}

                  {/* Exibir usuário (apenas para edição) */}
                  {isEdit && selectedUser && (
                     <div className='mt-2 p-3 uppercase border rounded-lg bg-gray-50 dark:bg-gray-700'>
                        <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                           {selectedUser.posto.short} {selectedUser.nome_guerra}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                           {selectedUser.nome_completo}
                        </p>
                     </div>
                  )}

                  {/* Divisor */}
                  <div className='border-t border-gray-200 dark:border-gray-700'></div>

                  {/* Seleção de Banco */}
                  <div>
                     <Label htmlFor='banco_select'>Banco *</Label>
                     <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2'>
                        Selecione a instituição bancária
                     </p>
                     <Select
                        id='banco_select'
                        value={formData.codigo_banco}
                        onChange={handleBancoSelect}
                        color={
                           errors.codigo_banco || errors.banco
                              ? "failure"
                              : "gray"
                        }
                     >
                        <option value=''>Selecione um banco...</option>
                        {BANCOS_BRASILEIROS.map((banco) => (
                           <option key={banco.codigo} value={banco.codigo}>
                              {banco.codigo} - {banco.nome}
                           </option>
                        ))}
                     </Select>
                     {(errors.banco || errors.codigo_banco) && (
                        <p className='mt-1 text-sm text-red-600'>
                           {errors.banco || errors.codigo_banco}
                        </p>
                     )}
                  </div>

                  {/* Agência e Conta */}
                  <div className='grid grid-cols-2 gap-4'>
                     <div>
                        <Label htmlFor='agencia' className='text-xs'>
                           Agência
                        </Label>
                        <TextInput
                           id='agencia'
                           name='agencia'
                           value={formData.agencia}
                           onChange={handleChange}
                           placeholder='0000'
                           color={errors.agencia ? "failure" : "gray"}
                           //   helperText={errors.agencia}
                        />
                     </div>
                     <div>
                        <Label htmlFor='conta' className='text-xs'>
                           Conta Corrente
                        </Label>
                        <TextInput
                           id='conta'
                           name='conta'
                           value={formData.conta}
                           onChange={handleChange}
                           placeholder='00000-0'
                           color={errors.conta ? "failure" : "gray"}
                           //   helperText={errors.conta}
                        />
                     </div>
                  </div>
               </div>
            </ModalBody>
            <ModalFooter>
               <div className='flex justify-between w-full'>
                  <div>
                     {isEdit && (
                        <Button
                           color='red'
                           onClick={() => setShowDeleteConfirm(true)}
                           disabled={isLoading}
                        >
                           <HiTrash className='mr-2' />
                           Deletar
                        </Button>
                     )}
                  </div>
                  <div className='flex gap-2'>
                     <Button
                        color='gray'
                        onClick={onClose}
                        disabled={isLoading}
                     >
                        Cancelar
                     </Button>
                     <Button
                        color='blue'
                        onClick={handleSave}
                        disabled={isLoading}
                     >
                        {isLoading
                           ? "Salvando..."
                           : isEdit
                           ? "Atualizar"
                           : "Cadastrar"}
                     </Button>
                  </div>
               </div>
            </ModalFooter>
         </Modal>

         {/* Modal de busca de usuário */}
         <SearchUser
            show={showUserSearch}
            setShow={setShowUserSearch}
            setUser={setSelectedUser}
         />

         {/* Modal de confirmação de deleção */}
         <Modal
            show={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            size='md'
         >
            <ModalHeader>Confirmar Exclusão</ModalHeader>
            <ModalBody>
               <p className='text-gray-700 dark:text-gray-300'>
                  Tem certeza que deseja deletar os dados bancários de{" "}
                  <strong className='uppercase'>
                     {selectedUser?.posto.short} {selectedUser?.nome_guerra}
                  </strong>
                  ?
               </p>
               <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                  Esta ação não pode ser desfeita.
               </p>
            </ModalBody>
            <ModalFooter>
               <Button
                  color='gray'
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
               >
                  Cancelar
               </Button>
               <Button color='red' onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deletando..." : "Deletar"}
               </Button>
            </ModalFooter>
         </Modal>
      </>
   );
}
