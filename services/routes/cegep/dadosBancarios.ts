import request from "../../Api";
import { UserPublic } from "../users";
import { cegepRoute } from ".";


const dadosBancariosRoute = cegepRoute + "dados-bancarios/";

export interface DadosBancariosBase {
    banco: string;
    codigo_banco: string;
    agencia: string;
    conta: string;
}

export interface DadosBancariosCreate extends DadosBancariosBase {
    user_id: number;
}

export interface DadosBancariosUpdate {
    banco?: string;
    codigo_banco?: string;
    agencia?: string;
    conta?: string;
}

export interface DadosBancariosPublic extends DadosBancariosBase {
    id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface DadosBancariosWithUser extends DadosBancariosPublic {
    user: UserPublic;
}

// GET - Lista todos os dados bancários ou filtra por usuário/busca
export async function getDadosBancarios(
    user_id?: number,
    search?: string
): Promise<DadosBancariosWithUser[]> {
    const params: Record<string, string | number> = {};

    if (user_id !== undefined) {
        params.user_id = user_id;
    }

    if (search && search.trim() !== "") {
        params.search = search;
    }

    const response = await request(
        "GET",
        dadosBancariosRoute,
        null,
        Object.keys(params).length > 0 ? params : null
    );

    return await response.json() as DadosBancariosWithUser[];
}

// GET - Busca dados bancários por ID
export async function getDadosBancariosById(
    dados_id: number
): Promise<DadosBancariosWithUser> {
    const response = await request("GET", `${dadosBancariosRoute}${dados_id}`);
    return await response.json() as DadosBancariosWithUser;
}

// GET - Busca dados bancários por ID do usuário
export async function getDadosBancariosByUser(
    user_id: number
): Promise<DadosBancariosPublic> {
    const response = await request("GET", `${dadosBancariosRoute}user/${user_id}`);
    return await response.json() as DadosBancariosPublic;
}

// POST - Cria novos dados bancários
export async function createDadosBancarios(
    dados: DadosBancariosCreate
): Promise<Response> {
    return await request("POST", dadosBancariosRoute, dados);
}

// PUT - Atualiza dados bancários existentes
export async function updateDadosBancarios(
    dados_id: number,
    dados: DadosBancariosUpdate
): Promise<Response> {
    return await request("PUT", `${dadosBancariosRoute}${dados_id}`, dados);
}

// DELETE - Deleta dados bancários
export async function deleteDadosBancarios(
    dados_id: number
): Promise<Response> {
    return await request("DELETE", `${dadosBancariosRoute}${dados_id}`);
}
