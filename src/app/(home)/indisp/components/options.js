export const indispsOptions = [
   {
      value: "svc",
      label: "Serviço",
      color: {
         button: "yellow",
         bg: "bg-orange-100",
      },
   },
   {
      value: "sde",
      label: "Saúde",
      color: {
         button: "red",
         bg: "bg-red-100",
      },
   },
   {
      value: "rep",
      label: "Representação",
      color: {
         button: "red",
         bg: "bg-red-100",
      },
   },
   {
      value: "fer",
      label: "Férias",
      color: {
         button: "red",
         bg: "bg-red-100",
      },
   },
   {
      value: "lic",
      label: "Licença",
      color: {
         button: "red",
         bg: "bg-red-100",
      },
   },
   {
      value: "mis",
      label: "Missão",
      color: {
         button: "",
         bg: "bg-cyan-100",
      },
   },
   {
      value: "pes",
      label: "Particular",
      color: {
         button: "blue",
         bg: "bg-blue-100",
      },
   },
];

export const getIndisp = (mtv) => {
   const filter = indispsOptions.filter((item) => item.value == mtv);

   return filter[0];
};
