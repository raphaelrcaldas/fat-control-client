import { useState, useEffect, useMemo, useRef } from "react";
import type {
   OrdemMissaoOut,
   OrdemMissaoCreate,
   OrdemMissaoUpdate,
   EtapaOut,
   CampoEspecial,
   Etiqueta,
} from "services/routes/om/ordens";
import { type CrewMember } from "services/routes/trips";
import { type FuncType } from "@/constants/tripulantes";
import { calcularEsfAer } from "../utils/ordemUtils";
import {
   buildInitialState,
   sortEtapas,
   toOrdemPayload,
   type OrdemFormInitialState,
   type TripulacaoOrdem,
} from "../utils/ordemFormUtils";
import {
   getContinuidadeErrors,
   getDuplicateDtDepErrors,
   getEsfAerMinimoViolado,
   getEtapaRequiredErrors,
   getErroTempoVooMinimo,
   getErroTvooAltMinimo,
   getOverlapErrors,
   type OrdemValidationFlags,
} from "../utils/ordemValidation";
import { useCreateOrdem, useFuncoes, useUpdateOrdem } from "@/hooks/queries";
import { minutesToTime } from "utils/dateHandler";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import { formatOrdemError } from "../../../ordemErrors";

interface UseOrdemFormProps {
   ordem: OrdemMissaoOut | null;
   isNew: boolean;
   isCloning?: boolean;
   onSave: () => void;
   /**
    * Chamado quando, ao aprovar uma OM nova/clonada, o rascunho já foi criado
    * no backend mas a transição para "aprovada" falhou. Sem isso a tela
    * permanece em /nova e um novo clique em Aprovar cria outro rascunho
    * duplicado — quem chama deve navegar para o rascunho recém-criado.
    */
   onDraftCreated?: (id: number, message: string) => void;
}

