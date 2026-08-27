"use client";

import { useState, useEffect, useRef } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   TextInput,
   Tabs,
   TabItem,
} from "flowbite-react";
import { HiPhone, HiTrash } from "react-icons/hi";
import { useToast } from "@/app/context/toast";
import {
   useCreateCartaoSaude,
   useUpdateCartaoSaude,
   useDeleteCartaoSaude,
} from "@/hooks/queries";
import {
   UserCartaoSaude,
   CartaoSaudeCreate,
   CartaoSaudeUpdate,
} from "services/routes/aeromedica/cartoesSaude";
import { formatPhone, formatSaram } from "@/constants/formats";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import DateField from "./DateField";
import AtasTab from "./AtasTab";
import HistoricoTab from "./HistoricoTab";

// A ordem é a das abas: o Flowbite entrega o índice no onActiveTabChange.
const TAB_KEYS = ["dados", "atas", "historico"] as const;
type TabKey = (typeof TAB_KEYS)[number];

interface EditCartaoDrawerProps {
   show: boolean;
   onClose: () => void;
   item: UserCartaoSaude;
}

export default function EditCartaoDrawer({
   show,
   onClose,
   item,
}: EditCartaoDrawerProps) {
   const { push } = useToast();
   const isEdit = !!item.cartao;

   // O backend gateia cada escrita por ação (create/update/delete de
   // 'aeromedica.cartoes'); aqui só escondemos o que ele recusaria — quem
   // tem apenas 'view' abre o cartão em leitura.
   const { hasPerm } = usePermBased();
   const canSave = hasPerm("aeromedica.cartoes", isEdit ? "update" : "create");
   const canDelete = hasPerm("aeromedica.cartoes", "delete");

   const createMutation = useCreateCartaoSaude();
   const updateMutation = useUpdateCartaoSaude();
   const deleteMutation = useDeleteCartaoSaude();

   const isLoading = createMutation.isPending || updateMutation.isPending;
   const isDeleting = deleteMutation.isPending;

   const [activeTab, setActiveTab] = useState<TabKey>("dados");
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

   const [formData, setFormData] = useState({
      prontuario: item.cartao?.prontuario || "",
      cemal: item.cartao?.cemal || "",
      tovn: item.cartao?.tovn || "",
      imae: item.cartao?.imae || "",
   });

   // Flowbite Tabs e nao-controlado (le `active` apenas no mount). Resetamos a
   // aba para "dados" de forma SINCRONA ao (re)abrir o drawer ou trocar de
   // militar, antes do render dos tabs, para que o footer (que depende de
   // activeTab) e a aba visivel nao dessincronizem.
   const openKeyRef = useRef<string | null>(null);
   const openKey = show ? String(item.user.id) : null;
   if (openKey !== openKeyRef.current) {
      openKeyRef.current = openKey;
      if (show && activeTab !== "dados") setActiveTab("dados");
   }

   useEffect(() => {
      if (show) {
         setFormData({
            prontuario: item.cartao?.prontuario || "",
            cemal: item.cartao?.cemal || "",
            tovn: item.cartao?.tovn || "",
            imae: item.cartao?.imae || "",
         });
         setShowDeleteConfirm(false);
      }
      // Depende de user.id (nao do objeto item inteiro) para que uma
      // invalidacao de cache nao resete o form enquanto o drawer esta aberto.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [show, item.user.id]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSave = async () => {
      try {
         if (isEdit && item.cartao) {
            const updateData: CartaoSaudeUpdate = {
               prontuario: formData.prontuario || null,
               cemal: formData.cemal || null,
               tovn: formData.tovn || null,
               imae: formData.imae || null,
            };

            await updateMutation.mutateAsync({
               id: item.cartao.id,
               data: updateData,
            });
         } else {
            const createData: CartaoSaudeCreate = {
               user_id: item.user.id,
               prontuario: formData.prontuario || null,
               cemal: formData.cemal || null,
               tovn: formData.tovn || null,
               imae: formData.imae || null,
            };

            await createMutation.mutateAsync(createData);
         }

         push({
            message: isEdit
               ? "Cartão de saúde atualizado com sucesso"
               : "Cartão de saúde cadastrado com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error
               ? err.message
               : "Erro ao salvar cartão de saúde";

         // Race: anexar uma ata (aba Atas) já cria o cartão no servidor.
         // Se o usuário clicar "Cadastrar" antes do refetch atualizar o
         // item para modo edição, o backend responde 400 de duplicata.
         // Tratamos como aviso (o cartão existe) e fechamos — reabrir já
         // mostra o cartão em modo edição.
         if (!isEdit && /já existe|ja existe/i.test(message)) {
            push({
               message:
                  "O cartão já foi criado ao anexar a ata. Reabra para" +
                  " editar os demais campos.",
               type: "info",
            });
            onClose();
            return;
         }

         push({ title: "Erro", message, type: "error" });
      }
   };

   const handleDelete = async () => {
      if (!item.cartao?.id) return;

      try {
         await deleteMutation.mutateAsync(item.cartao.id);
         push({
            message: "Cartão de saúde deletado com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error
               ? err.message
               : "Erro ao deletar cartão de saúde";
         push({ title: "Erro", message, type: "error" });
      } finally {
         setShowDeleteConfirm(false);
      }
   };

   return (
      <>
         {/* Ancorado no topo (o default do Flowbite é centralizar): as abas
             têm alturas diferentes e, centralizado, trocar de aba
             arrastava a janela inteira para cima sob o cursor. Preso no topo,
             só a borda de baixo se move. */}
         <Modal
            show={show}
            onClose={onClose}
            size="lg"
            dismissible
            position="top-center"
            className="py-8"
         >
            <ModalHeader>
               {!canSave
                  ? "Cartão de Saúde"
                  : isEdit
                    ? "Editar Cartão de Saúde"
                    : "Cadastrar Cartão de Saúde"}
            </ModalHeader>
            <ModalBody>
               {/* min-h (e não h-140 cravado): a altura fixa deixava 378px de
                   vazio na aba Atas, cortava o último campo no mobile e fazia
                   a janela pular 39px a cada troca de aba. */}
               <div className="min-h-96 space-y-4">
                  {/* Informações do militar */}
                  <MilitarInfo item={item} />

                  {/* Tabs */}
                  <Tabs
                     aria-label="Seções do cartão de saúde"
                     variant="underline"
                     onActiveTabChange={(idx) =>
                        setActiveTab(TAB_KEYS[idx] ?? "dados")
                     }
                  >
                     <TabItem active={activeTab === "dados"} title="Dados">
                        <DadosTab
                           item={item}
                           formData={formData}
                           onChange={handleChange}
                           readOnly={!canSave}
                           canDelete={canDelete}
                        />
                     </TabItem>
                     <TabItem active={activeTab === "atas"} title="Atas">
                        {/* Mantém o fetch de atas lazy: só monta quando a aba está ativa */}
                        {activeTab === "atas" && (
                           <AtasTab
                              userId={item.user.id}
                              onCemalUpdated={(cemal) =>
                                 setFormData((prev) => ({ ...prev, cemal }))
                              }
                           />
                        )}
                     </TabItem>
                     <TabItem
                        active={activeTab === "historico"}
                        title="Histórico"
                     >
                        {/* Mesma razão da aba Atas: a trilha de auditoria só
                            é buscada quando alguém a abre — é dado de saúde,
                            não se puxa por precaução. */}
                        {activeTab === "historico" && (
                           <HistoricoTab userId={item.user.id} />
                        )}
                     </TabItem>
                  </Tabs>
               </div>
            </ModalBody>
            {/* Sempre montado: gateado por aba, o rodapé sumia na aba Atas —
                a saída mudava de lugar e a altura do modal oscilava. */}
            <ModalFooter>
               {activeTab === "dados" ? (
                  <div className="flex w-full justify-between">
                     <div>
                        {/* Destrutivo não precisa ser o botão mais chamativo:
                            a confirmação em modal já segura o gatilho. */}
                        {isEdit && canDelete && (
                           <Button
                              color="light"
                              onClick={() => setShowDeleteConfirm(true)}
                              disabled={isLoading}
                           >
                              <span className="flex items-center text-red-700">
                                 <HiTrash className="mr-2" />
                                 Deletar
                              </span>
                           </Button>
                        )}
                     </div>
                     <div className="flex gap-2">
                        <Button
                           color="light"
                           onClick={onClose}
                           disabled={isLoading}
                        >
                           {canSave ? "Cancelar" : "Fechar"}
                        </Button>
                        {canSave && (
                           <Button
                              color="primary"
                              onClick={handleSave}
                              disabled={isLoading}
                           >
                              {isLoading
                                 ? "Salvando..."
                                 : isEdit
                                   ? "Atualizar"
                                   : "Cadastrar"}
                           </Button>
                        )}
                     </div>
                  </div>
               ) : (
                  <div className="flex w-full justify-end">
                     <Button color="light" onClick={onClose}>
                        Fechar
                     </Button>
                  </div>
               )}
            </ModalFooter>
         </Modal>

         {/* Modal de confirmação de deleção — sob o mesmo gate do gatilho,
             para a exclusão não depender de invariante implícita do estado. */}
         {canDelete && (
            <Modal
               show={showDeleteConfirm}
               onClose={() => setShowDeleteConfirm(false)}
               size="md"
            >
               <ModalHeader>Confirmar Exclusão</ModalHeader>
               <ModalBody>
                  <p className="text-gray-700 dark:text-gray-300">
                     Tem certeza que deseja deletar o cartão de saúde de{" "}
                     <strong className="uppercase">
                        {item.user.posto.short} {item.user.nome_guerra}
                     </strong>
                     ?
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                     Esta ação não pode ser desfeita.
                  </p>
               </ModalBody>
               <ModalFooter>
                  <Button
                     color="light"
                     onClick={() => setShowDeleteConfirm(false)}
                     disabled={isDeleting}
                  >
                     Cancelar
                  </Button>
                  <Button
                     color="red"
                     onClick={handleDelete}
                     disabled={isDeleting}
                  >
                     {isDeleting ? "Deletando..." : "Deletar"}
                  </Button>
               </ModalFooter>
            </Modal>
         )}
      </>
   );
}

// ========================================
// Sub-components
// ========================================

function MilitarInfo({ item }: { item: UserCartaoSaude }) {
   return (
      <div className="rounded border border-slate-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
         <p className="text-sm font-semibold text-gray-900 uppercase dark:text-white">
            {item.user.posto.mid} {item.user.nome_guerra}
         </p>
         <p className="mt-2 text-sm text-gray-500 uppercase dark:text-gray-400">
            {item.user.nome_completo}
         </p>
         <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            {item.user.saram && (
               <span>SARAM: {formatSaram(item.user.saram)}</span>
            )}
            {item.user.telefone && (
               <span className="inline-flex items-center gap-1">
                  <HiPhone className="h-3.5 w-3.5" />
                  {formatPhone(item.user.telefone)}
               </span>
            )}
         </div>
      </div>
   );
}

function DadosTab({
   item,
   formData,
   onChange,
   readOnly,
   canDelete,
}: {
   item: UserCartaoSaude;
   formData: Record<string, string>;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   readOnly: boolean;
   canDelete: boolean;
}) {
   // Sem cartão e sem permissão de criar: um formulário inteiro desabilitado
   // não diz nada — o que há para saber é que o militar não tem cartão.
   if (readOnly && !item.cartao) {
      return (
         <div className="flex flex-col items-center rounded border border-dashed border-slate-300 px-4 py-8 text-center dark:border-gray-600">
            <p className="font-medium text-gray-600 dark:text-gray-300">
               Nenhum cartão de saúde cadastrado
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
               Você não tem permissão para cadastrar cartões de saúde.
            </p>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Prontuário */}
         <div>
            <Label htmlFor="prontuario">Nº do Prontuário</Label>
            <div className="mt-1">
               <TextInput
                  id="prontuario"
                  name="prontuario"
                  type="text"
                  placeholder="Ex: 12345"
                  value={formData.prontuario}
                  onChange={onChange}
                  maxLength={20}
                  disabled={readOnly}
               />
            </div>
         </div>

         {/* Datas de validade */}
         <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
               Datas de validade
            </h4>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
               Vencimento de cada inspeção — não a data de realização.
            </p>
         </div>

         {/* Campos de data */}
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
               <DateField
                  label="Inspeção de Saúde (CEMAL)"
                  name="cemal"
                  value={formData.cemal}
                  onChange={onChange}
                  disabled={readOnly}
               />
               {item.cemal_tem_ata === false && (
                  <p className="mt-1 text-xs font-medium text-amber-700">
                     Sem ata anexada
                  </p>
               )}
               {/* "Considere excluir" só para quem pode excluir; aos demais
                   o número é informação, não chamada para ação — daí o tom
                   neutro em vez do azul de recomendação. */}
               {item.total_atas > 1 &&
                  (canDelete ? (
                     <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {item.total_atas} atas anexadas — considere excluir as
                        antigas
                     </p>
                  ) : (
                     <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {item.total_atas} atas anexadas
                     </p>
                  ))}
            </div>
            <DateField
               label="Visão Noturna (TOVN)"
               name="tovn"
               value={formData.tovn}
               onChange={onChange}
               disabled={readOnly}
            />
            <DateField
               label="IMAE"
               name="imae"
               value={formData.imae}
               onChange={onChange}
               disabled={readOnly}
            />
         </div>
      </div>
   );
}
