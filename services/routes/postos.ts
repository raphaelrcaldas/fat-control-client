import request from "../Api";

const postoRoute = "postos/";

export interface PostoGrad {
    ant: number,
    short: string,
    mid: string,
    long: string,
}

export const postoGradRecords: PostoGrad[] = [
    {
        ant: 1, short: "tb", mid: "ten brig", long: "tenente-brigadeiro",

    },
    {
        ant: 2, short: "mb", mid: "maj brig", long: "major-brigadeiro",

    },
    { ant: 3, short: "br", mid: "brig", long: "brigadeiro" },
    { ant: 4, short: "cl", mid: "cel", long: "coronel" },
    { ant: 5, short: "tc", mid: "ten cel", long: "tenente-coronel" },
    { ant: 6, short: "mj", mid: "maj", long: "major" },
    { ant: 7, short: "cp", mid: "cap", long: "capitão" },
    { ant: 8, short: "1t", mid: "1º ten", long: "primeiro tenente" },
    { ant: 9, short: "2t", mid: "2º ten", long: "segundo tenente" },
    { ant: 10, short: "as", mid: "asp", long: "aspirante" },
    { ant: 11, short: "so", mid: "sub of", long: "suboficial" },
    { ant: 12, short: "1s", mid: "1º sgt", long: "primeiro sargento" },
    { ant: 13, short: "2s", mid: "2º sgt", long: "segundo sargento" },
    { ant: 14, short: "3s", mid: "3º sgt", long: "terceiro sargento" },
    { ant: 15, short: "cb", mid: "cabo", long: "cabo" },
    { ant: 16, short: "s1", mid: "s1", long: "soldado primeira classe" },
    { ant: 17, short: "s2", mid: "s2", long: "soldado segunda classe" }
];

export async function getPostos(): Promise<PostoGrad[]> {

    return (await request("GET", postoRoute)).json();
}