import { request } from "../Api";

const quadsRoute = "ops/quads/";

export async function addQuad(quad) {

    return await request("POST", quadsRoute, quad)
}


export async function getQuads(params) {

    return await request("GET", quadsRoute, params = params)
}


export async function getQuadById(quadId) {

    return await request("GET", quadsRoute + quadId)
}

export async function updateQuad(quad) {

    return await request("PUT", quadsRoute + quad.id, quad)
}


export async function deleteQuad(quadId) {

    return await request("DELETE", quadsRoute + quad.id)
}