import { useCallback, useMemo, useState } from "react";
import type { EtapaDetail } from "services/routes/estatistica/etapas";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import type { FormData } from "../types";
import { DEFAULT_FORM, FIELD_LIMITS } from "../constants";
import { calcTvoo, timeToHHmm } from "../helpers";

type LimitKey = keyof typeof FIELD_LIMITS;

interface UseEtapaFormParams {
   show: boolean;
   isEdit: boolean;
   etapaDetail: EtapaDetail | undefined;
   missaoEtapas: EtapaItem[];
}

export function useEtapaForm(params: UseEtapaFormParams) {
   const { show, isEdit, etapaDetail, missaoEtapas } = params;

   const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
   const [errors, setErrors] = useState<
      Partial<Record<keyof FormData, string>>
   >({});

   // Computed tvoo
   const tvoo = useMemo(
      () => calcTvoo(formData.dep, formData.arr),
      [formData.dep, formData.arr]
   );

   const tvooValid = tvoo > 0 && tvoo % 5 === 0;

   // Field update helper with real-time numeric validation
   function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
      setFormData((prev) => ({ ...prev, [key]: value }));

      if (key in FIELD_LIMITS && value != null && value !== "") {
         const num = Number(value);
         const { min, max, label } = FIELD_LIMITS[key as LimitKey];
         if (!isNaN(num)) {
            if (num < min) {
               setErrors((prev) => ({
                  ...prev,
                  [key]: `${label} deve ser no mínimo ${min}`,
               }));
               return;
            }
            if (num > max) {
               setErrors((prev) => ({
                  ...prev,
                  [key]: `${label} deve ser no máximo ${max.toLocaleString("pt-BR")}`,
               }));
               return;
            }
         }
      }

      setErrors((prev) => {
         const next = { ...prev };
         delete next[key];
         return next;
      });
   }

   // Validation
   function validate(oiValid: boolean): boolean {
      const errs: Partial<Record<keyof FormData, string>> = {};
      if (!formData.data) errs.data = "Informe a data";
      if (!formData.origem || formData.origem.length !== 4)
         errs.origem = "Codigo ICAO deve ter 4 caracteres";
      if (!formData.destino || formData.destino.length !== 4)
         errs.destino = "Codigo ICAO deve ter 4 caracteres";
      if (!formData.dep) errs.dep = "Informe a hora de decolagem";
      if (!formData.arr) errs.arr = "Informe a hora de pouso";
      if (!formData.anv) errs.anv = "Selecione a aeronave";

      // Validate numeric field limits
      for (const [key, { min, max, label }] of Object.entries(FIELD_LIMITS)) {
         const val = formData[key as LimitKey];
         if (val == null) continue;
         const num = Number(val);
         if (num < min)
            errs[key as keyof FormData] = `${label} deve ser no mínimo ${min}`;
         else if (num > max)
            errs[key as keyof FormData] =
               `${label} deve ser no máximo ${max.toLocaleString("pt-BR")}`;
      }

      setErrors(errs);
      return Object.keys(errs).length === 0 && tvooValid && oiValid;
   }

   // Initialize form data from etapaDetail or defaults
   const initializeForm = useCallback(() => {
      setErrors({});

      if (isEdit && etapaDetail) {
         setFormData({
            data: String(etapaDetail.data),
            origem: etapaDetail.origem,
            destino: etapaDetail.destino,
            dep: timeToHHmm(etapaDetail.dep),
            arr: timeToHHmm(etapaDetail.arr),
            anv: etapaDetail.anv,
            pousos: etapaDetail.pousos,
            tow: etapaDetail.tow ?? null,
            pax: etapaDetail.pax ?? null,
            carga: etapaDetail.carga ?? null,
            comb: etapaDetail.comb ?? null,
            lub:
               etapaDetail.lub != null
                  ? Math.round(etapaDetail.lub * 10) / 10
                  : null,
            nivel: etapaDetail.nivel ?? "",
            sagem: etapaDetail.sagem,
            parte1: etapaDetail.parte1,
            obs: etapaDetail.obs ?? "",
         });
      } else {
         // Auto-fill from last etapa
         const lastEtapa =
            missaoEtapas.length > 0
               ? missaoEtapas[missaoEtapas.length - 1]
               : null;
         setFormData({
            ...DEFAULT_FORM,
            data: lastEtapa?.data ?? "",
            origem: lastEtapa?.destino ?? "",
            anv: lastEtapa?.anv ?? "",
            // Se o destino anterior era "ROTA", pré-preenche a decolagem
            // com o horário de pouso da etapa anterior (continuação em rota)
            dep: lastEtapa?.destino === "ROTA" ? timeToHHmm(lastEtapa.arr) : "",
         });
      }
   }, [isEdit, etapaDetail, missaoEtapas]);

   return {
      formData,
      setFormData,
      setField,
      errors,
      tvoo,
      tvooValid,
      validate,
      initializeForm,
   };
}
