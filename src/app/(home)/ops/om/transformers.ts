/**
 * Transformadores para converter dados entre formato UI e formato da API
 */

import type {
   Etapa,
   OrdemMissao,
   TripulacaoOrdem,
   CampoEspecial,
   TripulanteSearchResult,
} from "./types";
import type {
   EtapaCreate,
   EtapaOut,
   EtapaListItem,
   OrdemMissaoOut,
   OrdemMissaoCreate,
   OrdemMissaoUpdate,
   TripulacaoAgrupada,
   TripulacaoOrdemOut,
   OrdemMissaoList,
} from "services/routes/om/ordens";

// --- Helpers de datetime ---

/**
 * Converte data (YYYY-MM-DD) + hora (HH:mm) para ISO datetime string
 */
export function toIsoDatetime(date: string, time: string): string {
   if (!date || !time) return "";
   // Garante formato correto
   const [hours, minutes] = time.split(":");
   return `${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
}

/**
 * Extrai data (YYYY-MM-DD) de ISO datetime
 */
export function extractDate(isoDatetime: string): string {
   if (!isoDatetime) return "";
   return isoDatetime.split("T")[0];
}

/**
 * Extrai hora (HH:mm) de ISO datetime
 */
export function extractTime(isoDatetime: string): string {
   if (!isoDatetime) return "";
   const timePart = isoDatetime.split("T")[1];
   if (!timePart) return "";
   return timePart.substring(0, 5); // HH:mm
}

/**
 * Converte string HH:mm para minutos (int)
 */
export function timeToMinutes(time: string): number {
   if (!time) return 0;
   const [hours, minutes] = time.split(":").map(Number);
   return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converte minutos (int) para string HH:mm
 */
export function minutesToTime(minutes: number): string {
   if (!minutes || minutes < 0) return "00:00";
   const h = Math.floor(minutes / 60);
   const m = minutes % 60;
   return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Calcula tempo de voo entre dois datetimes (data + hora)
 * Retorna string no formato HH:mm
 */
export function calcularTempoVoo(
   dataDecolagem: string,
   horaDecolagem: string,
   dataPouso: string,
   horaPouso: string
): string {
   if (!dataDecolagem || !horaDecolagem || !dataPouso || !horaPouso) {
      return "--:--";
   }

   const dep = new Date(`${dataDecolagem}T${horaDecolagem}:00`);
   const arr = new Date(`${dataPouso}T${horaPouso}:00`);

   if (isNaN(dep.getTime()) || isNaN(arr.getTime())) {
      return "--:--";
   }

   const diffMs = arr.getTime() - dep.getTime();
   if (diffMs <= 0) return "--:--";

   const diffMinutes = Math.floor(diffMs / 60000);
   return minutesToTime(diffMinutes);
}

// --- Transformadores de Etapa ---

/**
 * Converte Etapa (UI) para EtapaCreate (API)
 */
export function etapaToApi(etapa: Etapa): EtapaCreate {
   const dtDep = toIsoDatetime(etapa.dataDecolagem, etapa.horaDecolagem);
   const dtArr = toIsoDatetime(etapa.dataPouso, etapa.horaPouso);

   return {
      dt_dep: dtDep,
      origem: etapa.origem.toUpperCase(),
      dest: etapa.destino.toUpperCase(),
      dt_arr: dtArr,
      alternativa: etapa.alternativa.toUpperCase(),
      tvoo_alt: timeToMinutes(etapa.tempoVooAlternativa),
      qtd_comb: parseInt(etapa.quantidadeCombustivel, 10) || 0,
      esf_aer: etapa.esforcoAereo,
   };
}

/**
 * Converte EtapaOut (API) para Etapa (UI)
 */
export function etapaFromApi(etapa: EtapaOut): Etapa {
   return {
      dataDecolagem: extractDate(etapa.dt_dep),
      horaDecolagem: extractTime(etapa.dt_dep),
      origem: etapa.origem,
      dataPouso: extractDate(etapa.dt_arr),
      horaPouso: extractTime(etapa.dt_arr),
      destino: etapa.dest,
      alternativa: etapa.alternativa,
      tempoVooAlternativa: minutesToTime(etapa.tvoo_alt),
      quantidadeCombustivel: etapa.qtd_comb.toString(),
      esforcoAereo: etapa.esf_aer,
   };
}

/**
 * Converte EtapaListItem (API listagem) para Etapa parcial (UI)
 * Usado na listagem onde só temos campos essenciais
 */
export function etapaListItemFromApi(etapa: EtapaListItem): Etapa {
   return {
      dataDecolagem: extractDate(etapa.dt_dep),
      horaDecolagem: extractTime(etapa.dt_dep),
      origem: etapa.origem,
      dataPouso: "",
      horaPouso: "",
      destino: etapa.dest,
      alternativa: "",
      tempoVooAlternativa: "",
      quantidadeCombustivel: "",
      esforcoAereo: "",
   };
}

// --- Transformadores de Tripulacao ---

/**
 * Converte TripulacaoOrdem (UI com objetos completos) para TripulacaoAgrupada (API com IDs)
 */
export function tripulacaoToApi(
   tripulacao: TripulacaoOrdem | undefined
): TripulacaoAgrupada | null {
   if (!tripulacao) return null;

   return {
      pil: tripulacao.pil.map((t) => t.id),
      mc: tripulacao.mc.map((t) => t.id),
      lm: tripulacao.lm.map((t) => t.id),
      tf: tripulacao.tf.map((t) => t.id),
      oe: tripulacao.oe.map((t) => t.id),
      os: tripulacao.os.map((t) => t.id),
   };
}

/**
 * Converte TripulacaoOrdemOut[] (API) para TripulacaoOrdem (UI)
 * Agrupa por funcao e transforma em objetos parciais de tripulante
 */
export function tripulacaoFromApi(
   tripulacao: TripulacaoOrdemOut[]
): TripulacaoOrdem {
   const result: TripulacaoOrdem = {
      pil: [],
      mc: [],
      lm: [],
      tf: [],
      oe: [],
      os: [],
   };

   for (const t of tripulacao) {
      const funcao = t.funcao as keyof TripulacaoOrdem;
      if (funcao in result && t.tripulante) {
         // Cria um objeto parcial com as informacoes disponiveis
         // IMPORTANTE: usa p_g do registro de tripulacao (snapshot) ao inves do tripulante
         const tripulantePartial: TripulanteSearchResult = {
            id: t.tripulante_id,
            trig: t.tripulante.trig,
            p_g: t.p_g, // snapshot do posto/graduacao no momento da criacao da OM
            nome_guerra: t.tripulante.nome_guerra,
            nome_completo: t.tripulante.nome_completo,
            oper: "op",
            posto_ant: 0,
            ult_promo: null,
            ant_rel: null,
            id_fab: null,
         };
         result[funcao].push(tripulantePartial);
      }
   }

   return result;
}

// --- Transformadores de OrdemMissao ---

/**
 * Converte OrdemMissao (UI) para OrdemMissaoCreate (API)
 */
export function ordemToApiCreate(ordem: OrdemMissao): OrdemMissaoCreate {
   return {
      numero: ordem.numero,
      matricula_anv: ordem.matriculaAeronave,
      tipo: ordem.tipo,
      projeto: ordem.projeto,
      status: ordem.status,
      campos_especiais: ordem.camposEspeciais || [],
      doc_ref: ordem.documentoReferencia || null,
      uae: ordem.uae,
      etapas: ordem.etapas.map(etapaToApi),
      tripulacao: tripulacaoToApi(ordem.tripulacao),
      etiquetas_ids: (ordem.etiquetas || []).map((et) => et.id),
   };
}

/**
 * Converte OrdemMissao (UI) para OrdemMissaoUpdate (API)
 */
export function ordemToApiUpdate(
   ordem: Partial<OrdemMissao>
): OrdemMissaoUpdate {
   const update: OrdemMissaoUpdate = {};

   if (ordem.numero !== undefined) update.numero = ordem.numero;
   if (ordem.matriculaAeronave !== undefined)
      update.matricula_anv = ordem.matriculaAeronave;
   if (ordem.tipo !== undefined) update.tipo = ordem.tipo;
   if (ordem.projeto !== undefined) update.projeto = ordem.projeto;
   if (ordem.status !== undefined) update.status = ordem.status;
   if (ordem.documentoReferencia !== undefined)
      update.doc_ref = ordem.documentoReferencia || null;
   if (ordem.camposEspeciais !== undefined)
      update.campos_especiais = ordem.camposEspeciais;
   if (ordem.etapas !== undefined) update.etapas = ordem.etapas.map(etapaToApi);
   if (ordem.tripulacao !== undefined)
      update.tripulacao = tripulacaoToApi(ordem.tripulacao);
   if (ordem.etiquetas !== undefined)
      update.etiquetas_ids = ordem.etiquetas.map((et) => et.id);
   if (ordem.uae !== undefined) update.uae = ordem.uae || null;

   return update;
}

/**
 * Converte OrdemMissaoOut (API) para OrdemMissao (UI)
 */
export function ordemFromApi(ordem: OrdemMissaoOut): OrdemMissao {
   return {
      id: ordem.id,
      numero: ordem.numero,
      documentoReferencia: ordem.doc_ref || "",
      matriculaAeronave: ordem.matricula_anv,
      projeto: ordem.projeto,
      tipo: ordem.tipo,
      status: ordem.status,
      etapas: ordem.etapas.map(etapaFromApi),
      tripulacao: tripulacaoFromApi(ordem.tripulacao),
      camposEspeciais: ordem.campos_especiais,
      createdAt: ordem.created_at,
      dataSaida: ordem.data_saida || undefined,
      uae: ordem.uae,
      etiquetas: ordem.etiquetas || [],
   };
}

/**
 * Converte OrdemMissaoList (API) para OrdemMissao (UI) - para listagem
 * Agora inclui etapas para evitar N+1 queries
 */
export function ordemListFromApi(ordem: OrdemMissaoList): OrdemMissao {
   return {
      id: ordem.id,
      numero: ordem.numero,
      documentoReferencia: ordem.doc_ref || "",
      matriculaAeronave: ordem.matricula_anv,
      projeto: ordem.projeto,
      tipo: ordem.tipo,
      status: ordem.status,
      etapas: ordem.etapas.map(etapaListItemFromApi),
      createdAt: ordem.created_at,
      dataSaida: ordem.data_saida || undefined,
      uae: ordem.uae,
      etiquetas: ordem.etiquetas || [],
   };
}
