/**
 * Dados estáticos de Grupos de P/G para diárias
 * Fonte: Tabela cegep.grupos_pg do banco de dados
 *
 * Grupo 1: Oficiais Generais
 * Grupo 2: Oficiais Superiores
 * Grupo 3: Oficiais Int/Sub + Graduados
 * Grupo 4: Praças
 */

export interface GrupoPgPublic {
   id: number;
   grupo: number;
   pg_short: string;
   pg_mid: string | null;
   pg_long: string | null;
   circulo: string | null;
}

export const grupoPgRecords: GrupoPgPublic[] = [
   // Grupo 1 - Oficiais Generais
   { id: 2, grupo: 1, pg_short: "tb", pg_mid: "Ten Brig", pg_long: "tenente-brigadeiro", circulo: "of_gen" },
   { id: 1, grupo: 1, pg_short: "mb", pg_mid: "Maj Brig", pg_long: "major-brigadeiro", circulo: "of_gen" },
   { id: 3, grupo: 1, pg_short: "br", pg_mid: "Brig", pg_long: "brigadeiro", circulo: "of_gen" },
   // Grupo 2 - Oficiais Superiores
   { id: 4, grupo: 2, pg_short: "cl", pg_mid: "Cel", pg_long: "coronel", circulo: "of_sup" },
   { id: 5, grupo: 2, pg_short: "tc", pg_mid: "Ten Cel", pg_long: "tenente-coronel", circulo: "of_sup" },
   { id: 6, grupo: 2, pg_short: "mj", pg_mid: "Maj", pg_long: "major", circulo: "of_sup" },
   // Grupo 3 - Oficiais Int/Sub + Graduados
   { id: 7, grupo: 3, pg_short: "cp", pg_mid: "Cap", pg_long: "capitão", circulo: "of_int" },
   { id: 8, grupo: 3, pg_short: "1t", pg_mid: "1º Ten", pg_long: "primeiro tenente", circulo: "of_sub" },
   { id: 9, grupo: 3, pg_short: "2t", pg_mid: "2º Ten", pg_long: "segundo tenente", circulo: "of_sub" },
   { id: 10, grupo: 3, pg_short: "so", pg_mid: "Sub Of", pg_long: "suboficial", circulo: "grad" },
   { id: 11, grupo: 3, pg_short: "1s", pg_mid: "1º Sgt", pg_long: "primeiro sargento", circulo: "grad" },
   { id: 12, grupo: 3, pg_short: "2s", pg_mid: "2º Sgt", pg_long: "segundo sargento", circulo: "grad" },
   { id: 13, grupo: 3, pg_short: "3s", pg_mid: "3º Sgt", pg_long: "terceiro sargento", circulo: "grad" },
   // Grupo 4 - Praças
   { id: 14, grupo: 4, pg_short: "cb", pg_mid: "Cabo", pg_long: "cabo", circulo: "praca" },
   { id: 15, grupo: 4, pg_short: "s1", pg_mid: "S1", pg_long: "soldado primeira classe", circulo: "praca" },
   { id: 16, grupo: 4, pg_short: "s2", pg_mid: "S2", pg_long: "soldado segunda classe", circulo: "praca" },
];

// Labels descritivos para grupos de P/G
export const GRUPO_PG_LABELS: Record<number, string> = {
   1: "Grupo I - Oficiais Generais",
   2: "Grupo II - Oficiais Superiores",
   3: "Grupo III - Oficiais Int/Sub e Graduados",
   4: "Grupo IV - Praças",
};

/**
 * Busca um grupo de P/G pelo ID
 */
export function getGrupoPgById(id: number): GrupoPgPublic | undefined {
   return grupoPgRecords.find((g) => g.id === id);
}

/**
 * Busca o grupo de P/G pelo pg_short
 */
export function getGrupoPgByShort(pgShort: string): GrupoPgPublic | undefined {
   return grupoPgRecords.find((g) => g.pg_short === pgShort);
}

/**
 * Retorna P/G filtrados por grupo
 */
export function getPgByGrupo(grupo: number): GrupoPgPublic[] {
   return grupoPgRecords.filter((g) => g.grupo === grupo);
}

/**
 * Retorna todos os grupos únicos de P/G
 */
export function getGruposPgUnicos(): number[] {
   return [...new Set(grupoPgRecords.map((g) => g.grupo))].sort();
}

/**
 * Mapa pré-calculado de P/G por grupo
 */
export const pgByGrupoMap = (() => {
   const map = new Map<number, GrupoPgPublic[]>();
   grupoPgRecords.forEach((gpg) => {
      if (!map.has(gpg.grupo)) {
         map.set(gpg.grupo, []);
      }
      map.get(gpg.grupo)!.push(gpg);
   });
   return map;
})();
