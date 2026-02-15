import type { OrdemMissaoOut, EtapaOut } from "services/routes/om/ordens";
import { formatDateForDisplay } from "utils/dateHandler";

// Re-export for components that import from here
export { formatDateForDisplay };

export const createEmptyEtapa = (): Partial<EtapaOut> => ({
   dt_dep: "",
   origem: "",
   dt_arr: "",
   dest: "",
   alternativa: "",
   tvoo_alt: 0,
   qtd_comb: 0,
   esf_aer: "",
});

export const createEtapaWithOrigem = (
   origem: string,
   esforcoAereo: string = ""
): Partial<EtapaOut> => ({
   dt_dep: "",
   origem,
   dt_arr: "",
   dest: "",
   alternativa: "",
   tvoo_alt: 0,
   qtd_comb: 0,
   esf_aer: esforcoAereo,
});

export const createNextEtapa = (
   referenceEtapa: EtapaOut
): Partial<EtapaOut> => {
   const { dest, esf_aer, dt_arr, dt_dep } = referenceEtapa;

   // Base datetime for the calculation
   const baseDateTime = dt_arr || dt_dep;

   let nextDateTime = "";

   if (baseDateTime) {
      // Parse the datetime string directly to avoid timezone issues
      // Format expected: "YYYY-MM-DDTHH:MM:SS" or "YYYY-MM-DDTHH:MM"
      const [datePart, timePart] = baseDateTime.split("T");
      if (datePart && timePart) {
         const [year, month, day] = datePart.split("-").map(Number);
         const [hours, minutes] = timePart.split(":").map(Number);

         // Add 2 hours
         let newHours = hours + 2;
         let newDay = day;
         let newMonth = month;
         let newYear = year;

         // Handle day overflow
         if (newHours >= 24) {
            newHours -= 24;
            newDay += 1;

            // Handle month overflow (simplified - assumes 31 days)
            const daysInMonth = new Date(year, month, 0).getDate();
            if (newDay > daysInMonth) {
               newDay = 1;
               newMonth += 1;
               if (newMonth > 12) {
                  newMonth = 1;
                  newYear += 1;
               }
            }
         }

         nextDateTime = `${newYear}-${String(newMonth).padStart(2, "0")}-${String(newDay).padStart(2, "0")}T${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`;
      }
   }

   return {
      dt_dep: nextDateTime,
      origem: dest || "",
      dt_arr: "",
      dest: "",
      alternativa: "",
      tvoo_alt: 0,
      qtd_comb: 0,
      esf_aer: esf_aer || "",
   };
};

export const createDefaultOrdem = (): Partial<OrdemMissaoOut> => ({
   id: 0,
   doc_ref: "",
   matricula_anv: "",
   projeto: "kc-390",
   tipo: "",
   status: "rascunho",
   esf_aer: 0,
   etapas: [], // Inicia sem etapas - usuário adiciona via modal
   etiquetas: [],
   uae: "11gt",
});
