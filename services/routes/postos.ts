import request from "../Api";

const postoRoute = "postos/";

export interface PostoGrad {
    ant: number,
    short: string,
    mid: string,
    long: string,
    circulo: string
}

export async function getPostos(): Promise<PostoGrad[]> {

    return (await request("GET", postoRoute)).json();
}