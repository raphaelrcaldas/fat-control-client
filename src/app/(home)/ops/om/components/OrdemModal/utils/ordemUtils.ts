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

export const createNextEtapa = (referenceEtapa: any) => {
   const {
      destino,
      esforcoAereo,
      dataPouso,
      horaPouso,
      dataDecolagem,
      horaDecolagem,
   } = referenceEtapa;

   // Base date/time for the calculation
   // Use dataPouso/horaPouso if available, otherwise dataDecolagem/horaDecolagem
   const baseDate = dataPouso || dataDecolagem;
   const baseTime = horaPouso || horaDecolagem;

   let nextData = baseDate;
   let nextHora = baseTime;

   if (baseDate && baseTime) {
      // Create a Date object in UTC to match the application's Zulu (Z) context
      const date = new Date(`${baseDate}T${baseTime}Z`);
      // Add 2 hours using UTC methods to avoid local timezone interference
      date.setUTCHours(date.getUTCHours() + 2);

      // Extract results back in ISO/UTC format
      const isoString = date.toISOString();
      nextData = isoString.split("T")[0];
      nextHora = isoString.split("T")[1].slice(0, 5);
   }

   return {
      dataDecolagem: nextData,
      horaDecolagem: nextHora,
      origem: destino,
      dataPouso: nextData,
      horaPouso: "",
      destino: "",
      alternativa: "",
      tempoVooAlternativa: "",
      quantidadeCombustivel: "",
      esforcoAereo,
   };
};

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

export const formatDateForDisplay = (dateStr: string) => {
   if (!dateStr) return "";
   const [year, month, day] = dateStr.split("-");
   return `${day}${month}${year}`;
};
