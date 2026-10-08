import { UserPublic } from "services/routes/users";
import {
   isoToMonthInput,
   monthInputToIso,
   previousMonthInput,
} from "@/../utils/dateHandler";
import type { ApiErrorLabels } from "@/../utils/apiErrors";
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

/** Rótulos dos campos para os erros de validação (422) vindos da API. */
export const DADOS_BANCARIOS_LABELS: ApiErrorLabels = {
   fields: {
      user_id: "Militar",
      banco: "Banco",
      codigo_banco: "Código do banco",
      agencia: "Agência",
      conta: "Conta",
      remuneracao: "Remuneração",
      mes_ano: "Mês/Ano",
      aux_transp: "Auxílio transporte",
   },
};

/** Mês/ano completo ("YYYY-MM"); o picker guarda seleção parcial no valor. */
export const isMesAnoCompleto = (value: string) => /^\d{4}-\d{2}$/.test(value);

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

/**
 * Preenche o form a partir de um registro existente (modo edição). Sem mês
 * salvo, o campo fica vazio: preenchê-lo com o mês anterior gravava uma
 * referência que ninguém escolheu ao salvar qualquer outra alteração.
 */
export function formFromDados(
   dados: DadosBancariosWithUser
): DadosBancariosFormData {
   return {
      banco: dados.banco,
      codigo_banco: dados.codigo_banco,
      agencia: dados.agencia,
      conta: dados.conta,
      remuneracao: dados.remuneracao != null ? String(dados.remuneracao) : "",
      mes_ano: isoToMonthInput(dados.mes_ano),
      aux_transp: dados.aux_transp != null ? String(dados.aux_transp) : "",
   };
}

/** Valor monetário opcional: vazio passa; senão ≥ 0 e até 2 casas (Numeric 14,2). */
function validarValor(value: string, rotulo: string): string | null {
   if (value === "") return null;
   const n = Number(value);
   if (Number.isNaN(n) || n < 0) return `${rotulo} inválido(a)`;
   // Antes da checagem de casas: String(n) vira notação exponencial acima de 1e21.
   if (n >= 1e12) return "Valor muito alto";
   if (!/^\d+(\.\d{1,2})?$/.test(String(n)))
      return "Use no máximo 2 casas decimais";
   return null;
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
   if (formData.mes_ano !== "" && !isMesAnoCompleto(formData.mes_ano)) {
      errors.mes_ano = "Informe o mês e o ano";
   }

   // Remuneração e aux_transp são opcionais — só validar se preenchidos
   const remuneracao = validarValor(formData.remuneracao, "Remuneração");
   if (remuneracao) errors.remuneracao = remuneracao;
   const auxTransp = validarValor(formData.aux_transp, "Auxílio transporte");
   if (auxTransp) errors.aux_transp = auxTransp;

   return errors;
}

/** Converte o estado do form no payload da API (strings → number|null, mês → ISO). */
export function toDadosBancariosPayload(formData: DadosBancariosFormData) {
   return {
      banco: formData.banco,
      codigo_banco: formData.codigo_banco,
      agencia: formData.agencia.trim(),
      conta: formData.conta.trim(),
      remuneracao:
         formData.remuneracao === "" ? null : Number(formData.remuneracao),
      mes_ano: isMesAnoCompleto(formData.mes_ano)
         ? monthInputToIso(formData.mes_ano)
         : null,
      aux_transp:
         formData.aux_transp === "" ? null : Number(formData.aux_transp),
   };
}
