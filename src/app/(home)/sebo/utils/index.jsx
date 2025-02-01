export const durationToMinutes = (duration) => {
   const [hours, minutes] = duration.split(":").map(Number);
   return hours * 60 + minutes;
};

export const converterMinutosParaHoras = (minutos) => {
   if (typeof minutos !== "number" || minutos < 0) {
      return "Entrada inválida. Por favor, forneça um número de minutos não negativo.";
   }

   const horas = String(Math.floor(minutos / 60));
   const minutosRestantes = String(minutos % 60);

   return `${horas.padStart(2, "0")}:${minutosRestantes.padStart(2, "0")}`;
};
