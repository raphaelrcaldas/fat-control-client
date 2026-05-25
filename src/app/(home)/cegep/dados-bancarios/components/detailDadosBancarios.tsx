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
import { DadosBancariosWithUser } from "services/routes/cegep/dadosBancarios";
import { UserPublic } from "services/routes/users";
import { SearchUser } from "@/app/(home)/users/components/searchUser";
import { useToast } from "@/app/context/toast";
import { HiCloudDownload, HiTrash, HiUser } from "react-icons/hi";
import {
   useCreateDadosBancarios,
   useUpdateDadosBancarios,
   useDeleteDadosBancarios,
   useSyncRemuneracaoPortal,
} from "@/hooks/queries";
import {
   isoToMonthInput,
   monthInputToIso,
   previousMonthInput,
} from "@/../utils/dateHandler";

const MESES_PT = [
   "Janeiro",
   "Fevereiro",
   "Março",
   "Abril",
   "Maio",
   "Junho",
   "Julho",
   "Agosto",
   "Setembro",
   "Outubro",
   "Novembro",
   "Dezembro",
];

const ANOS_RANGE = (() => {
   const atual = new Date().getFullYear();
   return Array.from({ length: 6 }, (_, i) => atual - i);
})();

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
}

export default function DetailDadosBancarios({
   show,
   onClose,
   dados,
}: DetailDadosBancariosProps) {
   const { push } = useToast();
   const isEdit = !!dados;

   // Mutations
   const createMutation = useCreateDadosBancarios();
   const updateMutation = useUpdateDadosBancarios();
   const deleteMutation = useDeleteDadosBancarios();
   const syncMutation = useSyncRemuneracaoPortal();

   const isLoading = createMutation.isPending || updateMutation.isPending;
   const isDeleting = deleteMutation.isPending;
   const isSyncing = syncMutation.isPending;

   // Estado do formulário
   const [selectedUser, setSelectedUser] = useState<UserPublic | null>(
      dados?.user || null
   );
   const [showUserSearch, setShowUserSearch] = useState(false);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

   const [formData, setFormData] = useState({
      banco: dados?.banco || "",
      codigo_banco: dados?.codigo_banco || "",
      agencia: dados?.agencia || "",
      conta: dados?.conta || "",
      remuneracao: dados?.remuneracao != null ? String(dados.remuneracao) : "",
      mes_ano: dados?.mes_ano
         ? isoToMonthInput(dados.mes_ano)
         : previousMonthInput(),
      aux_transp: dados?.aux_transp != null ? String(dados.aux_transp) : "",
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
               remuneracao:
                  dados.remuneracao != null ? String(dados.remuneracao) : "",
               mes_ano: dados.mes_ano
                  ? isoToMonthInput(dados.mes_ano)
                  : previousMonthInput(),
               aux_transp:
                  dados.aux_transp != null ? String(dados.aux_transp) : "",
            });
         } else {
            setSelectedUser(null);
            setFormData({
               banco: "",
               codigo_banco: "",
               agencia: "",
               conta: "",
               remuneracao: "",
               mes_ano: previousMonthInput(),
               aux_transp: "",
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

      // Remuneração e aux_transp são opcionais — só validar se preenchidos
      if (formData.remuneracao !== "") {
         const remuneracaoNum = Number(formData.remuneracao);
         if (Number.isNaN(remuneracaoNum) || remuneracaoNum < 0) {
            newErrors.remuneracao = "Remuneração inválida";
         }
      }

      if (formData.aux_transp !== "") {
         const auxTranspNum = Number(formData.aux_transp);
         if (Number.isNaN(auxTranspNum) || auxTranspNum < 0) {
            newErrors.aux_transp = "Auxílio transporte inválido";
         }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
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

         setFormData((prev) => ({
            ...prev,
            remuneracao: String(valor),
         }));

         push({
            message: `Remuneração bruta de R$ ${valor.toLocaleString("pt-BR", {
               minimumFractionDigits: 2,
            })} preenchida. Revise e clique em Atualizar para salvar.`,
            type: "success",
         });
      } catch (err: any) {
         push({
            title: "Erro Portal da Transparência",
            message: err?.message || "Falha ao consultar o Portal",
            type: "error",
         });
      }
   };

   const handleSave = async () => {
      if (!validateForm()) return;

      try {
         const remuneracao =
            formData.remuneracao === "" ? null : Number(formData.remuneracao);
         const aux_transp =
            formData.aux_transp === "" ? null : Number(formData.aux_transp);
         const mes_ano = formData.mes_ano
            ? monthInputToIso(formData.mes_ano)
            : null;

         if (isEdit) {
            await updateMutation.mutateAsync({
               id: dados.id,
               data: {
                  banco: formData.banco,
                  codigo_banco: formData.codigo_banco,
                  agencia: formData.agencia,
                  conta: formData.conta,
                  remuneracao,
                  mes_ano,
                  aux_transp,
               },
            });
         } else {
            if (!selectedUser) return;

            await createMutation.mutateAsync({
               user_id: selectedUser.id,
               banco: formData.banco,
               codigo_banco: formData.codigo_banco,
               agencia: formData.agencia,
               conta: formData.conta,
               remuneracao,
               mes_ano,
               aux_transp,
            });
         }

         push({
            message: isEdit
               ? "Dados bancários atualizados com sucesso"
               : "Dados bancários cadastrados com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: any) {
         push({
            title: "Erro",
            message: err?.message || "Erro ao salvar dados bancários",
            type: "error",
         });
      }
   };

   const handleDelete = async () => {
      if (!dados?.id) return;

      try {
         await deleteMutation.mutateAsync(dados.id);
         push({
            message: "Dados bancários deletados com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: any) {
         push({
            title: "Erro",
            message: err?.message || "Erro ao deletar dados bancários",
            type: "error",
         });
      } finally {
         setShowDeleteConfirm(false);
      }
   };

   return (
      <>
         <Modal show={show} onClose={onClose} size="lg" dismissible>
            <ModalHeader>
               {isEdit ? "Editar Dados Bancários" : "Cadastrar Dados Bancários"}
            </ModalHeader>
            <ModalBody>
               <div className="space-y-6">
                  {/* Seleção de Usuário (apenas para criação) */}
                  {!isEdit && (
                     <div>
                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                           Selecione o militar que terá os dados bancários
                           cadastrados
                        </p>
                        {selectedUser ? (
                           <div className="mt-2 flex items-center justify-between rounded-lg border bg-gray-50 p-3 dark:bg-gray-700">
                              <div className="uppercase">
                                 <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {selectedUser.posto.short}{" "}
                                    {selectedUser.nome_guerra}
                                 </p>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {selectedUser.nome_completo}
                                 </p>
                              </div>
                              <Button
                                 size="xs"
                                 color="gray"
                                 onClick={() => setSelectedUser(null)}
                              >
                                 Alterar
                              </Button>
                           </div>
                        ) : (
                           <>
                              <Button
                                 color="red"
                                 className="mt-2 w-full"
                                 onClick={() => setShowUserSearch(true)}
                              >
                                 <HiUser className="mr-2" />
                                 Selecionar Usuário
                              </Button>
                              {errors.user && (
                                 <p className="mt-1 text-sm text-red-600">
                                    {errors.user}
                                 </p>
                              )}
                           </>
                        )}
                     </div>
                  )}

                  {/* Exibir usuário (apenas para edição) */}
                  {isEdit && selectedUser && (
                     <div className="mt-2 rounded-lg border bg-gray-50 p-3 uppercase dark:bg-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                           {selectedUser.posto.short} {selectedUser.nome_guerra}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                           {selectedUser.nome_completo}
                        </p>
                     </div>
                  )}

                  {/* Divisor */}
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>

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

                  {/* Divisor */}
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>

                  {/* Mês/Ano de referência */}
                  <div>
                     <Label htmlFor="mes_ano">Mês/Ano de referência</Label>
                     <p className="mt-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
                        Mês a que os valores de remuneração e auxílio transporte
                        se referem
                     </p>
                     <div className="flex items-end gap-2">
                        <Select
                           id="mes_ano_mes"
                           value={formData.mes_ano.split("-")[1] || ""}
                           onChange={(e) => {
                              const mes = e.target.value;
                              const ano =
                                 formData.mes_ano.split("-")[0] ||
                                 String(new Date().getFullYear());
                              setFormData((prev) => ({
                                 ...prev,
                                 mes_ano: mes ? `${ano}-${mes}` : "",
                              }));
                              if (errors.mes_ano)
                                 setErrors((prev) => ({
                                    ...prev,
                                    mes_ano: "",
                                 }));
                           }}
                           color={errors.mes_ano ? "failure" : "gray"}
                           className="flex-1"
                        >
                           <option value="">Mês</option>
                           {MESES_PT.map((nome, i) => (
                              <option
                                 key={i}
                                 value={String(i + 1).padStart(2, "0")}
                              >
                                 {nome}
                              </option>
                           ))}
                        </Select>
                        <Select
                           id="mes_ano_ano"
                           value={formData.mes_ano.split("-")[0] || ""}
                           onChange={(e) => {
                              const ano = e.target.value;
                              const mes = formData.mes_ano.split("-")[1] || "";
                              setFormData((prev) => ({
                                 ...prev,
                                 mes_ano: ano && mes ? `${ano}-${mes}` : "",
                              }));
                              if (errors.mes_ano)
                                 setErrors((prev) => ({
                                    ...prev,
                                    mes_ano: "",
                                 }));
                           }}
                           color={errors.mes_ano ? "failure" : "gray"}
                           className="w-28"
                        >
                           <option value="">Ano</option>
                           {ANOS_RANGE.map((ano) => (
                              <option key={ano} value={ano}>
                                 {ano}
                              </option>
                           ))}
                        </Select>
                        <Button
                           color="blue"
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
                        <Button
                           color="red"
                           onClick={() => setShowDeleteConfirm(true)}
                           disabled={isLoading}
                        >
                           <HiTrash className="mr-2" />
                           Deletar
                        </Button>
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
                     <Button
                        color="blue"
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
            size="md"
         >
            <ModalHeader>Confirmar Exclusão</ModalHeader>
            <ModalBody>
               <p className="text-gray-700 dark:text-gray-300">
                  Tem certeza que deseja deletar os dados bancários de{" "}
                  <strong className="uppercase">
                     {selectedUser?.posto.short} {selectedUser?.nome_guerra}
                  </strong>
                  ?
               </p>
               <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Esta ação não pode ser desfeita.
               </p>
            </ModalBody>
            <ModalFooter>
               <Button
                  color="gray"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
               >
                  Cancelar
               </Button>
               <Button color="red" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deletando..." : "Deletar"}
               </Button>
            </ModalFooter>
         </Modal>
      </>
   );
}
