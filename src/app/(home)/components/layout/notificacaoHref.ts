import type { Notificacao } from "services/routes/notificacoes";

/**
 * Como cada tipo de notificação vira URL no client. Mesmo contrato do
 * FatBird (`fatbird/src/app/(home)/components/notificacaoHref.ts`): a
 * rota é decidida AQUI, nunca no `payload` do backend — os dois fronts têm
 * URLs diferentes para o mesmo recurso. Tipo desconhecido (emitido por
 * versão mais nova da API, ou específico do FatBird, que a `audiencia`
 * nem deixaria chegar aqui) fica sem link: o item continua legível, só
 * não navega.
 */
type RotaDeNotificacao = (n: Notificacao) => string | null;

/**
 * `<base>?id=<id>`, montada com o `recurso_id` da notificação — a conversa
 * de feedback abre num MODAL sobre a lista, e o `id` na query é o que a
 * lista lê para abri-lo (autor em `/feedback`, administração em
 * `/admin/feedback`). Sem id, ou com id que não é inteiro positivo,
 * devolve `null`: o item fica sem link (só marca como lido) em vez de
 * levar a uma URL que o backend responderia 404. A checagem é de VALOR,
 * não de tipo — `recurso_id` é `number | null` no tipo, mas o dado vem de
 * JSON e a garantia do TypeScript acaba na borda da rede.
 */
function modalPorRecursoId(base: string): RotaDeNotificacao {
   return (n) => {
      const id = n.recurso_id;
      if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
         return null;
      }
      return `${base}?id=${id}`;
   };
}

const HREF_POR_TIPO: Record<string, RotaDeNotificacao> = {
   "feedback.mensagem": modalPorRecursoId("/feedback"),
   "feedback.recebido": modalPorRecursoId("/admin/feedback"),
   "feedback.mensagem_autor": modalPorRecursoId("/admin/feedback"),
};

export function notificacaoHref(n: Notificacao): string | null {
   // `hasOwn`, não acesso direto: `tipo` vem do backend, e um valor como
   // "constructor" alcançaria o protótipo do objeto e devolveria uma
   // função (truthy) como se fosse rota.
   if (!Object.hasOwn(HREF_POR_TIPO, n.tipo)) return null;

   return HREF_POR_TIPO[n.tipo](n);
}

/**
 * `/admin/*` só responde no contexto Sistema (`require_system_admin`), mas
 * o aviso direto aparece em qualquer contexto — é da pessoa, não da org
 * ativa. O sino usa isto para trocar de contexto antes de navegar, em vez
 * de levar a um 403.
 */
export function exigeContextoSistema(href: string): boolean {
   return href.startsWith("/admin/");
}
