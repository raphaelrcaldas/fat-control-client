import { useEffect, useState } from "react";
import type {
   TripPassaporteOut,
   PassaporteUpsert,
} from "services/routes/inteligencia/passaportes";
import type { PassaporteFormData } from "../types";
import { passaporteFormSchema } from "../schemas/passaporteSchema";

function buildInitialFormData(item: TripPassaporteOut): PassaporteFormData {
   const p = item.passaporte;
   return {
      passaporte: p?.passaporte ?? "",
      data_expedicao_passaporte: p?.data_expedicao_passaporte ?? "",
      validade_passaporte: p?.validade_passaporte ?? "",
      visa: p?.visa ?? "",
      data_expedicao_visa: p?.data_expedicao_visa ?? "",
      validade_visa: p?.validade_visa ?? "",
   };
}

/** Converte "" em null para o payload da API. */
function toPayload(form: PassaporteFormData): PassaporteUpsert {
   return {
      passaporte: form.passaporte || null,
      data_expedicao_passaporte: form.data_expedicao_passaporte || null,
      validade_passaporte: form.validade_passaporte || null,
      visa: form.visa || null,
      data_expedicao_visa: form.data_expedicao_visa || null,
      validade_visa: form.validade_visa || null,
   };
}

/**
 * Estado e validação do formulário de passaporte.
 *
 * O reset depende de `[show, item.trip_id]` (identidade estável) — nunca da
 * referência do objeto `item`, para não sobrescrever o que o usuário digita
 * caso a query revalide em background com o modal aberto.
 */
export function usePassaporteForm(item: TripPassaporteOut, show: boolean) {
   const [formData, setFormData] = useState<PassaporteFormData>(() =>
      buildInitialFormData(item)
   );

   useEffect(() => {
      if (show) setFormData(buildInitialFormData(item));
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [show, item.trip_id]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   /** Valida as regras cruzadas; retorna a 1ª mensagem de erro ou null. */
   const validate = (): string | null => {
      const result = passaporteFormSchema.safeParse(formData);
      if (result.success) return null;
      return result.error.issues[0]?.message ?? "Dados inválidos";
   };

   const buildPayload = () => toPayload(formData);

   return { formData, handleChange, validate, buildPayload };
}
