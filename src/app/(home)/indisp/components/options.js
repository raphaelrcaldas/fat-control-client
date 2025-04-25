export const indispsOptions = [
   {
      value: "svc",
      label: "Serviço",
      color: {
         button: "bg-amber-400 enabled:hover:bg-amber-700",
         bg: "bg-amber-200",
      },
   },
   {
      value: "sde",
      label: "Saúde",
      color: {
         button: "bg-red-500 enabled:hover:bg-red-800",
         bg: "bg-red-100",
      },
   },
   {
      value: "rep",
      label: "Representação",
      color: {
         button: "bg-red-500 enabled:hover:bg-red-800",
         bg: "bg-red-100",
      },
   },
   {
      value: "fer",
      label: "Férias",
      color: {
         button: "bg-red-500 enabled:hover:bg-red-800",
         bg: "bg-red-100",
      },
   },
   {
      value: "lic",
      label: "Licença",
      color: {
         button: "bg-red-500 enabled:hover:bg-red-800",
         bg: "bg-red-100",
      },
   },
   {
      value: "mis",
      label: "Missão",
      color: {
         button: "bg-orange-500 enabled:hover:bg-orange-800",
         bg: "bg-orange-100",
      },
   },
   {
      value: "odm",
      label: "Ordem de Missão",
      color: {
         button: "bg-rose-700 enabled:hover:bg-rose-900",
         bg: "bg-rose-200",
      },
   },
   {
      value: "pes",
      label: "Particular",
      color: {
         button: "bg-blue-700 enabled:hover:bg-blue-800",
         bg: "bg-blue-200",
      },
   },
];

export const getIndisp = (mtv) => {
   return indispsOptions.find((item) => item.value == mtv);;
};
