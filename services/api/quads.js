import { URL, headers } from "./config";

const route = "quads/"

export async function addQuadAPI(quad) {
    const requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(quad),
    };
    const response = await fetch(URL + route, requestOptions);

    return response;
}


export async function getQuadsAPI(funcao, uae, proj, tipo_quad) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };

    const queryParams = `?funcao=${funcao}&uae=${uae}&proj=${proj}&tipo_quad=${tipo_quad}`;

    const response = await fetch(URL + route + queryParams, requestOptions);

    return response;
}


export async function getQuadById(id) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };
    const response = await fetch(URL + route + id, requestOptions);

    return response;
}

export async function updateQuad(quad) {
    const requestOptions = {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(quad),
    };
    const response = await fetch(URL + route + quad.id, requestOptions);

    return response;
}


export async function deleteQuad(id) {
    const requestOptions = {
        method: "DELETE",
        headers: headers,
    };
    const response = await fetch(URL + route + id, requestOptions);

    return response;
}