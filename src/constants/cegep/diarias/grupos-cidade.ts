/**
 * Dados estáticos de Grupos de Cidade para diárias
 * Fonte: Tabela cegep.grupos_cidade do banco de dados
 *
 * Grupo 1: Grandes capitais (SP, RJ, DF, AM)
 * Grupo 2: Demais capitais
 */

export interface CidadeSimple {
   codigo: number;
   nome: string;
   uf: string;
}

export interface GrupoCidadePublic {
   id: number;
   grupo: number;
   cidade_id: number;
   cidade: CidadeSimple | null;
}

export const grupoCidadeRecords: GrupoCidadePublic[] = [
   // Grupo 1 - Grandes Capitais
   {
      id: 4,
      grupo: 1,
      cidade_id: 5300108,
      cidade: { codigo: 5300108, nome: "Brasília", uf: "DF" },
   },
   {
      id: 3,
      grupo: 1,
      cidade_id: 1302603,
      cidade: { codigo: 1302603, nome: "Manaus", uf: "AM" },
   },
   {
      id: 1,
      grupo: 1,
      cidade_id: 3304557,
      cidade: { codigo: 3304557, nome: "Rio de Janeiro", uf: "RJ" },
   },
   {
      id: 2,
      grupo: 1,
      cidade_id: 3550308,
      cidade: { codigo: 3550308, nome: "São Paulo", uf: "SP" },
   },
   // Grupo 2 - Demais Capitais
   {
      id: 26,
      grupo: 2,
      cidade_id: 2800308,
      cidade: { codigo: 2800308, nome: "Aracaju", uf: "SE" },
   },
   {
      id: 16,
      grupo: 2,
      cidade_id: 1501402,
      cidade: { codigo: 1501402, nome: "Belém", uf: "PA" },
   },
   {
      id: 15,
      grupo: 2,
      cidade_id: 3106200,
      cidade: { codigo: 3106200, nome: "Belo Horizonte", uf: "MG" },
   },
   {
      id: 24,
      grupo: 2,
      cidade_id: 1400100,
      cidade: { codigo: 1400100, nome: "Boa Vista", uf: "RR" },
   },
   {
      id: 14,
      grupo: 2,
      cidade_id: 5002704,
      cidade: { codigo: 5002704, nome: "Campo Grande", uf: "MS" },
   },
   {
      id: 13,
      grupo: 2,
      cidade_id: 5103403,
      cidade: { codigo: 5103403, nome: "Cuiabá", uf: "MT" },
   },
   {
      id: 18,
      grupo: 2,
      cidade_id: 4106902,
      cidade: { codigo: 4106902, nome: "Curitiba", uf: "PR" },
   },
   {
      id: 25,
      grupo: 2,
      cidade_id: 4205407,
      cidade: { codigo: 4205407, nome: "Florianópolis", uf: "SC" },
   },
   {
      id: 9,
      grupo: 2,
      cidade_id: 2304400,
      cidade: { codigo: 2304400, nome: "Fortaleza", uf: "CE" },
   },
   {
      id: 11,
      grupo: 2,
      cidade_id: 5208707,
      cidade: { codigo: 5208707, nome: "Goiânia", uf: "GO" },
   },
   {
      id: 17,
      grupo: 2,
      cidade_id: 2507507,
      cidade: { codigo: 2507507, nome: "João Pessoa", uf: "PB" },
   },
   {
      id: 7,
      grupo: 2,
      cidade_id: 1600303,
      cidade: { codigo: 1600303, nome: "Macapá", uf: "AP" },
   },
   {
      id: 6,
      grupo: 2,
      cidade_id: 2704302,
      cidade: { codigo: 2704302, nome: "Maceió", uf: "AL" },
   },
   {
      id: 21,
      grupo: 2,
      cidade_id: 2408102,
      cidade: { codigo: 2408102, nome: "Natal", uf: "RN" },
   },
   {
      id: 27,
      grupo: 2,
      cidade_id: 1721000,
      cidade: { codigo: 1721000, nome: "Palmas", uf: "TO" },
   },
   {
      id: 22,
      grupo: 2,
      cidade_id: 4314902,
      cidade: { codigo: 4314902, nome: "Porto Alegre", uf: "RS" },
   },
   {
      id: 23,
      grupo: 2,
      cidade_id: 1100205,
      cidade: { codigo: 1100205, nome: "Porto Velho", uf: "RO" },
   },
   {
      id: 19,
      grupo: 2,
      cidade_id: 2611606,
      cidade: { codigo: 2611606, nome: "Recife", uf: "PE" },
   },
   {
      id: 5,
      grupo: 2,
      cidade_id: 1200401,
      cidade: { codigo: 1200401, nome: "Rio Branco", uf: "AC" },
   },
   {
      id: 8,
      grupo: 2,
      cidade_id: 2927408,
      cidade: { codigo: 2927408, nome: "Salvador", uf: "BA" },
   },
   {
      id: 12,
      grupo: 2,
      cidade_id: 2111300,
      cidade: { codigo: 2111300, nome: "São Luís", uf: "MA" },
   },
   {
      id: 20,
      grupo: 2,
      cidade_id: 2211001,
      cidade: { codigo: 2211001, nome: "Teresina", uf: "PI" },
   },
   {
      id: 10,
      grupo: 2,
      cidade_id: 3205309,
      cidade: { codigo: 3205309, nome: "Vitória", uf: "ES" },
   },
];

// Labels curtas para selects (dropdown)
export const GRUPO_CIDADE_LABELS: Record<number, string> = {
   1: "Grupo 1 - Grandes Capitais",
   2: "Grupo 2 - Demais Capitais",
   3: "Grupo 3 - Outras Localidades",
};

// Labels descritivas para helper text
export const GRUPO_CIDADE_DESCRICAO: Record<number, string> = {
   1: "RJ, SP, DF, AM",
   2: "Demais capitais estaduais",
   3: "Demais localidades do pais",
};

/**
 * Busca um grupo de cidade pelo ID
 */
export function getGrupoCidadeById(id: number): GrupoCidadePublic | undefined {
   return grupoCidadeRecords.find((g) => g.id === id);
}

/**
 * Retorna cidades filtradas por grupo
 */
export function getCidadesByGrupo(grupo: number): GrupoCidadePublic[] {
   return grupoCidadeRecords.filter((g) => g.grupo === grupo);
}

/**
 * Retorna todos os grupos únicos de cidade
 */
export function getGruposCidadeUnicos(): number[] {
   return [...new Set(grupoCidadeRecords.map((g) => g.grupo))].sort();
}

/**
 * Mapa pré-calculado de cidades por grupo
 */
export const cidadesByGrupoMap = (() => {
   const map = new Map<number, GrupoCidadePublic[]>();
   grupoCidadeRecords.forEach((gc) => {
      if (!map.has(gc.grupo)) {
         map.set(gc.grupo, []);
      }
      map.get(gc.grupo)!.push(gc);
   });
   return map;
})();
