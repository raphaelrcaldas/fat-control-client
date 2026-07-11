/**
 * Mapa de nomes de campo da API → labels amigáveis.
 * Fonte única usada na auditoria (UserAudit), nos avisos de completude
 * de cadastro (UserReadView) e na humanização dos erros de validação da
 * API (userErrors).
 */
export const USER_FIELD_LABELS: Record<string, string> = {
   nome_completo: "Nome Completo",
   cpf: "CPF",
   telefone: "Telefone",
   nasc: "Data de Nascimento",
   data_praca: "Data de Praça",
   email_pess: "Email Pessoal",
   p_g: "Posto/Graduação",
   quadro: "Quadro",
   esp: "Especialidade",
   nome_guerra: "Nome de Guerra",
   unidade: "Unidade",
   saram: "SARAM",
   id_fab: "ID FAB",
   email_fab: "Email Zimbra",
   ult_promo: "Última Promoção",
   ant_rel: "Antiguidade Relativa",
   active: "Status",
   password: "Senha",
   _senha: "Senha",
};
