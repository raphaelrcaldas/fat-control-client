"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Spinner, Alert, Badge, Button, Modal, ModalHeader, ModalBody, Label, TextInput, Select } from "flowbite-react";
import {
   HiCurrencyDollar,
   HiExclamation,
   HiPencil,
   HiTrash,
} from "react-icons/hi";
import { useToast } from "../../../context/toast";
import {
   getDiariaValores,
   getGruposCidade,
   getGruposPg,
   updateDiariaValor,
   createDiariaValor,
   deleteDiariaValor,
   type DiariaValorPublic,
   type GrupoCidadePublic,
   type GrupoPgPublic,
} from "services/routes/cegep/diarias";


const formatCurrency = (value: number) => {
   return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
   }).format(value);
};

const formatDate = (dateStr: string | null) => {
   if (!dateStr) return "-";
   return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
};

const getStatusBadge = (status: string | null) => {
   switch (status) {
      case "vigente":
         return (
            <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
               <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
               Vigente
            </span>
         );
      case "proximo":
         return (
            <span className="inline-flex items-center gap-1.5 text-sm text-blue-600">
               <span className="h-2 w-2 rounded-full bg-blue-500"></span>
               Próximo
            </span>
         );
      case "anterior":
         return (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
               <span className="h-2 w-2 rounded-full bg-gray-300"></span>
               Anterior
            </span>
         );
      default:
         return null;
   }
};


