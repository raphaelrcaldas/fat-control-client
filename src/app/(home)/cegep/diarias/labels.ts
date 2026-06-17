/**
 * Rótulos curtos de UI para os grupos de diárias (apresentação).
 *
 * Os dados dos grupos (cidades e P/G) e suas descrições vêm do banco via API
 * (ver useDiarias). Aqui ficam apenas os títulos editoriais de cada grupo,
 * que não existem no banco.
 */

export const GRUPO_CIDADE_LABELS: Record<number, string> = {
   1: "Grupo 1 - Grandes Capitais",
   2: "Grupo 2 - Demais Capitais",
   3: "Grupo 3 - Outras Localidades",
};

export const GRUPO_PG_LABELS: Record<number, string> = {
   1: "Grupo I - Of. Generais",
   2: "Grupo II - Of. Superiores",
   3: "Grupo III - Of. Int/Sub e Grad",
   4: "Grupo IV - Pracas",
};
