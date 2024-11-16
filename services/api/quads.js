import { url, headers } from "./config";

const route = new URL(`${url}quads/`)

export async function addQuadAPI(quad) {
    const requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(quad),
    };
    return await fetch(route, requestOptions);;
}


export async function getQuadsAPI(params) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };

    Object.keys(params).forEach(
        key => route.searchParams.set(key, params[key])
    );
    return await fetch(route, requestOptions);
}


export async function getQuadById(id) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };
    return await fetch(route + id, requestOptions);
}

export async function updateQuad(quad) {
    const requestOptions = {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(quad),
    };
    return await fetch(route + quad.id, requestOptions);
}


export async function deleteQuad(id) {
    const requestOptions = {
        method: "DELETE",
        headers: headers,
    };
    return await fetch(route + id, requestOptions);
}