export const useOrdemForm = ({
   ordem,
   isNew,
   isCloning = false,
   onSave,
   onDraftCreated,
}: UseOrdemFormProps) => {
   // TanStack Query mutations - invalidacao automatica
   const createOrdemMutation = useCreateOrdem();
   const updateOrdemMutation = useUpdateOrdem();
   // Funções operadas pela unidade: definem as colunas da tripulação.
   const { principais } = useFuncoes();
   const codigosFunc = useMemo(
      () => principais.map((f) => f.cod),
      [principais]
   );

   // Estado inicial calculado UMA vez por mount (o padrão anterior repetia
   // buildInitialState em cada inicializador de useState — 5 execuções)
   const initialRef = useRef<OrdemFormInitialState | null>(null);
   initialRef.current ??= buildInitialState(ordem, isCloning, codigosFunc);
   const initial = initialRef.current;

   const [formData, setFormData] = useState<OrdemMissaoOut>(initial.formData);
   const [tripulacao, setTripulacao] = useState<TripulacaoOrdem>(
      initial.tripulacao
   );
   const [camposEspeciais, setCamposEspeciais] = useState<CampoEspecial[]>(
      initial.camposEspeciais
   );
   // Flag de override: true quando o usuário editou o esf_aer manualmente.
   // Enquanto false, o esf_aer espelha exatamente a soma das etapas.
   const [esfAerManual, setEsfAerManual] = useState<boolean>(
      initial.esfAerManual
   );

   // Estado para valores originais (detecção de mudanças)
   const [originalData, setOriginalData] = useState(initial);

   // Estados de loading e erro
   const [isSaving, setIsSaving] = useState(false);
   const [isApproving, setIsApproving] = useState(false);
   const [isCancelling, setIsCancelling] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [formValidationErrors, setFormValidationErrors] = useState<string[]>(
      []
   );

   // Estado de modo somente leitura (separado da editabilidade)
   const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);

   // true quando o servidor devolveu uma `ordem` diferente da que originou o
   // formData atual enquanto havia alteração local não salva (outro usuário
   // editou a mesma OM). Exibido como aviso em vez de resetar o formulário
   // por baixo do usuário (ver `applyServerChange` abaixo).
   const [serverChanged, setServerChanged] = useState(false);

   // Só é atualizado no fim do effect de sincronização — não é o próprio
   // `ordem` porque assim conseguimos comparar o novo valor com o anterior.
   const lastSyncedOrdemRef = useRef(ordem);

   // Lido dentro do effect sem virar dependência: precisamos do valor mais
   // recente de hasChanges no momento em que `ordem` muda de referência, sem
   // reexecutar o effect a cada tecla digitada.
   const hasChangesRef = useRef(false);

   // Memoiza a comparação para evitar JSON.stringify em cada render.
   // Etiquetas entram como ids ordenados: o LabelPicker devolve na ordem do
   // catálogo, mas a relação `OrdemMissao.etiquetas` do backend não tem
   // `order_by` (ordem arbitrária) — marcar e desmarcar a mesma etiqueta
   // acusaria mudança. Idem renomear no gerenciador (o objeto do catálogo
   // substitui o embutido). Ordenar por nome não serve: a collation do
   // Postgres e o `localeCompare` divergem em acento/emoji.
   const hasChanges = useMemo(() => {
      const semEtiquetas = (data: OrdemMissaoOut) => ({
         ...data,
         etiquetas: (data.etiquetas ?? [])
            .map((e) => e.id)
            .sort((a, b) => a - b),
      });
      return (
         JSON.stringify(semEtiquetas(formData)) !==
            JSON.stringify(semEtiquetas(originalData.formData)) ||
         JSON.stringify(tripulacao) !==
            JSON.stringify(originalData.tripulacao) ||
         JSON.stringify(camposEspeciais) !==
            JSON.stringify(originalData.camposEspeciais)
      );
   }, [formData, tripulacao, camposEspeciais, originalData]);

   // Declarado ANTES do efeito de sincronização de propósito: efeitos rodam
   // na ordem de declaração, e se a primeira edição e a nova `ordem` caírem
   // no mesmo commit, a sincronização precisa já ler o hasChanges atualizado
   // — senão lê `false` e sobrescreve a edição.
   useEffect(() => {
      hasChangesRef.current = hasChanges;
   }, [hasChanges]);

   // Sincronizar o formData quando a ordem ou isCloning mudar — exceto quando
   // há alteração local não salva: nesse caso, sinaliza `serverChanged` e
   // preserva o que o usuário está editando. O gatilho real de `ordem` nova
   // é o refetch ao reconectar a rede, ao remontar ou por invalidação da
   // query (`refetchOnWindowFocus` está desligado em lib/queryClient.ts).
   useEffect(() => {
      const ordemMudouNoServidor =
         lastSyncedOrdemRef.current !== null &&
         ordem !== null &&
         ordem !== lastSyncedOrdemRef.current;

      if (ordemMudouNoServidor && hasChangesRef.current) {
         setServerChanged(true);
         return;
      }

      lastSyncedOrdemRef.current = ordem;

      const next = buildInitialState(ordem, isCloning, codigosFunc);
      initialRef.current = next;

      setFormData(next.formData);
      setTripulacao(next.tripulacao);
      setCamposEspeciais(next.camposEspeciais);
      setEsfAerManual(next.esfAerManual);

      // Atualizar dados originais para detecção de mudanças
      setOriginalData(next);

      if (!ordem || isCloning) {
         setIsReadOnlyMode(false);
      } else {
         setIsReadOnlyMode(ordem.status !== "rascunho");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [ordem, isCloning, codigosFunc]);

   const isEditable = !isReadOnlyMode;

   // Aplica a versão do servidor por cima do formulário, descartando as
   // alterações locais — acionado pelo botão "Recarregar" do Alert de aviso.
   const applyServerChange = () => {
      resetForm();
      if (!ordem || isCloning) {
         setIsReadOnlyMode(false);
      } else {
         setIsReadOnlyMode(ordem.status !== "rascunho");
      }
   };

   const toggleReadOnlyMode = () => {
      setIsReadOnlyMode((prev) => !prev);
   };

   // Resolve o esf_aer da OM ao gerenciar etapas:
   // - sem override manual: espelha exatamente a soma das etapas (recalcula
   //   inclusive para baixo ao remover/encurtar etapas);
   // - com override manual: preserva o valor alocado, apenas elevando-o ao
   //   mínimo (soma das etapas) para nunca violar a regra esf_aer >= soma.
   const resolveEsfAer = (newEtapas: EtapaOut[]): number => {
      const soma = calcularEsfAer(newEtapas);
      return esfAerManual ? Math.max(formData.esf_aer ?? 0, soma) : soma;
   };

   const handleRemoveEtapa = (index: number) => {
      if (!isEditable || formData.etapas.length <= 1) return;
      const newEtapas = formData.etapas.filter((_, i) => i !== index);
      setFormData({
         ...formData,
         etapas: newEtapas,
         esf_aer: resolveEsfAer(newEtapas),
      });
   };

   // Atualizar uma etapa inteira (usado pelo modal de edição)
   const updateEtapa = (index: number, etapa: EtapaOut) => {
      if (!isEditable) return;
      const updated = [...formData.etapas];
      updated[index] = etapa;

      // O estado mantém as etapas sempre ordenadas por decolagem (tabela,
      // "Etapa N", continuidade e referenceEtapa do modal dependem da ordem
      // do array) — a propagação "origem da próxima = destino desta" precisa
      // rodar DEPOIS de ordenar, localizando o novo índice da etapa editada
      // pela referência do objeto recebido (indexOf).
      const newEtapas = sortEtapas(updated);
      const newIndex = newEtapas.indexOf(etapa);

      // Só propaga se a etapa ficou na mesma posição. Se mudar o dt_dep a
      // fez trocar de lugar, a "próxima" passou a ser outra etapa que a
      // pessoa não tocou — reescrever a origem dela em silêncio corrompe a
      // rota (ex.: A SBGL→SBBR 10:00, B SBBR→SBSP 14:00; B para 08:00
      // transformaria A em SBSP→SBBR). A validação de continuidade acusa a
      // quebra para correção manual.
      if (newIndex === index && newIndex < newEtapas.length - 1 && etapa.dest) {
         newEtapas[newIndex + 1] = {
            ...newEtapas[newIndex + 1],
            origem: etapa.dest,
         };
      }

      setFormData({
         ...formData,
         etapas: newEtapas,
         esf_aer: resolveEsfAer(newEtapas),
      });
   };

   // Adicionar nova etapa (usado pelo modal de adição)
   const addEtapa = (etapa: EtapaOut) => {
      if (!isEditable) return;
      const newEtapas = sortEtapas([...formData.etapas, etapa]);
      setFormData({
         ...formData,
         etapas: newEtapas,
         esf_aer: resolveEsfAer(newEtapas),
      });
   };

   const updateFormData = (updates: Partial<OrdemMissaoOut>) => {
      if (!isEditable) return;
      // Edição manual do esf_aer marca o override, congelando o recálculo
      // automático a partir das etapas.
      if ("esf_aer" in updates) {
         setEsfAerManual(true);
      }
      setFormData({ ...formData, ...updates });
   };

   const addTripulante = (funcao: FuncType, tripulante: CrewMember) => {
      if (!isEditable) return;
      if (tripulacao[funcao].some((t) => t.id === tripulante.id)) return;

      const updatedList = [...tripulacao[funcao], tripulante].sort((a, b) =>
         compareByAntiguidade(a.user, b.user)
      );

      setTripulacao({
         ...tripulacao,
         [funcao]: updatedList,
      });
   };

   const removeTripulante = (funcao: FuncType, tripulanteId: number) => {
      if (!isEditable) return;
      setTripulacao({
         ...tripulacao,
         [funcao]: tripulacao[funcao].filter((t) => t.id !== tripulanteId),
      });
   };

   // Descartar volta à `ordem` atual, que pode já ser a versão nova do
   // servidor (aviso `serverChanged`): o baseline e a marca de sincronização
   // acompanham, senão o aviso sobra e o form acusa alteração que não existe.
   const resetForm = () => {
      lastSyncedOrdemRef.current = ordem;
      const next = buildInitialState(ordem, isCloning, codigosFunc);
      initialRef.current = next;
      setFormData(next.formData);
      setTripulacao(next.tripulacao);
      setCamposEspeciais(next.camposEspeciais);
      setEsfAerManual(next.esfAerManual);
      setOriginalData(next);
      setServerChanged(false);
      setError(null);
      setFormValidationErrors([]);
   };

   const updateCamposEspeciais = (campos: CampoEspecial[]) => {
      if (!isEditable) return;
      setCamposEspeciais(campos);
   };

   const updateEtiquetas = (etiquetas: Etiqueta[]) => {
      if (!isEditable) return;
      setFormData((prev) => ({ ...prev, etiquetas }));
   };

   const clearError = () => {
      setError(null);
   };

   const clearValidationErrors = () => {
      setFormValidationErrors([]);
   };

   // Validacao de campos individuais para feedback visual em tempo real.
   // A regra da OM (ver OrdemTripulacao.tsx) é: a ordem só sai sem
   // piloto/mecânico/loadmaster se a unidade não operar a função — o que já a
   // mantém fora das chaves de `tripulacao`. Por isso a função só é exigida
   // quando a chave existe; nunca acessar `.length` de chave ausente (o
   // catálogo de `useFuncoes()` pode chegar vazio no primeiro render).
   const getValidationErrors = (): OrdemValidationFlags => {
      return {
         tipo: !formData.tipo?.trim(),
         matriculaAeronave: !formData.matricula_anv,
         etapas: formData.etapas.length === 0,
         piloto: "pil" in tripulacao && tripulacao.pil.length === 0,
         mecanico: "mc" in tripulacao && tripulacao.mc.length === 0,
         loadmaster: "lm" in tripulacao && tripulacao.lm.length === 0,
      };
   };

   const validationErrors = getValidationErrors();

   // Regras compartilhadas em ../utils/ordemValidation (fonte única
   // também usada por EtapaModal e OrdemBasicInfo)

   // Campos obrigatórios de cada etapa, prefixados com "Etapa N:"
   const collectEtapaRequiredErrors = (etapas: EtapaOut[]): string[] =>
      etapas.flatMap((etapa, index) =>
         getEtapaRequiredErrors(etapa).map(
            (msg) => `Etapa ${index + 1}: ${msg}`
         )
      );

   // esf_aer da ordem >= soma do tempo de voo das etapas
   const collectEsfAerError = (): string[] => {
      const minimo = getEsfAerMinimoViolado(
         formData.esf_aer || 0,
         formData.etapas
      );
      if (minimo === null) return [];
      return [
         `Esforço Aéreo deve ser maior ou igual à soma do tempo de voo das etapas (${minutesToTime(minimo)})`,
      ];
   };

   const validateForm = (): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (validationErrors.tipo) {
         errors.push("Descrição da missão é obrigatória");
      }
      if (validationErrors.matriculaAeronave) {
         errors.push("Aeronave é obrigatória");
      }
      if (validationErrors.etapas) {
         errors.push("Pelo menos uma etapa é obrigatória");
      }
      if (validationErrors.piloto) {
         errors.push("Pelo menos 1 Piloto é obrigatório");
      }
      if (validationErrors.mecanico) {
         errors.push("Pelo menos 1 Mecânico é obrigatório");
      }
      if (validationErrors.loadmaster) {
         errors.push("Pelo menos 1 Loadmaster é obrigatório");
      }

      errors.push(...getDuplicateDtDepErrors(formData.etapas));
      errors.push(...getOverlapErrors(formData.etapas));
      errors.push(...collectEtapaRequiredErrors(formData.etapas));

      // Validacoes extras exigidas apenas na aprovacao
      formData.etapas.forEach((etapa, index) => {
         const etapaNum = index + 1;

         const erroTvooAlt = getErroTvooAltMinimo(etapa.tvoo_alt);
         if (erroTvooAlt) {
            errors.push(`Etapa ${etapaNum}: ${erroTvooAlt}`);
         }

         const erroTempoVoo = getErroTempoVooMinimo(etapa);
         if (erroTempoVoo) {
            errors.push(`Etapa ${etapaNum}: ${erroTempoVoo}`);
         }
      });

      errors.push(...getContinuidadeErrors(formData.etapas));
      errors.push(...collectEsfAerError());

      return {
         isValid: errors.length === 0,
         errors,
      };
   };

   // Validacao minima para salvar rascunho
   const validateDraft = (): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [
         ...collectEtapaRequiredErrors(formData.etapas),
         ...getOverlapErrors(formData.etapas),
         ...collectEsfAerError(),
      ];

      return {
         isValid: errors.length === 0,
         errors,
      };
   };

   // Converte o estado atual para o payload da API (regras em ordemFormUtils)
   const prepareApiData = (
      isApproved: boolean = false
   ): OrdemMissaoCreate | OrdemMissaoUpdate =>
      toOrdemPayload(formData, tripulacao, camposEspeciais, {
         isApproved,
         generatesNew: isNew || isCloning,
      });

   // Salvar como rascunho
   const handleSubmit = async (
      e: React.FormEvent
   ): Promise<{ success: boolean }> => {
      e.preventDefault();

      // Valida campos obrigatorios das etapas
      const draftValidation = validateDraft();
      if (!draftValidation.isValid) {
         setFormValidationErrors(draftValidation.errors);
         return { success: false };
      }

      setFormValidationErrors([]);
      setIsSaving(true);
      setError(null);

      try {
         const shouldGenerateNew = isNew || isCloning;
         const apiData = prepareApiData(false);

         if (shouldGenerateNew) {
            await createOrdemMutation.mutateAsync(apiData as OrdemMissaoCreate);
         } else {
            await updateOrdemMutation.mutateAsync({
               id: formData.id,
               data: apiData as OrdemMissaoUpdate,
            });
         }

         onSave();
         return { success: true };
      } catch (err) {
         console.error("Erro ao salvar ordem:", err);
         setError(formatOrdemError(err, "Erro ao salvar ordem de missão"));
         return { success: false };
      } finally {
         setIsSaving(false);
      }
   };

   // Valida a ordem para aprovação exibindo os erros encontrados;
   // usado antes de pedir a confirmação do usuário
   const validateForApproval = (): boolean => {
      const validation = validateForm();
      setFormValidationErrors(validation.errors);
      return validation.isValid;
   };

   // Elaborar (aprovar) ordem
   const handleElaborar = async (): Promise<{ success: boolean }> => {
      const validation = validateForm();

      if (!validation.isValid) {
         setFormValidationErrors(validation.errors);
         return { success: false };
      }

      setFormValidationErrors([]);
      setIsApproving(true);
      setError(null);

      try {
         const shouldGenerateNew = isNew || isCloning;
         const apiData = prepareApiData(true);

         if (shouldGenerateNew) {
            // O backend sempre cria como rascunho (regra de negócio),
            // então aprovar exige a transição em um segundo passo. Os dois
            // passos são tentados separadamente: se o create passar mas o
            // update falhar, o rascunho já existe no backend — reportamos
            // isso via onDraftCreated em vez de cair no catch genérico, que
            // deixaria a tela em /nova e um novo clique criaria outro
            // rascunho duplicado.
            const created = await createOrdemMutation.mutateAsync(
               apiData as OrdemMissaoCreate
            );
            try {
               await updateOrdemMutation.mutateAsync({
                  id: created.id,
                  data: { status: "aprovada" } as OrdemMissaoUpdate,
               });
            } catch (approveErr) {
               console.error(
                  "Rascunho criado, mas aprovação falhou:",
                  approveErr
               );
               onDraftCreated?.(
                  created.id,
                  formatOrdemError(
                     approveErr,
                     "Erro ao aprovar ordem de missão"
                  )
               );
               return { success: false };
            }
         } else {
            await updateOrdemMutation.mutateAsync({
               id: formData.id,
               data: apiData as OrdemMissaoUpdate,
            });
         }

         onSave();
         return { success: true };
      } catch (err) {
         console.error("Erro ao elaborar ordem:", err);
         setError(formatOrdemError(err, "Erro ao elaborar ordem de missão"));
         return { success: false };
      } finally {
         setIsApproving(false);
      }
   };

   // Cancelar ordem aprovada
   const handleCancelar = async (): Promise<{ success: boolean }> => {
      if (formData.status !== "aprovada") return { success: false };

      setIsCancelling(true);
      setError(null);

      try {
         await updateOrdemMutation.mutateAsync({
            id: formData.id,
            data: { status: "cancelada" } as OrdemMissaoUpdate,
         });

         onSave();
         return { success: true };
      } catch (err) {
         console.error("Erro ao cancelar ordem:", err);
         setError(formatOrdemError(err, "Erro ao cancelar ordem de missão"));
         return { success: false };
      } finally {
         setIsCancelling(false);
      }
   };

   return {
      formData,
      tripulacao,
      camposEspeciais,
      isEditable,
      isReadOnlyMode,
      toggleReadOnlyMode,
      isSaving,
      isApproving,
      serverChanged,
      applyServerChange,
      error,
      validationErrors,
      formValidationErrors,
      hasChanges,
      handleRemoveEtapa,
      updateEtapa,
      addEtapa,
      updateFormData,
      addTripulante,
      removeTripulante,
      updateCamposEspeciais,
      updateEtiquetas,
      resetForm,
      handleSubmit,
      validateForApproval,
      handleElaborar,
      handleCancelar,
      isCancelling,
      clearError,
      clearValidationErrors,
   };
};
