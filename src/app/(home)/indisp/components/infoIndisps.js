export const indispsOptions = [
  {
    value: "svc",
    label: "Serviço",
    color: {
      button: "warning",
      bg: "bg-orange-100",
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
