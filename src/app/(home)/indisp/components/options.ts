const themes = {
   amber: {
      button: "bg-amber-400 enabled:hover:bg-amber-700",
      bg: "bg-amber-200",
   },
   red: {
      button: "bg-red-500 enabled:hover:bg-red-800",
      bg: "bg-red-100",
   },
   orange: {
      button: "bg-orange-500 enabled:hover:bg-orange-800",
      bg: "bg-orange-100",
   },
   rose: {
      button: "bg-rose-700 enabled:hover:bg-rose-900",
      bg: "bg-rose-200",
   },
   blue: {
      button: "bg-blue-700 enabled:hover:bg-blue-800",
      bg: "bg-blue-200",
   }
}

export const indispsOptions = [
   {
      value: "svc",
      label: "Serviço",
      color: themes.amber,
   },
   {
      value: "sde",
      label: "Saúde",
      color: themes.red,
   },
   {
      value: "rep",
      label: "Representação",
      color: themes.red,
   },
   {
      value: "fer",
      label: "Férias",
      color: themes.red,
   },
   {
      value: "lic",
      label: "Licença",
      color: themes.red,
   },
   {
      value: "mis",
      label: "Missão",
      color: themes.orange,
   },
   {
      value: "odm",
      label: "Ordem de Missão",
      color: themes.rose,
   },
   {
      value: "pes",
      label: "Particular",
      color: themes.blue,
   },
];

export const getIndisp = (mtv: string) => {
   return indispsOptions.find((item) => item.value == mtv);;
};
