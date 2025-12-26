import { OrdemMissao } from "../../../types";

export const generateNumero = (): string => {
   const hoje = new Date();
   const dataFormatada = `${String(hoje.getDate()).padStart(2, "0")}${String(
      hoje.getMonth() + 1
   ).padStart(2, "0")}${String(hoje.getFullYear()).slice(-2)}`;
   const sequencial = String(Math.floor(Math.random() * 999) + 1).padStart(
      3,
      "0"
   );
   return `${sequencial}/1GT/${dataFormatada}`;
};

export const createEmptyEtapa = () => ({
   dataDecolagem: "",
   horaDecolagem: "",
   origem: "",
   eta: "",
   destino: "",
   alternativa: "",
   tempoVooEtapa: "",
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
   eta: "",
   destino: "",
   alternativa: "",
   tempoVooEtapa: "",
   tempoVooAlternativa: "",
   quantidadeCombustivel: "",
   esforcoAereo,
});

export const createDefaultOrdem = (): OrdemMissao => ({
   id: 0,
   numero: "",
   documentoReferencia: "",
   matriculaAeronave: 0,
   projeto: "kc-390",
   tipo: "",
   status: "Rascunho",
   etapas: [createEmptyEtapa()],
});
