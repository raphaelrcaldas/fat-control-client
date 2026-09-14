import { isoDateToShort } from "@/../utils/dateHandler";
import type { RestricaoDerivada } from "services/routes/ops/restricoes";

/**
 * De onde uma faixa derivada vem, e para onde se vai para resolvê-la.
 *
 * Cada restrição derivada é calculada a partir de um registro que mora em
 * OUTRO módulo. Este mapa é o que fecha esse laço: sem ele, a ficha diria
 * "CEMAL vencido" e deixaria a pessoa procurar sozinha onde se lança um CEMAL.
 *
 * Só a operação tem deeplink, porque só ela tem um destino exato (o dossiê
 * daquela operação). CEMAL e desadaptação nascem de registros do próprio
 * militar, cujas telas são listas da unidade — levar até lá não pouparia a
 * busca, então ali fica só a instrução.
 *
 * Mora fora do componente porque é regra de domínio — qual módulo responde por
 * qual restrição — e não desenho de modal.
 */
export interface OrigemRestricao {
   /** Deeplink para o registro de origem; `null` quando não há tela própria. */
   href: string | null;
   /** Rótulo do botão. Diz o que acontece ao clicar, não "ver mais". */
   acao: string;
   /** Recurso e permissão que o deeplink exige — o botão some sem elas. */
   resource: string;
   perm: string;
   comoResolver: string;
}

export function origemDaRestricao(r: RestricaoDerivada): OrigemRestricao {
   switch (r.codigo) {
      case "operacao":
         return {
            // O id vem do backend junto da restrição: sem ele o link cairia
            // na lista e obrigaria a procurar a operação pelo nome.
            href: r.operacao_id
               ? `/ops/operacoes/${r.operacao_id}`
               : "/ops/operacoes",
            acao: "Abrir a operação",
            resource: "ops.operacoes",
            perm: "read",
            comoResolver:
               "Para mudar as datas, ajuste o período do militar na operação.",
         };
      case "cemal_ausente":
      case "cemal_vencido":
         return {
            // Sem deeplink: a tela de cartões de saúde é uma lista da unidade
            // inteira, não a ficha daquele militar — o link levaria para um
            // lugar onde ainda seria preciso procurar. A instrução basta.
            href: null,
            acao: "",
            resource: "aeromedica.cartoes",
            perm: "read",
            comoResolver:
               "Lance ou atualize o CEMAL no cartão de saúde do militar.",
         };
      case "desadaptacao":
         return {
            href: null,
            acao: "",
            resource: "estatistica.etapas",
            perm: "read",
            comoResolver:
               "A faixa some quando um voo novo do militar entrar nas etapas.",
         };
   }
}

/**
 * Uma frase que já diz tudo: quem, o quê e quando.
 *
 * O período vem embutido no texto em vez de numa grade de campos: das quatro
 * derivadas, três têm início ou fim indefinido, e os campos ficavam ocupados
 * por "não informado" e "em aberto" — dois rótulos para dizer que não há dado.
 * Na frase, o que não existe simplesmente não é dito.
 */
export function descreverRestricao(r: RestricaoDerivada, nome: string): string {
   if (r.codigo === "operacao") {
      const onde = r.rotulo ? `na operação ${r.rotulo}` : "em operação";
      return `${nome} está ${onde}${periodoEmTexto(r)} e não entra na escala.`;
   }
   if (r.codigo === "cemal_ausente") {
      return `${nome} não tem CEMAL lançado, então a aptidão não pode ser verificada.`;
   }
   if (r.codigo === "cemal_vencido") {
      return `O CEMAL de ${nome} está vencido${desdeQuando(r)}.`;
   }
   return `${nome} está sem voar tempo suficiente para desadaptar${desdeQuando(r)}.`;
}

/** " de 11/09 a 22/09" — vazio quando falta alguma das pontas. */
function periodoEmTexto(r: RestricaoDerivada): string {
   if (!r.inicio || !r.fim) return "";
   return ` de ${isoDateToShort(r.inicio)} a ${isoDateToShort(r.fim)}`;
}

/** " desde 28/09" — vazio quando a data de virada não veio. */
function desdeQuando(r: RestricaoDerivada): string {
   return r.inicio ? ` desde ${isoDateToShort(r.inicio)}` : "";
}
