// Principais bancos brasileiros (ordenados por código). BMG e C6 existem nos
// cadastros carregados por script: sem eles, a edição desses militares abria
// com o banco em branco e sem como reescolhê-lo.
export const BANCOS_BRASILEIROS = [
   { codigo: "001", nome: "Banco do Brasil" },
   { codigo: "033", nome: "Santander" },
   { codigo: "104", nome: "Caixa Econômica Federal" },
   { codigo: "237", nome: "Bradesco" },
   { codigo: "341", nome: "Itaú Unibanco" },
   { codigo: "077", nome: "Banco Inter" },
   { codigo: "260", nome: "Nubank" },
   { codigo: "290", nome: "PagSeguro" },
   { codigo: "318", nome: "BMG" },
   { codigo: "336", nome: "C6 Bank" },
   { codigo: "323", nome: "Mercado Pago" },
   { codigo: "380", nome: "PicPay" },
].sort((a, b) => a.codigo.localeCompare(b.codigo));

export const MESES_PT = [
   "Janeiro",
   "Fevereiro",
   "Março",
   "Abril",
   "Maio",
   "Junho",
   "Julho",
   "Agosto",
   "Setembro",
   "Outubro",
   "Novembro",
   "Dezembro",
];
