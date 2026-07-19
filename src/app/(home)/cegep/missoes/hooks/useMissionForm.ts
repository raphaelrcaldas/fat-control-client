import { useState, useMemo, useEffect } from "react";
import {
   Missao,
   Pernoite,
   UserMission,
   Etiqueta,
} from "services/routes/cegep/missoes";
import {
   useCreateUpdateMissao,
   useDeleteMissao,
} from "@/hooks/queries/useMissoes";
import { useToast } from "@/app/context/toast";
import { sanitizeLinha, sanitizeBloco } from "utils/sanitize";
import { formatMissaoSaveError } from "../missaoErrors";

interface UseMissionFormOptions {
   missao?: Missao | null;
   initialEdit: boolean;
   onClose: () => void;
   onClone?: () => void;
}

export function useMissionForm({
   missao,
   initialEdit,
   onClose,
   onClone,
}: UseMissionFormOptions) {
   const createUpdateMutation = useCreateUpdateMissao();
   const deleteMutation = useDeleteMissao();
   const { push } = useToast();

   const defaultValues = useMemo(
      () => ({
         tipoDoc: missao ? missao.tipo_doc : "",
         nDoc: missao ? missao.n_doc : "",
         desc: missao ? missao.desc : "",
         afast: missao ? missao.afast : "",
         regres: missao ? missao.regres : "",
         tipo: missao ? missao.tipo : "",
         ind: missao ? (missao.indenizavel ? "ind" : "n_ind") : "",
         acrecDesloc: missao ? missao.acrec_desloc : false,
         obs: missao ? missao.obs : "",
         pnts: missao ? (missao.pernoites ?? []) : [],
         mils: missao ? (missao.users ?? []) : [],
         etiquetas: missao ? (missao.etiquetas ?? []) : [],
      }),
      [missao]
   );

   const [editMode, setEditMode] = useState(initialEdit);
   const [tipoDoc, setTipoDoc] = useState(defaultValues.tipoDoc);
   const [nDoc, setNDoc] = useState(defaultValues.nDoc);
   const [desc, setDesc] = useState(defaultValues.desc);
   const [tipo, setTipo] = useState(defaultValues.tipo);
   const [afast, setAfast] = useState(defaultValues.afast);
   const [regres, setRegres] = useState(defaultValues.regres);
   const [acrecDesloc, setAcrecDesloc] = useState(defaultValues.acrecDesloc);
   const [ind, setInd] = useState(defaultValues.ind);
   const [obs, setObs] = useState(defaultValues.obs);
   const [pnts, setPnts] = useState<Pernoite[]>(defaultValues.pnts);
   const [mils, setMils] = useState<UserMission[]>(defaultValues.mils);
   const [etiquetasMissao, setEtiquetasMissao] = useState<Etiqueta[]>(
      defaultValues.etiquetas
   );

   const [showErrorModal, setShowErrorModal] = useState(false);
   const [errorMessage, setErrorMessage] = useState("");
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [showValidationModal, setShowValidationModal] = useState(false);
   const [validationErrors, setValidationErrors] = useState<string[]>([]);

   const isLoading = createUpdateMutation.isPending || deleteMutation.isPending;

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

   const toggleEtiqueta = (etiqueta: Etiqueta) => {
      const isSelected = etiquetasMissao.some((e) => e.id === etiqueta.id);
      if (isSelected) {
         setEtiquetasMissao((prev) => prev.filter((e) => e.id !== etiqueta.id));
      } else {
         setEtiquetasMissao((prev) => [...prev, etiqueta]);
      }
   };

   function setDefaultValues() {
      setTipoDoc(defaultValues.tipoDoc);
      setNDoc(defaultValues.nDoc);
      setDesc(defaultValues.desc);
      setTipo(defaultValues.tipo);
      setAfast(defaultValues.afast);
      setRegres(defaultValues.regres);
      setAcrecDesloc(defaultValues.acrecDesloc);
      setInd(defaultValues.ind);
      setObs(defaultValues.obs);
      setPnts(defaultValues.pnts);
      setMils(defaultValues.mils);
      setEtiquetasMissao(defaultValues.etiquetas);
   }

   useEffect(() => {
      setDefaultValues();
      setEditMode(initialEdit);
   }, [defaultValues, initialEdit]);

   function handleValidate() {
      const errors: string[] = [];
      if (!tipoDoc) errors.push("- Tipo da Ordem");
      if (!nDoc) errors.push("- Número do Documento");
      if (!desc) errors.push("- Descrição");
      if (!tipo) errors.push("- Tipo da Missão");
      if (!afast) errors.push("- Data de Afastamento");
      if (!regres) errors.push("- Data de Regresso");
      if (!ind) errors.push("- Natureza");
      if (pnts.length === 0) errors.push("- Pelo menos um Pernoite");
      if (mils.length === 0) errors.push("- Pelo menos um Militar");

      const dataAfast = new Date(afast);
      const dataRegres = new Date(regres);

      if (afast && regres) {
         if (dataAfast > dataRegres) {
            errors.push(
               "- Data de afastamento não pode ser maior que a de regresso"
            );
         }
         const diffInHours =
            (dataRegres.getTime() - dataAfast.getTime()) / (1000 * 60 * 60);
         if (diffInHours < 8) {
            errors.push(
               "- Deve haver pelo menos 8 horas entre o afastamento e o regresso"
            );
         }
      }

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
               `- O início do pernoite em ${pnt.cidade?.nome}-${pnt.cidade?.uf} esta conflito com a data de afastamento`
            );
         }
         if (pntFimNorm > dataRegresNorm) {
            errors.push(
               `- O fim do pernoite em ${pnt.cidade?.nome}-${pnt.cidade?.uf} esta conflito com a data de regresso`
            );
         }
      });

      if (errors.length > 0) {
         setValidationErrors(errors);
         setShowValidationModal(true);
         return false;
      }
      return true;
   }

   function handleSave() {
      if (!handleValidate()) return;

      const pntsWithFragId = (
         missao ? pnts.map((p) => ({ ...p, frag_id: missao.id })) : pnts
      ).map((p) => ({ ...p, obs: sanitizeBloco(p.obs ?? "") }));

      const usersWithFragId = missao
         ? mils.map((p) => ({ ...p, frag_id: missao.id }))
         : mils;

      const fragMis: Missao = {
         id: missao ? missao.id : undefined,
         tipo_doc: tipoDoc,
         n_doc: nDoc,
         desc: sanitizeLinha(desc),
         acrec_desloc: acrecDesloc,
         tipo,
         afast,
         regres,
         indenizavel: ind === "ind",
         obs: sanitizeBloco(obs),
         pernoites: pntsWithFragId,
         users: usersWithFragId,
         etiquetas: etiquetasMissao,
      };

      createUpdateMutation.mutate(fragMis, {
         onSuccess: (result) => {
            push({
               message: result.message || "Missão salva com sucesso",
               type: "success",
            });
            setEditMode(false);
            onClose();
         },
         onError: (err) => {
            setErrorMessage(
               formatMissaoSaveError(err, "Erro ao salvar missão")
            );
            setShowErrorModal(true);
         },
      });
   }

   function handleDelete() {
      if (!missao?.id) return;

      deleteMutation.mutate(missao.id, {
         onSuccess: (result) => {
            push({
               message: result.message || "Missão excluída com sucesso",
               type: "success",
            });
            onClose();
         },
         onError: (err) => {
            setErrorMessage(
               formatMissaoSaveError(err, "Erro ao deletar missão")
            );
            setShowErrorModal(true);
         },
      });
   }

   function handleClone() {
      if (!missao || !onClone) return;
      onClone();
   }

   function handleCancelEdit() {
      setEditMode(false);
      setDefaultValues();
   }

   return {
      // Estado do form
      editMode,
      setEditMode,
      tipoDoc,
      setTipoDoc,
      nDoc,
      setNDoc,
      desc,
      setDesc,
      tipo,
      setTipo,
      afast,
      setAfast,
      regres,
      setRegres,
      acrecDesloc,
      setAcrecDesloc,
      ind,
      setInd,
      obs,
      setObs,
      pnts,
      setPnts,
      mils,
      setMils,
      etiquetasMissao,
      toggleEtiqueta,

      // Derivados
      sortedPnts,
      isChanged,
      isLoading,

      // Modais
      showErrorModal,
      setShowErrorModal,
      errorMessage,
      showDeleteModal,
      setShowDeleteModal,
      showValidationModal,
      setShowValidationModal,
      validationErrors,

      // Ações
      handleSave,
      handleDelete,
      handleClone,
      handleCancelEdit,

      // Contexto
      missao,
      // Clone chega como objeto sem id — continua sendo missão nova
      isNew: !missao?.id,
   };
}

export type MissionFormState = ReturnType<typeof useMissionForm>;
