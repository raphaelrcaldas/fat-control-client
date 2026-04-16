"use client";

import { useToast } from "@/app/context/toast";
import {
   useCreatePermission,
   useDeletePermission,
   usePermissions,
   useResources,
   useUpdatePermission,
} from "@/hooks/queries";
import type {
   PermissionCreate,
   PermissionDetail,
   PermissionUpdate,
} from "services/routes/security/resources";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Select,
   Spinner,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   TextInput,
} from "flowbite-react";
import { useMemo, useState } from "react";
import { FaFilter, FaPenToSquare, FaPlus, FaTrashCan, FaMagnifyingGlass, FaKey } from "react-icons/fa6";

interface PermissionFormData {
   resource_id: number | "";
   name: string;
   description: string;
}

const initialFormData: PermissionFormData = {
   resource_id: "",
   name: "",
   description: "",
};

export default function PermissionsTab() {
   const { push } = useToast();

   // Queries
   const { data: permissions = [], isLoading: isLoadingPermissions } =
      usePermissions();
   const { data: resources = [], isLoading: isLoadingResources } =
      useResources();

   // Mutations
   const createMutation = useCreatePermission();
   const updateMutation = useUpdatePermission();
   const deleteMutation = useDeletePermission();

   // State
   const [showModal, setShowModal] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [editingPermission, setEditingPermission] =
      useState<PermissionDetail | null>(null);
   const [permissionToDelete, setPermissionToDelete] =
      useState<PermissionDetail | null>(null);
   const [formData, setFormData] =
      useState<PermissionFormData>(initialFormData);
   const [formErrors, setFormErrors] = useState<
      Partial<Record<keyof PermissionFormData, string>>
   >({});
   const [resourceFilter, setResourceFilter] = useState<string>("all");
   const [searchTerm, setSearchTerm] = useState("");

   // Filtered permissions based on resource filter and search
   const filteredPermissions = useMemo(() => {
      return permissions.filter((p) => {
         const matchesResource = resourceFilter === "all" || p.resource === resourceFilter;
         const searchLower = searchTerm.toLowerCase();
         const matchesSearch = 
            p.action.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower) ||
            p.resource.toLowerCase().includes(searchLower);
         return matchesResource && matchesSearch;
      });
   }, [permissions, resourceFilter, searchTerm]);

   // Handlers
   const handleOpenCreateModal = () => {
      setEditingPermission(null);
      setFormData(initialFormData);
      setFormErrors({});
      setShowModal(true);
   };

   const handleOpenEditModal = (permission: PermissionDetail) => {
      const resource = resources.find((r) => r.name === permission.resource);
      setEditingPermission(permission);
      setFormData({
         resource_id: resource?.id || "",
         name: permission.action,
         description: permission.description,
      });
      setFormErrors({});
      setShowModal(true);
   };

   const handleCloseModal = () => {
      setShowModal(false);
      setEditingPermission(null);
      setFormData(initialFormData);
      setFormErrors({});
   };

   const handleOpenDeleteModal = (permission: PermissionDetail) => {
      setPermissionToDelete(permission);
      setShowDeleteModal(true);
   };

   const handleCloseDeleteModal = () => {
      setShowDeleteModal(false);
      setPermissionToDelete(null);
   };

   const validateForm = (): boolean => {
      const errors: Partial<Record<keyof PermissionFormData, string>> = {};

      if (!formData.resource_id) {
         errors.resource_id = "Selecione um recurso";
      }
      if (!formData.name.trim()) {
         errors.name = "Informe o nome da ação";
      }
      if (!formData.description.trim()) {
         errors.description = "Informe a descrição";
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      if (editingPermission) {
         // Update
         const updateData: PermissionUpdate = {
            name: formData.name,
            description: formData.description,
         };

         const result = await updateMutation.mutateAsync({
            id: editingPermission.id,
            data: updateData,
         });

         if (result.ok) {
            push({
               type: "success",
               message: "Permissao atualizada com sucesso",
            });
            handleCloseModal();
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao atualizar permissao",
            });
         }
      } else {
         // Create
         const createData: PermissionCreate = {
            resource_id: formData.resource_id as number,
            name: formData.name,
            description: formData.description,
         };

         const result = await createMutation.mutateAsync(createData);

         if (result.ok) {
            push({ type: "success", message: "Permissao criada com sucesso" });
            handleCloseModal();
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao criar permissao",
            });
         }
      }
   };

   const handleDelete = async () => {
      if (!permissionToDelete) return;

      const result = await deleteMutation.mutateAsync(permissionToDelete.id);

      if (result.ok) {
         push({ type: "success", message: "Permissao excluida com sucesso" });
         handleCloseDeleteModal();
      } else {
         push({
            type: "error",
            message: result.message || "Erro ao excluir permissao",
         });
      }
   };

   // Loading state
   if (isLoadingPermissions || isLoadingResources) {
      return (
         <div className="flex items-center justify-center py-12">
            <Spinner color="failure" size="xl" />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         {/* Header with Search, Filter and Create Button */}
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
               Permissões
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
               <TextInput
                  id="search"
                  type="text"
                  icon={FaMagnifyingGlass}
                  placeholder="Buscar permissões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-48"
               />
               <Select
                  id="resource-filter"
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  className="w-full sm:w-48"
               >
                  <option value="all">Todos os recursos</option>
                  {resources.map((resource) => (
                     <option key={resource.id} value={resource.name}>
                        {resource.name}
                     </option>
                  ))}
               </Select>
               <Button color="blue" onClick={handleOpenCreateModal} className="w-full sm:w-auto">
                  <FaPlus className="mr-2 h-4 w-4" />
                  Nova Permissão
               </Button>
            </div>
         </div>

         {/* Permissions table */}
         <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
            <div className="overflow-x-auto">
               <Table hoverable>
                  <TableHead className="bg-gray-50 dark:bg-gray-700">
                     <TableRow>
                        <TableHeadCell>Recurso</TableHeadCell>
                        <TableHeadCell>Ação</TableHeadCell>
                        <TableHeadCell>Descrição</TableHeadCell>
                        <TableHeadCell className="text-right">
                           Ações
                        </TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y">
                     {filteredPermissions.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={4} className="py-12 text-center">
                              <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                 <FaKey className="mb-3 h-10 w-10 opacity-40" />
                                 <p className="text-lg font-medium">Nenhuma permissão encontrada</p>
                                 {(searchTerm || resourceFilter !== "all") && (
                                    <p className="mt-1 text-sm">
                                       Nenhum resultado corresponde à sua busca ou filtro.
                                    </p>
                                 )}
                              </div>
                           </TableCell>
                        </TableRow>
                     ) : (
                        filteredPermissions.map((permission) => (
                           <TableRow
                              key={permission.id}
                              className="bg-white dark:border-gray-800 dark:bg-gray-900"
                           >
                              <TableCell className="font-medium text-gray-900 dark:text-white">
                                 {permission.resource}
                              </TableCell>
                              <TableCell className="font-semibold text-gray-900 dark:text-white">
                                 {permission.action}
                              </TableCell>
                              <TableCell className="text-gray-500 dark:text-gray-400">
                                 {permission.description || "-"}
                              </TableCell>
                              <TableCell>
                                 <div className="flex items-center justify-end gap-2">
                                    <Button
                                       color="light"
                                       size="sm"
                                       onClick={() => handleOpenEditModal(permission)}
                                       title="Editar"
                                       className="focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
                                    >
                                       <FaPenToSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </Button>
                                    <Button
                                       color="light"
                                       size="sm"
                                       onClick={() => handleOpenDeleteModal(permission)}
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
         <Modal show={showModal} onClose={handleCloseModal}>
            <ModalHeader>
               {editingPermission ? "Editar Permissão" : "Nova Permissão"}
            </ModalHeader>
            <form onSubmit={handleSubmit}>
               <ModalBody>
                  <div className="space-y-4">
                     {/* Resource */}
                     <div>
                        <Label htmlFor="resource">Recurso</Label>
                        <Select
                           id="resource"
                           value={formData.resource_id}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 resource_id: e.target.value
                                    ? Number(e.target.value)
                                    : "",
                              })
                           }
                           disabled={!!editingPermission}
                           color={
                              formErrors.resource_id ? "failure" : undefined
                           }
                        >
                           <option value="">Selecione um recurso</option>
                           {resources.map((resource) => (
                              <option key={resource.id} value={resource.id}>
                                 {resource.name}
                              </option>
                           ))}
                        </Select>
                        {formErrors.resource_id && (
                           <p className="mt-1 text-sm text-red-600">
                              {formErrors.resource_id}
                           </p>
                        )}
                        {editingPermission && (
                           <p className="mt-1 text-sm text-gray-500">
                              O recurso não pode ser alterado
                           </p>
                        )}
                     </div>

                     {/* Action Name */}
                     <div>
                        <Label htmlFor="name">Nome da Acao</Label>
                        <TextInput
                           id="name"
                           type="text"
                           value={formData.name}
                           onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                           }
                           placeholder="ex: create, read, update, delete"
                           color={formErrors.name ? "failure" : undefined}
                        />
                        {formErrors.name && (
                           <p className="mt-1 text-sm text-red-600">
                              {formErrors.name}
                           </p>
                        )}
                     </div>

                     {/* Description */}
                     <div>
                        <Label htmlFor="description">Descricao</Label>
                        <TextInput
                           id="description"
                           type="text"
                           value={formData.description}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 description: e.target.value,
                              })
                           }
                           placeholder="Descreva a permissão"
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
                     color="blue"
                     type="submit"
                     disabled={
                        createMutation.isPending || updateMutation.isPending
                     }
                  >
                     {createMutation.isPending || updateMutation.isPending ? (
                        <>
                           <Spinner
                              size="sm"
                              className="mr-2"
                           />
                           Salvando...
                        </>
                     ) : editingPermission ? (
                        "Salvar Alterações"
                     ) : (
                        "Criar Permissão"
                     )}
                  </Button>
                  <Button color="gray" onClick={handleCloseModal}>
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
         >
            <ModalHeader>Confirmar Exclusão</ModalHeader>
            <ModalBody>
               <p>
                  Tem certeza que deseja excluir a permissão{" "}
                  <strong>
                     {permissionToDelete?.resource}.{permissionToDelete?.action}
                  </strong>
                  ?
               </p>
               <p className="mt-2 text-sm text-gray-600">
                  Esta ação não pode ser desfeita.
               </p>
            </ModalBody>
            <ModalFooter>
               <Button
                  color="red"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
               >
                  {deleteMutation.isPending ? (
                     <>
                        <Spinner color="failure" size="sm" className="mr-2" />
                        Excluindo...
                     </>
                  ) : (
                     "Excluir"
                  )}
               </Button>
               <Button color="gray" onClick={handleCloseDeleteModal}>
                  Cancelar
               </Button>
            </ModalFooter>
         </Modal>
      </div>
   );
}
