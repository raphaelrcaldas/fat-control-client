import { UserPublic } from "services/routes/users";
import {
   isoToMonthInput,
   monthInputToIso,
   previousMonthInput,
} from "@/../utils/dateHandler";
import { DadosBancariosWithUser } from "services/routes/cegep/dadosBancarios";

export interface DadosBancariosFormData {
   banco: string;
   codigo_banco: string;
   agencia: string;
   conta: string;
   remuneracao: string;
   mes_ano: string;
   aux_transp: string;
}

/** Form vazio (modo criação) — mês default é o anterior ao atual. */
export function createEmptyForm(): DadosBancariosFormData {
   return {
      banco: "",
      codigo_banco: "",
      agencia: "",
      conta: "",
      remuneracao: "",
      mes_ano: previousMonthInput(),
      aux_transp: "",
   };
}

/** Preenche o form a partir de um registro existente (modo edição). */
export function formFromDados(
   dados: DadosBancariosWithUser
): DadosBancariosFormData {
   return {
      banco: dados.banco,
      codigo_banco: dados.codigo_banco,
      agencia: dados.agencia,
      conta: dados.conta,
      remuneracao: dados.remuneracao != null ? String(dados.remuneracao) : "",
      mes_ano: dados.mes_ano
         ? isoToMonthInput(dados.mes_ano)
         : previousMonthInput(),
      aux_transp: dados.aux_transp != null ? String(dados.aux_transp) : "",
   };
}

/** Validação pura do formulário. Não tem side-effects. */
export function validateDadosBancariosForm(
   formData: DadosBancariosFormData,
   opts: { isEdit: boolean; selectedUser: UserPublic | null }
): Record<string, string> {
   const errors: Record<string, string> = {};

   if (!opts.isEdit && !opts.selectedUser) {
      errors.user = "Selecione um usuário";
   }
   if (!formData.banco.trim()) {
      errors.banco = "Banco é obrigatório";
   }
   if (!formData.codigo_banco.trim()) {
      errors.codigo_banco = "Código do banco é obrigatório";
   }
   if (!formData.agencia.trim()) {
      errors.agencia = "Agência é obrigatória";
   }
   if (!formData.conta.trim()) {
      errors.conta = "Conta é obrigatória";
   }

   // Remuneração e aux_transp são opcionais — só validar se preenchidos
   if (formData.remuneracao !== "") {
      const n = Number(formData.remuneracao);
      if (Number.isNaN(n) || n < 0) {
         errors.remuneracao = "Remuneração inválida";
      }
   }
   if (formData.aux_transp !== "") {
      const n = Number(formData.aux_transp);
      if (Number.isNaN(n) || n < 0) {
         errors.aux_transp = "Auxílio transporte inválido";
      }
   }

   return errors;
}

/** Converte o estado do form no payload da API (strings → number|null, mês → ISO). */
export function toDadosBancariosPayload(formData: DadosBancariosFormData) {
   return {
      banco: formData.banco,
      codigo_banco: formData.codigo_banco,
      agencia: formData.agencia,
      conta: formData.conta,
      remuneracao:
         formData.remuneracao === "" ? null : Number(formData.remuneracao),
      mes_ano: formData.mes_ano ? monthInputToIso(formData.mes_ano) : null,
      aux_transp:
         formData.aux_transp === "" ? null : Number(formData.aux_transp),
   };
}
