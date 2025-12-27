import request from "../Api";

const postoRoute = "postos/";

export interface PostoGrad {
   ant: number;
   short: string;
   mid: string;
   long: string;
   circulo: string;
}

export const CIRCULO_LABELS: Record<string, string> = {
   of_gen: "Of. General",
   of_sup: "Of. Superior",
   of_int: "Of. Intermediário",
   of_sub: "Of. Subalterno",
   grad: "Graduado",
   praca: "Praça",
};

export const postoGradRecords: PostoGrad[] = [
   {
      ant: 1,
      short: "tb",
      mid: "Ten Brig",
      long: "tenente-brigadeiro",
      circulo: "of_gen",
   },
   {
      ant: 2,
      short: "mb",
      mid: "Maj Brig",
      long: "major-brigadeiro",
      circulo: "of_gen",
   },
   {
      ant: 3,
      short: "br",
      mid: "Brig",
      long: "brigadeiro",
      circulo: "of_gen",
   },
   {
      ant: 4,
      short: "cl",
      mid: "Cel",
      long: "coronel",
      circulo: "of_sup",
   },
   {
      ant: 5,
      short: "tc",
      mid: "Ten Cel",
      long: "tenente-coronel",
      circulo: "of_sup",
   },
   {
      ant: 6,
      short: "mj",
      mid: "Maj",
      long: "major",
      circulo: "of_sup",
   },
   {
      ant: 7,
      short: "cp",
      mid: "Cap",
      long: "capitão",
      circulo: "of_int",
   },
   {
      ant: 8,
      short: "1t",
      mid: "1º Ten",
      long: "primeiro tenente",
      circulo: "of_sub",
   },
   {
      ant: 9,
      short: "2t",
      mid: "2º Ten",
      long: "segundo tenente",
      circulo: "of_sub",
   },
   {
      ant: 10,
      short: "as",
      mid: "Asp",
      long: "aspirante",
      circulo: "of_sub",
   },
   {
      ant: 11,
      short: "so",
      mid: "Sub Of",
      long: "Suboficial",
      circulo: "grad",
   },
   {
      ant: 12,
      short: "1s",
      mid: "1º sgt",
      long: "primeiro sargento",
      circulo: "grad",
   },
   {
      ant: 13,
      short: "2s",
      mid: "2º Sgt",
      long: "segundo sargento",
      circulo: "grad",
   },
   {
      ant: 14,
      short: "3s",
      mid: "3º Sgt",
      long: "terceiro sargento",
      circulo: "grad",
   },
   {
      ant: 15,
      short: "cb",
      mid: "Cabo",
      long: "cabo",
      circulo: "praca",
   },
   {
      ant: 16,
      short: "s1",
      mid: "S1",
      long: "soldado primeira classe",
      circulo: "praca",
   },
   {
      ant: 17,
      short: "s2",
      mid: "S2",
      long: "soldado segunda classe",
      circulo: "praca",
   },
];

export async function getPostos(): Promise<PostoGrad[]> {
   return (await request("GET", postoRoute)).json();
}
