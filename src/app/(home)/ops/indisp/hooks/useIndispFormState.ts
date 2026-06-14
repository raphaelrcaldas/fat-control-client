import { useEffect, useMemo, useState } from "react";
import { todayIso } from "utils/dateHandler";
import { IndispType } from "services/routes/indisps";

export interface IndispFormValues {
   mtv: string;
   dateStart: string;
   dateEnd: string;
   obs: string;
}

export function useIndispFormState(indisp: IndispType | null) {
   const defaults = useMemo<IndispFormValues>(
      () => ({
         mtv: indisp?.mtv ?? "",
         dateStart: indisp?.date_start ?? todayIso(),
         dateEnd: indisp?.date_end ?? todayIso(),
         obs: indisp?.obs ?? "",
      }),
      [indisp]
   );

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
      if (isNaN(new Date(values.dateStart).getTime())) {
         msg.push("- Insira uma data de início válida!");
      }
      if (isNaN(new Date(values.dateEnd).getTime())) {
         msg.push("- Insira uma data final válida!");
      }
      if (values.mtv === "") msg.push("- Escolha um motivo");
      if (new Date(values.dateStart) > new Date(values.dateEnd)) {
         msg.push("- A data de início não deve ser maior que a data final");
      }
      return msg;
   };

   // Update: envia só os campos alterados. Create: envia tudo.
   const buildPayload = (userId: number): IndispType => {
      if (indisp) {
         const data = { id: indisp.id } as IndispType;
         if (values.mtv !== defaults.mtv) data.mtv = values.mtv;
         if (values.dateStart !== defaults.dateStart) {
            data.date_start = values.dateStart;
         }
         if (values.dateEnd !== defaults.dateEnd) {
            data.date_end = values.dateEnd;
         }
         if (values.obs !== defaults.obs) data.obs = values.obs;
         return data;
      }
      return {
         mtv: values.mtv,
         date_start: values.dateStart,
         date_end: values.dateEnd,
         obs: values.obs,
         user_id: userId,
      };
   };

   return { values, setField, reset, isChanged, validate, buildPayload };
}
