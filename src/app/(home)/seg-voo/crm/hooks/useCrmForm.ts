import { useEffect, useState } from "react";
import { addYearsIso } from "utils/dateHandler";
import type { TripCrmOut, CrmUpsert } from "services/routes/seg-voo/crm";
import type { CrmFormData } from "../types";
import { crmFormSchema } from "../schemas/crmSchema";
import { VALIDADE_ANOS } from "../crmRules";

function buildInitialFormData(item: TripCrmOut): CrmFormData {
   return {
      data_realizacao: item.crm?.data_realizacao ?? "",
      data_validade: item.crm?.data_validade ?? "",
   };
}

/** Converte "" em null para o payload da API. */
function toPayload(form: CrmFormData): CrmUpsert {
   return {
      data_realizacao: form.data_realizacao || null,
      data_validade: form.data_validade || null,
   };
}

/**
 * Estado e validação do formulário de CRM.
 *
 * Ao informar a data de realização, a validade é pré-preenchida somando
 * {@link VALIDADE_ANOS} anos (via `addYearsIso`, imune a fuso). O reset depende
 * de `[show, item.trip_id]` (identidade estável) — nunca da referência do
 * objeto `item`, para não sobrescrever o que o usuário digita caso a query
 * revalide em background com o modal aberto.
 */
export function useCrmForm(item: TripCrmOut, show: boolean) {
   const [formData, setFormData] = useState<CrmFormData>(() =>
      buildInitialFormData(item)
   );

   useEffect(() => {
      if (show) setFormData(buildInitialFormData(item));
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [show, item.trip_id]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name === "data_realizacao") {
         setFormData((prev) => ({
            ...prev,
            data_realizacao: value,
            data_validade: value
               ? addYearsIso(value, VALIDADE_ANOS)
               : prev.data_validade,
         }));
      } else {
         setFormData((prev) => ({ ...prev, [name]: value }));
      }
   };

   /** Valida as regras cruzadas; retorna a 1ª mensagem de erro ou null. */
   const validate = (): string | null => {
      const result = crmFormSchema.safeParse(formData);
      if (result.success) return null;
      return result.error.issues[0]?.message ?? "Dados inválidos";
   };

   const buildPayload = () => toPayload(formData);

   return { formData, handleChange, validate, buildPayload };
}