export default function DiariasPage() {
   const [valores, setValores] = useState<DiariaValorPublic[]>([]);
   const [gruposCidade, setGruposCidade] = useState<GrupoCidadePublic[]>([]);
   const [gruposPg, setGruposPg] = useState<GrupoPgPublic[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [onlyActive, setOnlyActive] = useState(true);

   // Edit modal
   const [showModal, setShowModal] = useState(false);
   const [editingValor, setEditingValor] = useState<DiariaValorPublic | null>(null);
   const [isCreating, setIsCreating] = useState(false);
   const [formData, setFormData] = useState({
      valor: "",
      data_inicio: "",
      data_fim: "",
      grupo_cid: 1,
      grupo_pg: 1,
   });

   const { push } = useToast();

   const loadData = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);

         const [valoresData, cidadesData, pgData] = await Promise.all([
            getDiariaValores(undefined, undefined, onlyActive),
            getGruposCidade(),
            getGruposPg(),
         ]);

         setValores(valoresData);
         setGruposCidade(cidadesData);
         setGruposPg(pgData);
      } catch (err: any) {
         const errorMessage = err?.message || "Erro ao carregar dados";
         setError(errorMessage);
         push({
            title: "Erro",
            message: errorMessage,
            type: "error",
         });
      } finally {
         setLoading(false);
      }
   }, [onlyActive, push]);

   useEffect(() => {
      loadData();
   }, [loadData]);

   // Agrupa cidades por grupo
   const cidadesByGrupo = useMemo(() => {
      const map = new Map<number, GrupoCidadePublic[]>();
      gruposCidade.forEach((gc) => {
         if (!map.has(gc.grupo)) {
            map.set(gc.grupo, []);
         }
         map.get(gc.grupo)!.push(gc);
      });
      return map;
   }, [gruposCidade]);

   // Agrupa P/G por grupo
   const pgByGrupo = useMemo(() => {
      const map = new Map<number, GrupoPgPublic[]>();
      gruposPg.forEach((gpg) => {
         if (!map.has(gpg.grupo)) {
            map.set(gpg.grupo, []);
         }
         map.get(gpg.grupo)!.push(gpg);
      });
      return map;
   }, [gruposPg]);

   // Lista de grupos únicos
   const uniqueGruposCidade = useMemo(() => {
      const gruposFromCidades = gruposCidade.map((gc) => gc.grupo);
      const gruposFromValores = valores.map((v) => v.grupo_cid);
      return Array.from(new Set([...gruposFromCidades, ...gruposFromValores])).sort(
         (a, b) => a - b
      );
   }, [gruposCidade, valores]);

   const uniqueGruposPg = useMemo(() => {
      const gruposFromPg = gruposPg.map((gp) => gp.grupo);
      const gruposFromValores = valores.map((v) => v.grupo_pg);
      return Array.from(new Set([...gruposFromPg, ...gruposFromValores])).sort(
         (a, b) => a - b
      );
   }, [gruposPg, valores]);



   const handleOpenModal = (valor: DiariaValorPublic) => {
      setEditingValor(valor);
      setIsCreating(false);
      setFormData({
         valor: String(valor.valor),
         data_inicio: valor.data_inicio,
         data_fim: valor.data_fim || "",
         grupo_cid: valor.grupo_cid,
         grupo_pg: valor.grupo_pg,
      });
      setShowModal(true);
   };

   const handleOpenCreateModal = () => {
      setEditingValor(null);
      setIsCreating(true);
      setFormData({
         valor: "",
         data_inicio: "",
         data_fim: "",
         grupo_cid: 1,
         grupo_pg: 1,
      });
      setShowModal(true);
   };

   const handleCloseModal = () => {
      setShowModal(false);
      setEditingValor(null);
      setIsCreating(false);
      setFormData({ valor: "", data_inicio: "", data_fim: "", grupo_cid: 1, grupo_pg: 1 });
   };

   // Verificar se houve alteração no formulário
   const hasChanges = useMemo(() => {
      if (isCreating) return true;
      if (!editingValor) return false;
      return (
         formData.valor !== String(editingValor.valor) ||
         formData.data_inicio !== editingValor.data_inicio ||
         formData.data_fim !== (editingValor.data_fim || "")
      );
   }, [formData, editingValor, isCreating]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
         if (isCreating) {
            await createDiariaValor({
               valor: parseFloat(formData.valor),
               data_inicio: formData.data_inicio,
               data_fim: formData.data_fim || null,
               grupo_cid: formData.grupo_cid,
               grupo_pg: formData.grupo_pg,
            });
            push({
               title: "Sucesso!",
               message: "Diária criada com sucesso",
               type: "success",
            });
         } else {
            if (!editingValor) return;
            await updateDiariaValor(editingValor.id, {
               valor: parseFloat(formData.valor),
               data_inicio: formData.data_inicio,
               data_fim: formData.data_fim || null,
            });
            push({
               title: "Sucesso!",
               message: "Valor atualizado com sucesso",
               type: "success",
            });
         }

         handleCloseModal();
         loadData();
      } catch (err: any) {
         push({
            title: "Erro",
            message: err?.message || "Erro ao salvar",
            type: "error",
         });
      }
   };

   const handleDelete = async (id: number) => {
      if (!confirm("Deseja realmente excluir esta diária?")) return;

      try {
         await deleteDiariaValor(id);
         push({
            title: "Sucesso!",
            message: "Diária excluída com sucesso",
            type: "success",
         });
         loadData();
      } catch (err: any) {
         push({
            title: "Erro",
            message: err?.message || "Erro ao excluir",
            type: "error",
         });
      }
   };

   return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-gray-50">
         {/* Header */}
         <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
               <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-2">
                     <HiCurrencyDollar className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                     <h5 className="text-lg font-semibold text-gray-900">
                        Gestão de Diárias
                     </h5>
                     <p className="text-sm text-gray-500">
                        {loading
                           ? "Carregando..."
                           : `${valores.length} valor(es) | ${uniqueGruposCidade.length} grupo(s) de cidades`}
                     </p>
                  </div>
               </div>
               <Button color="red" onClick={handleOpenCreateModal}>
                  <HiPencil className="mr-2 h-4 w-4" />
                  Nova Diária
               </Button>
            </div>

            {error && (
               <Alert color="failure" icon={HiExclamation} className="mt-4">
                  <span className="font-medium">Erro!</span> {error}
               </Alert>
            )}
         </div>

         {/* Content */}
         <div className="h-full rounded-lg border border-gray-200 shadow-sm bg-white">
            {loading ? (
               <div className="flex h-64 flex-col items-center justify-center">
                  <Spinner size="xl" color="failure" />
                  <p className="mt-4 text-gray-600">Carregando diárias...</p>
               </div>
            ) : (
               <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-4">
                  {/* Filtro */}
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 w-fit">
                     <input
                        type="checkbox"
                        id="onlyActive"
                        checked={onlyActive}
                        onChange={(e) => setOnlyActive(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                     />
                     <label
                        htmlFor="onlyActive"
                        className="cursor-pointer text-sm font-medium text-gray-700"
                     >
                        Somente vigentes
                     </label>
                  </div>

                  {/* Cards por grupo de P/G */}
                  <div className="space-y-3">
                     {uniqueGruposPg.map((grupoNum) => {
                        const postos = pgByGrupo.get(grupoNum) || [];
                        const valoresGrupo = valores.filter(
                           (v) => v.grupo_pg === grupoNum
                        );

                        return (
                           <div
                              key={grupoNum}
                              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                           >
                              <div className="mb-3 flex items-center gap-2">
                                 <span className="text-gray-700 font-medium">
                                    Grupo {grupoNum}:
                                 </span>
                                 <span className="text-gray-600">
                                    {postos.map((pg) => pg.pg_mid || pg.pg_short.toUpperCase()).join(", ") || "-"}
                                 </span>
                              </div>

                              {valoresGrupo.length === 0 ? (
                                 <p className="text-sm text-gray-500">
                                    Nenhum valor cadastrado
                                 </p>
                              ) : (
                                 <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-600">
                                       <thead className="border-b border-gray-200 bg-white text-xs uppercase text-gray-700">
                                          <tr>
                                             <th className="px-3 py-2">Grupo Cidade</th>
                                             <th className="px-3 py-2">Valor</th>
                                             <th className="px-3 py-2">Início</th>
                                             <th className="px-3 py-2">Fim</th>
                                             <th className="px-3 py-2">Status</th>
                                             <th className="px-3 py-2"></th>
                                          </tr>
                                       </thead>
                                       <tbody>
                                          {valoresGrupo.map((valor) => {
                                             const cidades = cidadesByGrupo.get(valor.grupo_cid) || [];
                                             const cidadeNome = valor.grupo_cid === 3
                                                ? "Demais Localidades"
                                                : valor.grupo_cid === 2
                                                   ? "Demais Capitais"
                                                   : cidades.map((c) => c.cidade?.nome).filter(Boolean).join(", ") || "-";

                                             return (
                                                <tr
                                                   key={valor.id}
                                                   className="border-b border-gray-100 bg-white hover:bg-gray-50"
                                                >
                                                   <td className="px-3 py-2">
                                                      <span className="text-gray-700">
                                                         {cidadeNome}
                                                      </span>
                                                   </td>
                                                   <td className="px-3 py-2">
                                                      <span className="font-mono font-semibold text-green-600">
                                                         {formatCurrency(valor.valor)}
                                                      </span>
                                                   </td>
                                                   <td className="px-3 py-2 font-mono text-gray-600">
                                                      {formatDate(valor.data_inicio)}
                                                   </td>
                                                   <td className="px-3 py-2 font-mono text-gray-600">
                                                      {formatDate(valor.data_fim)}
                                                   </td>
                                                   <td className="px-3 py-2">
                                                      {getStatusBadge(valor.status)}
                                                   </td>
                                                   <td className="px-3 py-2">
                                                      <div className="flex gap-2">
                                                         <button
                                                            onClick={() => handleOpenModal(valor)}
                                                            className="text-gray-600 hover:text-blue-600"
                                                            title="Editar"
                                                         >
                                                            <HiPencil className="h-5 w-5" />
                                                         </button>
                                                         <button
                                                            onClick={() => handleDelete(valor.id)}
                                                            className="text-gray-600 hover:text-red-600"
                                                            title="Excluir"
                                                         >
                                                            <HiTrash className="h-5 w-5" />
                                                         </button>
                                                      </div>
                                                   </td>
                                                </tr>
                                             );
                                          })}
                                       </tbody>
                                    </table>
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}
         </div>

         {/* Edit/Create Modal */}
         <Modal show={showModal} onClose={handleCloseModal} size="md">
            <ModalHeader>{isCreating ? "Nova Diária" : "Editar Valor de Diária"}</ModalHeader>
            <ModalBody>
               <form onSubmit={handleSubmit} className="space-y-4">
                  {isCreating && (
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <Label htmlFor="grupo_cid">Grupo Cidade</Label>
                           <Select
                              id="grupo_cid"
                              value={formData.grupo_cid}
                              onChange={(e) =>
                                 setFormData({ ...formData, grupo_cid: Number(e.target.value) })
                              }
                              required
                           >
                              {uniqueGruposCidade.map((g) => (
                                 <option key={g} value={g}>Grupo {g}</option>
                              ))}
                           </Select>
                        </div>
                        <div>
                           <Label htmlFor="grupo_pg">Grupo P/G</Label>
                           <Select
                              id="grupo_pg"
                              value={formData.grupo_pg}
                              onChange={(e) =>
                                 setFormData({ ...formData, grupo_pg: Number(e.target.value) })
                              }
                              required
                           >
                              {[1, 2, 3, 4, 5].map((g) => (
                                 <option key={g} value={g}>
                                    Grupo {g}: {(pgByGrupo.get(g) || []).map((pg) => pg.pg_mid || pg.pg_short.toUpperCase()).join(", ") || "-"}
                                 </option>
                              ))}
                           </Select>
                        </div>
                     </div>
                  )}

                  <div>
                     <Label htmlFor="valor">Valor (R$)</Label>
                     <TextInput
                        id="valor"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor}
                        onChange={(e) =>
                           setFormData({ ...formData, valor: e.target.value })
                        }
                        required
                     />
                  </div>

                  <div>
                     <Label htmlFor="data_inicio">Data Início</Label>
                     <TextInput
                        id="data_inicio"
                        type="date"
                        value={formData.data_inicio}
                        onChange={(e) =>
                           setFormData({ ...formData, data_inicio: e.target.value })
                        }
                        required
                     />
                  </div>

                  <div>
                     <Label htmlFor="data_fim">Data Fim (opcional)</Label>
                     <TextInput
                        id="data_fim"
                        type="date"
                        value={formData.data_fim}
                        onChange={(e) =>
                           setFormData({ ...formData, data_fim: e.target.value })
                        }
                     />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                     <Button color="gray" onClick={handleCloseModal}>
                        Cancelar
                     </Button>
                     <Button type="submit" color="red" disabled={!hasChanges}>
                        {isCreating ? "Criar" : "Salvar"}
                     </Button>
                  </div>
               </form>
            </ModalBody>
         </Modal>
      </div>
   );
}
