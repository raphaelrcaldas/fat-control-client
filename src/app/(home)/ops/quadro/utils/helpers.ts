export const formatDate = (dataInicio: string, dataFim: string): string => {
   const inicio = new Date(dataInicio + "T12:00:00");
   const fim = new Date(dataFim + "T12:00:00");
   const formatSingle = (date: Date) =>
      date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
   if (dataInicio === dataFim) return formatSingle(inicio);
   return `${formatSingle(inicio)} - ${formatSingle(fim)}`;
};
