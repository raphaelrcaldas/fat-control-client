import request from "../Api";

const citiesRoute = "cities/";

export interface Cidade {
    codigo: number,
    nome: string,
    uf: string
}

export async function getCities(search: string): Promise<Cidade[]> {

    return (await request("GET", citiesRoute, null, { search: search })).json();
}