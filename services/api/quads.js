import { url, headers } from "./config";

const route = `${url}ops/quads/`

export async function addQuadAPI(quad) {
    const requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(quad),
    };
    const quadRoute = new URL(route)
    return await fetch(quadRoute, requestOptions);;
}


export async function getQuadsAPI(params) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };

    const quadRoute = new URL(route)
    Object.keys(params).forEach(
        key => quadRoute.searchParams.set(key, params[key])
    );
    return await fetch(quadRoute, requestOptions);
}


export async function getQuadById(id) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };
    const quadRoute = new URL(`${route}/${id}`)
    return await fetch(quadRoute, requestOptions);
}

export async function updateQuad(quad) {
    const requestOptions = {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(quad),
    };
    const quadRoute = new URL(`${route}/${quad.id}`)
    return await fetch(quadRoute, requestOptions);
}


export async function deleteQuad(id) {
    const requestOptions = {
        method: "DELETE",
        headers: headers,
    };
    const quadRoute = new URL(`${route}/${id}`)
    return await fetch(quadRoute + id, requestOptions);
}