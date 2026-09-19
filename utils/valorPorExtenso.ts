/**
 * Converte um valor decimal do backend em reais por extenso.
 *
 * O backend serializa `Decimal` como string. A conversão trabalha em centavos
 * inteiros para não introduzir os erros binários de `parseFloat` em dinheiro.
 */
export function valorEmReaisPorExtenso(valor: string): string {
   const totalCentavos = paraCentavos(valor);
   const reais = Math.floor(totalCentavos / 100);
   const centavos = totalCentavos % 100;
   // "um milhão DE reais", não "um milhão reais": a preposição é obrigatória
   // quando o valor termina numa escala redonda (milhão em diante). Não vale
   // para mil — "mil reais" está certo — nem quando sobra resto, porque aí
   // quem rege o substantivo é o último grupo ("um milhão e dez reais").
   const conector = exigeDeAntesDaMoeda(reais) ? " de " : " ";
   const partes: string[] = [
      `${numeroPorExtenso(reais)}${conector}${reais === 1 ? "real" : "reais"}`,
   ];

   if (centavos > 0) {
      partes.push(
         `${numeroPorExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`
      );
   }

   return partes.join(" e ");
}

/** Formata o mesmo decimal do backend sem converter a fração para `number`. */
export function formatarValorEmReais(valor: string): string {
   const totalCentavos = paraCentavos(valor);
   const reais = Math.floor(totalCentavos / 100);
   const centavos = totalCentavos % 100;
   return `R$ ${agruparMilhares(reais)},${centavos.toString().padStart(2, "0")}`;
}

/**
 * `true` quando o número é múltiplo exato de um milhão — o caso em que a
 * moeda pede "de" ("dois milhões de reais"). Mil fica de fora: a escala não
 * é substantivo, então "dois mil reais" já está correto.
 */
function exigeDeAntesDaMoeda(numero: number): boolean {
   return numero >= 1_000_000 && numero % 1_000_000 === 0;
}

function paraCentavos(valor: string): number {
   const normalizado = valor.trim().replace(",", ".");
   const match = normalizado.match(/^(\d+)(?:\.(\d+))?$/);
   if (!match) {
      throw new Error(`Valor monetário inválido: "${valor}".`);
   }

   // A fração nunca passa por float: só montamos e arredondamos os centavos.
   // O teto exato não é "15 dígitos": como a conta é `inteiros * 100`, ela
   // estoura `MAX_SAFE_INTEGER` a partir de ~R$ 90 trilhões, e acima disso o
   // valor se corrompe em silêncio. Sobra folga de sobra para dinheiro de
   // GLE; converter para `BigInt` é o caminho se este helper for reusado
   // fora dessa faixa.
   const inteiros = Number(match[1]);
   const decimais = match[2] ?? "";
   const centavos = Number(decimais.slice(0, 2).padEnd(2, "0"));
   const terceiroDecimal = decimais[2];
   const arredondamento = terceiroDecimal && terceiroDecimal >= "5" ? 1 : 0;

   return inteiros * 100 + centavos + arredondamento;
}

function agruparMilhares(numero: number): string {
   return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const UNIDADES = [
   "zero",
   "um",
   "dois",
   "três",
   "quatro",
   "cinco",
   "seis",
   "sete",
   "oito",
   "nove",
];
const DEZ_A_DEZENOVE = [
   "dez",
   "onze",
   "doze",
   "treze",
   "quatorze",
   "quinze",
   "dezesseis",
   "dezessete",
   "dezoito",
   "dezenove",
];
const DEZENAS = [
   "",
   "",
   "vinte",
   "trinta",
   "quarenta",
   "cinquenta",
   "sessenta",
   "setenta",
   "oitenta",
   "noventa",
];
const CENTENAS = [
   "",
   "cento",
   "duzentos",
   "trezentos",
   "quatrocentos",
   "quinhentos",
   "seiscentos",
   "setecentos",
   "oitocentos",
   "novecentos",
];
const ESCALAS = [
   undefined,
   { singular: "mil", plural: "mil" },
   { singular: "milhão", plural: "milhões" },
   { singular: "bilhão", plural: "bilhões" },
   { singular: "trilhão", plural: "trilhões" },
   { singular: "quadrilhão", plural: "quadrilhões" },
];

function numeroPorExtenso(numero: number): string {
   if (numero === 0) return "zero";

   const grupos: number[] = [];
   let restante = numero;
   while (restante > 0) {
      grupos.push(restante % 1000);
      restante = Math.floor(restante / 1000);
   }

   if (grupos.length > ESCALAS.length) {
      throw new Error(
         "Valor monetário grande demais para conversão por extenso."
      );
   }

   const partes = grupos
      .map((grupo, indice) => {
         if (grupo === 0) return "";
         if (indice === 1 && grupo === 1) return "mil";

         const escala = ESCALAS[indice];
         const porExtenso = grupoAteNovecentosPorExtenso(grupo);
         if (!escala) return porExtenso;
         return `${porExtenso} ${grupo === 1 ? escala.singular : escala.plural}`;
      })
      .filter(Boolean)
      .reverse();

   const menorGrupo = grupos.find((grupo) => grupo > 0) ?? 0;
   return juntarPartes(partes, menorGrupo);
}

function grupoAteNovecentosPorExtenso(numero: number): string {
   if (numero < 10) return UNIDADES[numero];
   if (numero < 20) return DEZ_A_DEZENOVE[numero - 10];
   if (numero < 100) {
      const dezena = DEZENAS[Math.floor(numero / 10)];
      const unidade = numero % 10;
      return unidade ? `${dezena} e ${UNIDADES[unidade]}` : dezena;
   }
   if (numero === 100) return "cem";

   const centena = CENTENAS[Math.floor(numero / 100)];
   const resto = numero % 100;
   return resto
      ? `${centena} e ${grupoAteNovecentosPorExtenso(resto)}`
      : centena;
}

function juntarPartes(partes: string[], menorGrupo: number): string {
   if (partes.length <= 1) return partes[0] ?? "";
   // O "e" liga o último grupo quando ele é menor que cem ("mil e cinquenta")
   // ou é uma centena redonda ("mil e cem"). Com resto dentro da centena a
   // conjunção já aparece lá dentro ("cento e quinze"), e repeti-la fora
   // produziria "mil e cento e quinze" — por isso ali entra a vírgula.
   const ligaComE = menorGrupo < 100 || menorGrupo % 100 === 0;
   if (ligaComE) {
      return `${partes.slice(0, -1).join(", ")} e ${partes.at(-1)}`;
   }
   return partes.join(", ");
}
