"use client";

import { useState } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Button,
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Label,
   TextInput,
   Spinner,
} from "flowbite-react";
import { FaPlus, FaPenToSquare, FaTrashCan, FaMagnifyingGlass, FaDatabase } from "react-icons/fa6";
import { useToast } from "@/app/context/toast";
import {
   useResources,
   useCreateResource,
   useUpdateResource,
   useDeleteResource,
} from "@/hooks/queries";
import type {
   Resource,
   ResourceCreate,
   ResourceUpdate,
} from "services/routes/security/resources";

interface FormData {
   name: string;
   description: string;
}

interface FormErrors {
   name?: string;
   description?: string;
}

export default function ResourcesTab() {
   const { push } = useToast();

   // Query hooks
   const { data: resources = [], isLoading, error } = useResources();
   const createMutation = useCreateResource();
   const updateMutation = useUpdateResource();
   const deleteMutation = useDeleteResource();

   // Modal state
   const [showFormModal, setShowFormModal] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [editingResource, setEditingResource] = useState<Resource | null>(
      null
   );
   const [deletingResourceId, setDeletingResourceId] = useState<number | null>(
      null
   );

   // Form state
   const [formData, setFormData] = useState<FormData>({
      name: "",
      description: "",
   });
   const [formErrors, setFormErrors] = useState<FormErrors>({});
   const [searchTerm, setSearchTerm] = useState("");

   // Handlers
   const handleOpenCreateModal = () => {
      setEditingResource(null);
      setFormData({ name: "", description: "" });
      setFormErrors({});
      setShowFormModal(true);
   };

   const handleOpenEditModal = (resource: Resource) => {
      setEditingResource(resource);
      setFormData({
         name: resource.name,
         description: resource.description,
      });
      setFormErrors({});
      setShowFormModal(true);
   };

   const handleOpenDeleteModal = (id: number) => {
      setDeletingResourceId(id);
      setShowDeleteModal(true);
   };

   const handleCloseFormModal = () => {
      setShowFormModal(false);
      setEditingResource(null);
      setFormData({ name: "", description: "" });
      setFormErrors({});
   };

   const handleCloseDeleteModal = () => {
      setShowDeleteModal(false);
      setDeletingResourceId(null);
   };

   const validateForm = (): boolean => {
      const errors: FormErrors = {};

      if (!formData.name.trim()) {
         errors.name = "Nome é obrigatório";
      } else if (formData.name.trim().length < 2) {
         errors.name = "Nome deve ter pelo menos 2 caracteres";
      }

      if (!formData.description.trim()) {
         errors.description = "Descrição é obrigatória";
      } else if (formData.description.trim().length < 3) {
         errors.description = "Descrição deve ter pelo menos 3 caracteres";
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      const payload = {
         name: formData.name.trim(),
         description: formData.description.trim(),
      };

      try {
         if (editingResource) {
            // Update
            const result = await updateMutation.mutateAsync({
               id: editingResource.id,
               data: payload as ResourceUpdate,
            });

            if (result.ok) {
               push({
                  type: "success",
                  message: result.message || "Recurso atualizado com sucesso!",
               });
               handleCloseFormModal();
            } else {
               push({
                  type: "error",
                  message: result.message || "Erro ao atualizar recurso",
               });
            }
         } else {
            // Create
            const result = await createMutation.mutateAsync(
               payload as ResourceCreate
            );

            if (result.ok) {
               push({
                  type: "success",
                  message: result.message || "Recurso criado com sucesso!",
               });
               handleCloseFormModal();
            } else {
               push({
                  type: "error",
                  message: result.message || "Erro ao criar recurso",
               });
            }
         }
      } catch (err) {
         push({
            type: "error",
            message: "Ocorreu um erro inesperado",
         });
      }
   };

   const handleDelete = async () => {
      if (!deletingResourceId) return;

      try {
         const result = await deleteMutation.mutateAsync(deletingResourceId);

         if (result.ok) {
            push({
               type: "success",
               message: result.message || "Recurso excluído com sucesso!",
            });
            handleCloseDeleteModal();
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao excluir recurso",
            });
         }
      } catch (err) {
         push({
            type: "error",
            message: "Ocorreu um erro inesperado",
         });
      }
   };

   const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field when user starts typing
      if (formErrors[name as keyof FormErrors]) {
         setFormErrors((prev) => ({ ...prev, [name]: undefined }));
      }
   };

   // Loading state
   if (isLoading) {
      return (
         <div className="flex items-center justify-center py-12">
            <Spinner color="failure" size="xl" />
         </div>
      );
   }

   // Error state
   if (error) {
      return (
         <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-800">
               Erro ao carregar recursos. Por favor, tente novamente.
            </p>
         </div>
      );
   }

   // Filtered resources
   const filteredResources = resources.filter((resource) => {
      const searchLower = searchTerm.toLowerCase();
      return (
         resource.name.toLowerCase().includes(searchLower) ||
         resource.description?.toLowerCase().includes(searchLower) ||
         resource.id.toString() === searchLower
      );
   });

   return (
      <div className="space-y-4">
         {/* Header with Search and Create Button */}
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
               Recursos
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
               <TextInput
                  id="search"
                  type="text"
                  icon={FaMagnifyingGlass}
                  placeholder="Buscar recursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
               />
               <Button color="blue" onClick={handleOpenCreateModal} className="w-full sm:w-auto">
                  <FaPlus className="mr-2 h-4 w-4" />
                  Novo Recurso
               </Button>
            </div>
         </div>

         {/* Resources Table */}
         <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
            <div className="overflow-x-auto">
               <Table hoverable>
                  <TableHead className="bg-gray-50 dark:bg-gray-700">
                     <TableRow>
                        <TableHeadCell className="w-20">ID</TableHeadCell>
                        <TableHeadCell>Nome</TableHeadCell>
                        <TableHeadCell>Descrição</TableHeadCell>
                        <TableHeadCell className="text-right">
                           Ações
                        </TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y">
                     {filteredResources.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={4} className="py-12 text-center">
                              <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                 <FaDatabase className="mb-3 h-10 w-10 opacity-40" />
                                 <p className="text-lg font-medium">Nenhum recurso encontrado</p>
                                 {searchTerm && (
                                    <p className="mt-1 text-sm">
                                       Não encontramos resultados para "{searchTerm}".
                                    </p>
                                 )}
                              </div>
                           </TableCell>
                        </TableRow>
                     ) : (
                        filteredResources.map((resource) => (
                           <TableRow
                              key={resource.id}
                              className="bg-white dark:border-gray-800 dark:bg-gray-900"
                           >
                              <TableCell className="font-medium text-gray-900 dark:text-white">
                                 #{resource.id}
                              </TableCell>
                              <TableCell className="font-semibold text-gray-900 dark:text-white">{resource.name}</TableCell>
                              <TableCell className="text-gray-500 dark:text-gray-400">
                                 {resource.description || "-"}
                              </TableCell>
                              <TableCell>
                                 <div className="flex items-center justify-end gap-2">
                                    <Button
                                       color="light"
                                       size="sm"
                                       onClick={() =>
                                          handleOpenEditModal(resource)
                                       }
                                       title="Editar"
                                       className="focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
                                    >
                                       <FaPenToSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </Button>
                                    <Button
                                       color="light"
                                       size="sm"
                                       onClick={() =>
                                          handleOpenDeleteModal(resource.id)
                                       }
                                       title="Excluir"
                                       className="focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800"
                                    >
                                       <FaTrashCan className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    </Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))
                     )}
                  </TableBody>
               </Table>
            </div>
         </div>

         {/* Create/Edit Modal */}
         <Modal show={showFormModal} onClose={handleCloseFormModal} size="md">
            <ModalHeader>
               {editingResource ? "Editar Recurso" : "Novo Recurso"}
            </ModalHeader>
            <form onSubmit={handleSubmit}>
               <ModalBody>
                  <div className="space-y-4">
                     {/* Name Field */}
                     <div>
                        <Label htmlFor="name">Nome</Label>
                        <TextInput
                           id="name"
                           name="name"
                           type="text"
                           placeholder="Digite o nome do recurso"
                           value={formData.name}
                           onChange={handleInputChange}
                           color={formErrors.name ? "failure" : undefined}
                           autoFocus
                        />
                        {formErrors.name && (
                           <p className="mt-1 text-sm text-red-600">
                              {formErrors.name}
                           </p>
                        )}
                     </div>

                     {/* Description Field */}
                     <div>
                        <Label htmlFor="description">Descricao</Label>
                        <TextInput
                           id="description"
                           name="description"
                           type="text"
                           placeholder="Digite a descrição do recurso"
                           value={formData.description}
                           onChange={handleInputChange}
                           color={
                              formErrors.description ? "failure" : undefined
                           }
                        />
                        {formErrors.description && (
                           <p className="mt-1 text-sm text-red-600">
                              {formErrors.description}
                           </p>
                        )}
                     </div>
                  </div>
               </ModalBody>
               <ModalFooter>
                  <Button
                     type="submit"
                     color="blue"
                     disabled={
                        createMutation.isPending || updateMutation.isPending
                     }
                  >
                     {createMutation.isPending || updateMutation.isPending ? (
                        <>
                           <Spinner color="failure" size="sm" />
                           <span className="ml-2">Salvando...</span>
                        </>
                     ) : editingResource ? (
                        "Atualizar"
                     ) : (
                        "Criar"
                     )}
                  </Button>
                  <Button
                     color="gray"
                     onClick={handleCloseFormModal}
                     disabled={
                        createMutation.isPending || updateMutation.isPending
                     }
                  >
                     Cancelar
                  </Button>
               </ModalFooter>
            </form>
         </Modal>

         {/* Delete Confirmation Modal */}
         <Modal
            show={showDeleteModal}
            onClose={handleCloseDeleteModal}
            size="md"
            popup
         >
            <ModalHeader />
            <ModalBody>
               <div className="text-center">
                  <FaTrashCan className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                  <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                     Tem certeza que deseja excluir este recurso?
                  </h3>
                  <div className="flex justify-center gap-4">
                     <Button
                        color="red"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                     >
                        {deleteMutation.isPending ? (
                           <>
                              <Spinner color="failure" size="sm" />
                              <span className="ml-2">Excluindo...</span>
                           </>
                        ) : (
                           "Sim, tenho certeza"
                        )}
                     </Button>
                     <Button
                        color="gray"
                        onClick={handleCloseDeleteModal}
                        disabled={deleteMutation.isPending}
                     >
                        Não, cancelar
                     </Button>
                  </div>
               </div>
            </ModalBody>
         </Modal>
      </div>
   );
}
