/**
 * Como a tela chama a unidade de trabalho: "etapa" em Estatística, "sessão" no
 * simulador. Os dois termos são femininos — os textos com concordância ("Esta
 * etapa é nova", "modificada") dependem disso; um termo masculino exigiria
 * carregar o gênero aqui.
 */
export type ItemLabel = { singular: string; plural: string };

export const ETAPA_LABEL: ItemLabel = { singular: "etapa", plural: "etapas" };
