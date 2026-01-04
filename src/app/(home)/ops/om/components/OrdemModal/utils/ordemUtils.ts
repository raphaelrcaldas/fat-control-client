import { OrdemMissao } from "../../../types";

export const createEmptyEtapa = () => ({
   dataDecolagem: "",
   horaDecolagem: "",
   origem: "",
   dataPouso: "",
   horaPouso: "",
   destino: "",
   alternativa: "",
   tempoVooAlternativa: "",
   quantidadeCombustivel: "",
   esforcoAereo: "",
});

export const createEtapaWithOrigem = (
   origem: string,
   esforcoAereo: string = ""
) => ({
   dataDecolagem: "",
   horaDecolagem: "",
   origem,
   dataPouso: "",
   horaPouso: "",
   destino: "",
   alternativa: "",
   tempoVooAlternativa: "",
   quantidadeCombustivel: "",
   esforcoAereo,
});

export const createDefaultOrdem = (): OrdemMissao => ({
   id: 0,
   documentoReferencia: "",
   matriculaAeronave: 0,
   projeto: "kc-390",
   tipo: "",
   status: "rascunho",
   etapas: [createEmptyEtapa()],
   etiquetas: [],
   uae: "11gt",
});
