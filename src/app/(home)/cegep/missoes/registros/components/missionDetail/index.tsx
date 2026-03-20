import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Textarea,
   Select,
   Label,
   TextInput,
   Checkbox,
   Spinner,
} from "flowbite-react";
import { MissionPernoite } from "./pernoite/missionPernoite";
import { FormPernoite } from "./pernoite/formPernoite";
import { FormMilitar } from "./militar/formMilitar";
import { MissionMilitar } from "./militar/missionMilitar";
import { ErrorModal } from "./errorModal";
import { DeleteMissionModal } from "./deleteMissionModal";
import { Missao } from "services/routes/cegep/missoes";
import { Etiqueta } from "services/routes/cegep/missoes";
import { DateTimePicker } from "src/app/(home)/components/dateTimePicker";
import { useState, useMemo, useEffect } from "react";
import {
   FaPlaneDeparture,
   FaPlaneArrival,
   FaExclamationTriangle,
} from "react-icons/fa";
import { HiTag, HiX } from "react-icons/hi";
import { FaRegClone } from "react-icons/fa";
import { useToast } from "@/app/context/toast";
import {
   useCreateUpdateMissao,
   useDeleteMissao,
} from "@/hooks/queries/useMissoes";
import { useEtiquetasMissoes } from "@/hooks/queries/useEtiquetasMissoes";
import clsx from "clsx";

