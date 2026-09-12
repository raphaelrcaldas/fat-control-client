import { useEffect, useMemo, useState } from "react";
import { daysInclusive, todayIso } from "utils/dateHandler";
import type { IndispMtv } from "@/constants/ops/indisponibilidades";
import { IndispType } from "services/routes/indisps";

export interface IndispFormValues {
   /** `""` é o estado "ainda não escolhido" — `validate()` o barra. */
   mtv: IndispMtv | "";
   dateStart: string;
   dateEnd: string;
   obs: string;
}

/**
 * `initialDate` é o dia que a vaga "+" da grade clicou: criar dali já nasce
 * preenchido com aquela data, em vez de sempre com hoje.
 */
export function useIndispFormState(
   indisp: IndispType | null,
   initialDate?: string
) {
   const defaults = useMemo<IndispFormValues>(() => {
      const padrao = initialDate ?? todayIso();
      return {
         mtv: indisp?.mtv ?? "",
         dateStart: indisp?.date_start ?? padrao,
         dateEnd: indisp?.date_end ?? padrao,
         obs: indisp?.obs ?? "",
      };
   }, [indisp, initialDate]);

   const [values, setValues] = useState<IndispFormValues>(defaults);

   // Ressincroniza quando o registro editado muda (prop externa).
   useEffect(() => {
      setValues(defaults);
   }, [defaults]);

   const setField = <K extends keyof IndispFormValues>(
      field: K,
      value: IndispFormValues[K]
   ) => {
      setValues((prev) => {
         const next = { ...prev, [field]: value };
         // Fim nunca antes do início (ajuste no handler, não em efeito).
         if (
            field === "dateStart" &&
            next.dateEnd &&
            next.dateEnd < next.dateStart
         ) {
            next.dateEnd = next.dateStart;
         }
         return next;
      });
   };

   const reset = () => setValues(defaults);

   const isChanged =
      values.mtv !== defaults.mtv ||
      values.dateStart !== defaults.dateStart ||
      values.dateEnd !== defaults.dateEnd ||
      values.obs !== defaults.obs;

   const validate = (): string[] => {
      const msg: string[] = [];
      if (daysInclusive(values.dateStart, values.dateStart) === null) {
         msg.push("- Insira uma data de início válida!");
      }
      if (daysInclusive(values.dateEnd, values.dateEnd) === null) {
         msg.push("- Insira uma data final válida!");
      }
      if (values.mtv === "") msg.push("- Escolha um motivo");
      if (values.dateStart > values.dateEnd) {
         msg.push("- A data de início não deve ser maior que a data final");
      }
      return msg;
   };

   // Update: envia só os campos alterados. Create: envia tudo.
   // `validate()` roda antes e barra o motivo vazio, então aqui ele é sempre
   // um motivo do catálogo.
   const buildPayload = (userId: number): IndispType => {
      const mtv = values.mtv as IndispMtv;
      if (indisp) {
         const data = { id: indisp.id } as IndispType;
         if (values.mtv !== defaults.mtv) data.mtv = mtv;
         if (values.dateStart !== defaults.dateStart) {
            data.date_start = values.dateStart;
         }
         if (values.dateEnd !== defaults.dateEnd) {
            data.date_end = values.dateEnd;
         }
         if (values.obs !== defaults.obs) data.obs = values.obs.trim() || null;
         return data;
      }
      return {
         mtv,
         date_start: values.dateStart,
         date_end: values.dateEnd,
         obs: values.obs.trim() || null,
         user_id: userId,
      };
   };

   return { values, setField, reset, isChanged, validate, buildPayload };
}