export default function MissionDetail({
   missao,
   show,
   setShow,
   edit,
   setClone,
   setShowForm,
}: {
   missao?: Missao | null;
   show: boolean;
   edit: boolean;
   setShow: React.Dispatch<React.SetStateAction<boolean>>;
   setClone: React.Dispatch<React.SetStateAction<Missao | null>>;
   setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}) {
   // React Query mutations
   const createUpdateMutation = useCreateUpdateMissao();
   const deleteMutation = useDeleteMissao();
   // Valores padrões
   const defaultValues = useMemo(
      () => ({
         tipoDoc: missao ? missao.tipo_doc : "",
         nDoc: missao ? missao.n_doc : undefined,
         desc: missao ? missao.desc : "",
         afast: missao ? missao.afast : "",
         regres: missao ? missao.regres : "",
         tipo: missao ? missao.tipo : "",
         ind: missao ? (missao.indenizavel ? "ind" : "n_ind") : "",
         acrecDesloc: missao ? missao.acrec_desloc : false,
         obs: missao ? missao.obs : "",
         pnts: missao ? missao.pernoites : [],
         mils: missao ? missao.users : [],
         etiquetas: missao ? missao.etiquetas : [],
      }),
      [missao]
   );

   const [editMode, setEditMode] = useState(edit);
   const [tipoDoc, setTipoDoc] = useState(defaultValues.tipoDoc);
   const [nDoc, setNDoc] = useState(defaultValues.nDoc);
   const [desc, setDesc] = useState(defaultValues.desc);
   const [tipo, setTipo] = useState(defaultValues.tipo);
   const [afast, setAfast] = useState(defaultValues.afast);
   const [regres, setRegres] = useState(defaultValues.regres);
   const [acrecDesloc, setAcrecDesloc] = useState(defaultValues.acrecDesloc);
   const [ind, setInd] = useState(defaultValues.ind);
   const [obs, setObs] = useState(defaultValues.obs);
   const [formPnt, setFormPnt] = useState(false);
   const [pnts, setPnts] = useState(defaultValues.pnts);
   const [formMil, setFormMil] = useState(false);
   const [mils, setMils] = useState(defaultValues.mils);
   const [etiquetasMissao, setEtiquetasMissao] = useState(
      defaultValues.etiquetas
   );

   const [checkAfastRegres, setCheckAfastRegres] = useState(false);

   const [showErrorModal, setShowErrorModal] = useState(false);
   const [errorMessage, setErrorMessage] = useState("");
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [showValidationModal, setShowValidationModal] = useState(false);
   const [validationErrors, setValidationErrors] = useState<string[]>([]);
   const { push } = useToast();

   // Etiquetas disponíveis do React Query
   const { data: etiquetasDisponiveis = [], isLoading: loadingEtiquetas } =
      useEtiquetasMissoes();

   // Loading state combinando ambas mutations
   const isLoading = createUpdateMutation.isPending || deleteMutation.isPending;

   // Toggle para adicionar/remover etiqueta da missão
   const toggleEtiqueta = (etiqueta: Etiqueta) => {
      const isSelected = etiquetasMissao.some((e) => e.id === etiqueta.id);
      if (isSelected) {
         setEtiquetasMissao((prev) => prev.filter((e) => e.id !== etiqueta.id));
      } else {
         setEtiquetasMissao((prev) => [...prev, etiqueta]);
      }
   };

   const sortedPnts = useMemo(
      () =>
         pnts.toSorted(
            (pntPrev, pntAft) =>
               new Date(pntPrev.data_ini).valueOf() -
               new Date(pntAft.data_ini).valueOf()
         ),
      [pnts]
   );

   const isChanged = useMemo(
      () =>
         nDoc !== defaultValues.nDoc ||
         tipoDoc !== defaultValues.tipoDoc ||
         desc !== defaultValues.desc ||
         tipo !== defaultValues.tipo ||
         afast !== defaultValues.afast ||
         regres !== defaultValues.regres ||
         acrecDesloc !== defaultValues.acrecDesloc ||
         ind !== defaultValues.ind ||
         obs !== defaultValues.obs ||
         JSON.stringify(pnts) !== JSON.stringify(defaultValues.pnts) ||
         JSON.stringify(mils) !== JSON.stringify(defaultValues.mils) ||
         JSON.stringify(etiquetasMissao) !==
            JSON.stringify(defaultValues.etiquetas),
      [
         nDoc,
         tipoDoc,
         desc,
         tipo,
         afast,
         regres,
         acrecDesloc,
         ind,
         obs,
         pnts,
         mils,
         etiquetasMissao,
         defaultValues,
      ]
   );

   function handleFragMis() {
      const checkNDoc = nDoc != 0;
      const checkTipoDoc = tipoDoc != "";
      const checkDesc = desc != "";
      const checkTipo = tipo != "";
      const checkAfast = afast != "";
      const checkRegres = regres != "";
      const checkInd = ind != "";
      const checkPnts = pnts.length > 0;
      const checkMil = mils.length > 0;

      let errors = [];
      if (!checkNDoc) errors.push("- Tipo da Ordem");
      if (!checkTipoDoc) errors.push("- Documento Referência");
      if (!checkDesc) errors.push("- Descrição");
      if (!checkTipo) errors.push("- Tipo da Missão");
      if (!checkAfast) errors.push("- Data de Afastamento");
      if (!checkRegres) errors.push("- Data de Regresso");

      if (!checkInd) errors.push("- Natureza");
      if (!checkPnts) errors.push("- Pelo menos um Pernoite");
      if (!checkMil) errors.push("- Pelo menos um Militar");

      const dataAfast = new Date(afast);
      const dataRegres = new Date(regres);

      // Checagem adicional: afastamento não pode ser maior que regresso
      if (checkAfast && checkRegres) {
         if (dataAfast > dataRegres) {
            errors.push(
               "- Data de afastamento não pode ser maior que a de regresso"
            );
         }

         // Verifica se há pelo menos 8 horas entre afastamento e regresso
         const diffInHours =
            (dataRegres.getTime() - dataAfast.getTime()) / (1000 * 60 * 60);
         if (diffInHours < 8) {
            errors.push(
               "- Deve haver pelo menos 8 horas entre o afastamento e o regresso"
            );
         }
      }

      // Checar se pernoites não ultrapassam o afastamento e regresso
      // Normalizar datas para comparação (apenas dia/mês/ano)
      const dataAfastNorm = new Date(
         dataAfast.getFullYear(),
         dataAfast.getMonth(),
         dataAfast.getDate()
      );
      const dataRegresNorm = new Date(
         dataRegres.getFullYear(),
         dataRegres.getMonth(),
         dataRegres.getDate()
      );

      pnts.forEach((pnt) => {
         const [anoIni, mesIni, diaIni] = pnt.data_ini.split("-").map(Number);
         const pntIniNorm = new Date(anoIni, mesIni - 1, diaIni);

         const [anoFim, mesFim, diaFim] = pnt.data_fim.split("-").map(Number);
         const pntFimNorm = new Date(anoFim, mesFim - 1, diaFim);

         if (pntIniNorm < dataAfastNorm) {
            errors.push(
               `- O início do pernoite em ${pnt.cidade.nome}-${pnt.cidade.uf} esta conflito com a data de afastamento`
            );
         }
         if (pntFimNorm > dataRegresNorm) {
            errors.push(
               `- O fim do pernoite em ${pnt.cidade.nome}-${pnt.cidade.uf} esta conflito com a data de regresso`
            );
         }
      });

      if (errors.length > 0) {
         setValidationErrors(errors);
         setShowValidationModal(true);
         return;
      }

      onSave();
   }

   async function onSave() {
      const pntsWithFragId = missao
         ? pnts.map((p) => ({ ...p, frag_id: missao.id }))
         : pnts;

      const usersWithFragId = missao
         ? mils.map((p) => ({ ...p, frag_id: missao.id }))
         : mils;

      const fragMis: Missao = {
         id: missao ? missao.id : undefined,
         tipo_doc: tipoDoc,
         n_doc: nDoc,
         desc: desc,
         acrec_desloc: acrecDesloc,
         tipo: tipo,
         afast: afast,
         regres: regres,
         indenizavel: ind == "ind",
         obs: obs,
         pernoites: pntsWithFragId,
         users: usersWithFragId,
         etiquetas: etiquetasMissao,
      };

      createUpdateMutation.mutate(fragMis, {
         onSuccess: (result) => {
            if (result.ok) {
               push({
                  message: result.message || "Missão salva com sucesso",
                  type: "success",
               });
               setEditMode(false);
               setShow(false);
            } else {
               setErrorMessage(
                  result.message || "Erro desconhecido ao salvar missão"
               );
               setShowErrorModal(true);
            }
         },
         onError: (err: any) => {
            setErrorMessage(err?.message || "Erro ao salvar missão");
            setShowErrorModal(true);
         },
      });
   }

   function onDelete() {
      if (!missao?.id) return;

      deleteMutation.mutate(missao.id, {
         onSuccess: (result) => {
            if (result.ok) {
               push({
                  message: result.message || "Missão excluída com sucesso",
                  type: "success",
               });
               setShow(false);
            } else {
               setErrorMessage(
                  result.message || "Erro desconhecido ao deletar missão"
               );
               setShowErrorModal(true);
            }
         },
         onError: (err: any) => {
            setErrorMessage(err?.message || "Erro ao deletar missão");
            setShowErrorModal(true);
         },
      });
   }

   function handleClose() {
      if (missao) {
         setEditMode(false);
      }
      setClone(null);
      setShow(false);
   }

   useEffect(() => {
      const afastValido = afast && !isNaN(new Date(afast).getTime());
      const regresValido = regres && !isNaN(new Date(regres).getTime());
      setCheckAfastRegres(afastValido && regresValido);
   }, [afast, regres]);

   function setDefaultValues() {
      setTipoDoc(defaultValues.tipoDoc);
      setNDoc(defaultValues.nDoc);
      setDesc(defaultValues.desc);
      setTipo(defaultValues.tipo);
      setAfast(defaultValues.afast);
      setRegres(defaultValues.regres);
      setInd(defaultValues.ind);
      setObs(defaultValues.obs);
      setPnts(defaultValues.pnts);
      setMils(defaultValues.mils);
      setEtiquetasMissao(defaultValues.etiquetas);
   }

   useEffect(() => {
      if (show) {
         setDefaultValues();
         setEditMode(edit);
      }
   }, [show, defaultValues, edit]);

   function handleClone() {
      if (!missao) return;
      const clone = { ...missao, users: [], id: null };
      setClone(clone);
      setShow(false);
      setShowForm(true);
   }

   return (
      <>
         {showErrorModal && (
            <ErrorModal
               show={showErrorModal}
               onClose={() => setShowErrorModal(false)}
               errorMessage={errorMessage}
               errorTitle="Erro"
            />
         )}
         {showDeleteModal && (
            <DeleteMissionModal
               show={showDeleteModal}
               onClose={() => setShowDeleteModal(false)}
               onConfirm={onDelete}
               missionInfo={{
                  tipoDoc: tipoDoc,
                  nDoc: nDoc,
                  desc: desc,
               }}
            />
         )}
         {/* Modal de Validação */}
         {showValidationModal && (
         <Modal
            show={showValidationModal}
            onClose={() => setShowValidationModal(false)}
            size="md"
            dismissible
         >
            <ModalHeader className="border-b border-amber-200 bg-linear-to-r from-amber-50 to-orange-50">
               <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-100">
                     <FaExclamationTriangle className="text-xl text-amber-600" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-amber-900">
                        Validação de Campos
                     </h3>
                     <p className="text-sm text-amber-700">
                        Alguns campos precisam ser corrigidos
                     </p>
                  </div>
               </div>
            </ModalHeader>
            <ModalBody className="py-6">
               <div className="space-y-3">
                  <p className="mb-4 text-sm font-medium text-slate-700">
                     Por favor, verifique os seguintes itens:
                  </p>
                  <div className="space-y-2">
                     {validationErrors.map((error, index) => (
                        <div
                           key={index}
                           className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
                        >
                           <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100">
                              <span className="text-xs font-bold text-amber-700">
                                 {index + 1}
                              </span>
                           </div>
                           <p className="flex-1 text-sm leading-relaxed text-slate-700">
                              {error.replace(/^- /, "")}
                           </p>
                        </div>
                     ))}
                  </div>
               </div>
            </ModalBody>
            <ModalFooter className="border-t border-slate-200 bg-slate-50">
               <Button
                  color="blue"
                  onClick={() => setShowValidationModal(false)}
                  className="w-full font-semibold"
               >
                  Entendi
               </Button>
            </ModalFooter>
         </Modal>
         )}

         <Modal size="4xl" show={show} onClose={handleClose} dismissible>
            <ModalHeader className="border-b border-slate-200 pb-4">
               <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                     <FaPlaneDeparture className="text-blue-600" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-800">
                        {editMode && !missao
                           ? "Nova Missão"
                           : "Detalhes da Missão"}
                     </h2>
                     {!editMode && (
                        <p className="text-sm text-slate-500">
                           Visualizando informações da missão
                        </p>
                     )}
                  </div>
               </div>
            </ModalHeader>
            <ModalBody className="space-y-6 py-2">
               {/* Seção: Etiquetas */}
               <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                     <div className="h-4 w-1 rounded-full bg-blue-500"></div>
                     Etiquetas
                  </h3>

                  {/* Etiquetas selecionadas */}
                  {etiquetasMissao.length > 0 && (
                     <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                           {etiquetasMissao.map((etiqueta) => (
                              <span
                                 key={etiqueta.id}
                                 className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                                 style={{ backgroundColor: etiqueta.cor }}
                              >
                                 <HiTag className="h-3 w-3" />
                                 {etiqueta.nome}
                                 {editMode && (
                                    <button
                                       onClick={() => toggleEtiqueta(etiqueta)}
                                       className="ml-0.5 rounded-full p-0.5 hover:bg-white/20"
                                       title="Remover etiqueta"
                                    >
                                       <HiX className="h-3 w-3" />
                                    </button>
                                 )}
                              </span>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Seletor de etiquetas (modo edição) */}
                  {editMode && (
                     <div>
                        {loadingEtiquetas ? (
                           <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Spinner className="h-4 w-4" color="failure" />
                              Carregando etiquetas...
                           </div>
                        ) : etiquetasDisponiveis.length === 0 ? (
                           <p className="text-sm text-slate-500 italic">
                              Nenhuma etiqueta disponível. Crie etiquetas na aba
                              Configurações.
                           </p>
                        ) : (
                           <div className="flex flex-wrap gap-2">
                              {etiquetasDisponiveis
                                 .filter(
                                    (e) =>
                                       !etiquetasMissao.some(
                                          (em) => em.id === e.id
                                       )
                                 )
                                 .map((etiqueta) => (
                                    <button
                                       key={etiqueta.id}
                                       onClick={() => toggleEtiqueta(etiqueta)}
                                       className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-xs font-medium"
                                       style={{
                                          borderColor: etiqueta.cor,
                                          color: etiqueta.cor,
                                          backgroundColor: `${etiqueta.cor}10`,
                                       }}
                                       title={
                                          etiqueta.descricao ||
                                          "Clique para adicionar"
                                       }
                                    >
                                       <HiTag className="h-3 w-3" />
                                       {etiqueta.nome}
                                    </button>
                                 ))}
                           </div>
                        )}
                     </div>
                  )}

                  {/* Modo visualização sem etiquetas */}
                  {!editMode && etiquetasMissao.length === 0 && (
                     <p className="text-sm text-slate-500 italic">
                        Nenhuma etiqueta atribuída a esta missão.
                     </p>
                  )}
               </div>

               {/* Seção: Informações do Documento */}
               <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                     <div className="h-4 w-1 rounded-full bg-blue-500"></div>
                     Documento de Referência
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600">
                           Tipo de Ordem
                        </Label>
                        {editMode ? (
                           <Select
                              value={tipoDoc}
                              onChange={(e) => setTipoDoc(e.target.value)}
                              className="w-full"
                           >
                              <option value=""></option>
                              <option value="om">Ordem de Missão</option>
                              <option value="os">Ordem de Serviço</option>
                           </Select>
                        ) : (
                           <div className="rounded-lg border border-slate-200 bg-white px-4 py-2">
                              <span className="text-base font-semibold text-slate-800 uppercase">
                                 {tipoDoc}
                              </span>
                           </div>
                        )}
                     </div>
                     <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600">
                           Nº do Documento
                        </Label>
                        {editMode ? (
                           <TextInput
                              className="w-full"
                              value={nDoc ?? ""}
                              onChange={(e) =>
                                 setNDoc(
                                    e.target.value === ""
                                       ? undefined
                                       : Number(e.target.value)
                                 )
                              }
                              onKeyDown={(e) => {
                                 if (
                                    !(
                                       (e.key >= "0" && e.key <= "9") ||
                                       [
                                          "Backspace",
                                          "Tab",
                                          "Delete",
                                          "ArrowLeft",
                                          "ArrowRight",
                                       ].includes(e.key)
                                    )
                                 ) {
                                    e.preventDefault();
                                 }
                              }}
                           />
                        ) : (
                           <div className="rounded-lg border border-slate-200 bg-white px-4 py-2">
                              <span className="text-base font-semibold text-slate-800">
                                 {nDoc}
                              </span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Seção: Descrição */}
               <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                     <div className="h-4 w-1 rounded-full bg-blue-500"></div>
                     Descrição
                  </h3>
                  {editMode ? (
                     <TextInput
                        className="w-full"
                        placeholder="OFRAG XXX - APOIO XXX"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                     />
                  ) : (
                     <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <p className="text-base font-medium text-slate-800 uppercase">
                           {desc}
                        </p>
                     </div>
                  )}
               </div>

               {/* Seção: Classificação */}
               <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                     <div className="h-4 w-1 rounded-full bg-blue-500"></div>
                     Classificação
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label className="mr-2 text-sm font-medium text-slate-600">
                           Tipo de Missão
                        </Label>
                        {editMode ? (
                           <Select
                              value={tipo}
                              onChange={(e) => setTipo(e.target.value)}
                              className="w-full"
                           >
                              <option value="" disabled></option>
                              <option value="tal">
                                 TAL - Transporte Aerologístico
                              </option>
                              <option value="opr">OPR - Operacional</option>
                              <option value="adm">ADM - Administrativo</option>
                           </Select>
                        ) : (
                           <div className="inline-block">
                              <span
                                 className={clsx(
                                    "inline-flex items-center rounded-lg px-3 py-2 text-sm font-bold tracking-wide text-white uppercase shadow-sm",
                                    {
                                       "bg-amber-500": tipo === "opr",
                                       "bg-blue-500": tipo === "adm",
                                       "bg-green-500": tipo === "tal",
                                    }
                                 )}
                              >
                                 {tipo}
                              </span>
                           </div>
                        )}
                     </div>
                     <div className="space-y-2">
                        <Label className="mr-2 text-sm font-medium text-slate-600">
                           Natureza
                        </Label>
                        {editMode ? (
                           <Select
                              value={ind}
                              onChange={(e) => setInd(e.target.value)}
                              className="w-full"
                           >
                              <option disabled value=""></option>
                              <option value="n_ind">NÃO INDENIZÁVEL</option>
                              <option value="ind">INDENIZÁVEL</option>
                           </Select>
                        ) : (
                           <div className="inline-block">
                              <span
                                 className={clsx(
                                    "inline-flex items-center rounded-lg px-4 py-2 text-sm font-bold tracking-wide uppercase shadow-sm",
                                    {
                                       "bg-emerald-500 text-white":
                                          ind == "ind",
                                       "bg-slate-200 text-slate-700":
                                          ind == "n_ind",
                                    }
                                 )}
                              >
                                 {ind == "ind" && "Indenizável"}
                                 {ind == "n_ind" && "Não Indenizável"}
                              </span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Seção: Datas e Deslocamento */}
               <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                     <div className="h-4 w-1 rounded-full bg-blue-500"></div>
                     Período e Deslocamento
                  </h3>
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="space-y-2">
                           <Label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                              <FaPlaneDeparture className="text-slate-500" />
                              Afastamento
                           </Label>
                           {editMode ? (
                              <DateTimePicker
                                 value={afast}
                                 setValue={setAfast}
                              />
                           ) : (
                              <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-linear-to-r from-yellow-100 to-yellow-200 px-4 py-3 shadow-sm">
                                 <FaPlaneDeparture className="text-lg text-yellow-700" />
                                 <span className="font-semibold text-slate-800">
                                    {new Date(afast).toLocaleDateString(
                                       "pt-BR",
                                       {
                                          year: "numeric",
                                          month: "numeric",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                       }
                                    )}
                                 </span>
                              </div>
                           )}
                        </div>

                        <div className="space-y-2">
                           <Label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                              <FaPlaneArrival className="text-slate-500" />
                              Regresso
                           </Label>
                           {editMode ? (
                              <DateTimePicker
                                 value={regres}
                                 setValue={setRegres}
                              />
                           ) : (
                              <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-linear-to-r from-yellow-100 to-yellow-200 px-4 py-3 shadow-sm">
                                 <FaPlaneArrival className="text-lg text-yellow-700" />
                                 <span className="font-semibold text-slate-800">
                                    {new Date(regres).toLocaleDateString(
                                       "pt-BR",
                                       {
                                          year: "numeric",
                                          month: "numeric",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                       }
                                    )}
                                 </span>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="flex items-center gap-3 border-t border-slate-200 pt-2">
                        <Label
                           className="font-medium text-slate-500"
                           htmlFor="ac_desloc"
                        >
                           Acréscimo de Deslocamento:
                        </Label>
                        {editMode ? (
                           <Checkbox
                              id="ac_desloc"
                              color="blue"
                              onChange={(e) => setAcrecDesloc(e.target.checked)}
                              className="size-5"
                              checked={acrecDesloc}
                           />
                        ) : (
                           <span
                              className={clsx(
                                 "rounded-md px-3 py-1 font-semibold uppercase",
                                 {
                                    "bg-green-100 text-green-700": acrecDesloc,
                                    "bg-slate-200 text-slate-600": !acrecDesloc,
                                 }
                              )}
                           >
                              {acrecDesloc ? "Sim" : "Não"}
                           </span>
                        )}
                     </div>
                  </div>
               </div>

               {/* Seção: Observações */}
               <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                     <div className="h-4 w-1 rounded-full bg-blue-500"></div>
                     Observações
                  </h3>
                  {editMode ? (
                     <Textarea
                        value={obs}
                        onChange={(e) => setObs(e.target.value)}
                        placeholder="RETORNO OM XXX"
                        rows={4}
                        className="w-full"
                     />
                  ) : (
                     <div className="min-h-25 rounded-lg border border-slate-200 bg-white px-4 py-3">
                        {obs ? (
                           <p className="whitespace-pre-wrap text-slate-700">
                              {obs}
                           </p>
                        ) : (
                           <div className="flex h-full items-center justify-center text-sm text-slate-400 italic">
                              Nenhuma observação adicionada
                           </div>
                        )}
                     </div>
                  )}
               </div>

               {/* Seção: Pernoites */}
               <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                     <div className="h-4 w-1 rounded-full bg-blue-500"></div>
                     Pernoites
                  </h3>

                  {pnts.length == 0 && (
                     <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-8">
                        <p className="text-sm text-slate-400 italic">
                           Nenhum pernoite adicionado
                        </p>
                     </div>
                  )}

                  <div className="space-y-2">
                     {sortedPnts.map((pnt, index: number) => {
                        return (
                           <MissionPernoite
                              key={index}
                              pnt={pnt}
                              edit={editMode}
                              afast={afast}
                              regres={regres}
                              pnts={pnts}
                              setPnts={setPnts}
                           />
                        );
                     })}
                  </div>

                  <FormPernoite
                     afast={afast}
                     regres={regres}
                     showFormPnt={formPnt}
                     setShowFormPnt={setFormPnt}
                     pnts={pnts}
                     setPnts={setPnts}
                  />

                  {editMode && (
                     <Button
                        color="blue"
                        size="sm"
                        onClick={() => setFormPnt(true)}
                        disabled={!checkAfastRegres}
                        className="mt-4 w-full font-semibold"
                     >
                        + Adicionar Pernoite
                     </Button>
                  )}
               </div>

               {/* Seção: Militares */}
               <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                     <div className="h-4 w-1 rounded-full bg-blue-500"></div>
                     Militares
                  </h3>

                  {mils.length == 0 && (
                     <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-8">
                        <p className="text-sm text-slate-400 italic">
                           Nenhum militar adicionado
                        </p>
                     </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 font-medium uppercase md:grid-cols-3 lg:grid-cols-4">
                     {mils.map((userMis) => {
                        return (
                           <MissionMilitar
                              key={userMis.user_id}
                              edit={editMode}
                              userMis={userMis}
                              mils={mils}
                              setMils={setMils}
                           />
                        );
                     })}
                  </div>

                  {formMil && (
                     <FormMilitar
                        show={formMil}
                        setShow={setFormMil}
                        mils={mils}
                        setMils={setMils}
                     />
                  )}

                  {editMode && (
                     <Button
                        color="blue"
                        size="sm"
                        onClick={() => setFormMil(true)}
                        className="mt-4 w-full font-semibold"
                     >
                        + Adicionar Militar
                     </Button>
                  )}
               </div>
            </ModalBody>
            <ModalFooter className="border-t border-slate-200 bg-slate-50">
               <div className="flex w-full justify-center gap-3">
                  {!editMode ? (
                     <>
                        <Button
                           color="blue"
                           onClick={() => setEditMode(true)}
                           className="px-6 py-2.5 font-semibold"
                        >
                           Editar
                        </Button>
                        <Button
                           color="gray"
                           onClick={handleClone}
                           className="px-6 py-2.5 font-semibold"
                        >
                           <FaRegClone className="mr-2" />
                           Clonar
                        </Button>
                        <Button
                           color="red"
                           onClick={() => setShowDeleteModal(true)}
                           className="px-6 py-2.5 font-semibold"
                        >
                           Deletar
                        </Button>
                     </>
                  ) : (
                     <>
                        {missao && (
                           <Button
                              onClick={() => {
                                 setEditMode(false);
                                 setDefaultValues();
                              }}
                              color="alternative"
                              className="px-6 py-2.5 font-semibold"
                           >
                              Cancelar
                           </Button>
                        )}
                        <Button
                           onClick={handleFragMis}
                           color="blue"
                           disabled={!isChanged || isLoading}
                           className="px-8 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                        >
                           {isLoading ? (
                              <div className="flex items-center gap-2">
                                 <Spinner size="sm" color="failure" />
                                 <span>Salvando...</span>
                              </div>
                           ) : missao ? (
                              "Salvar Alterações"
                           ) : (
                              "Criar Missão"
                           )}
                        </Button>
                     </>
                  )}
               </div>
            </ModalFooter>
         </Modal>
      </>
   );
}
