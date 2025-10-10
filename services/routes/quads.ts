import request from "../Api";

const quadsRoute = "ops/quads/";

export async function addQuad(quad) {
   return await request("POST", quadsRoute, quad);
}

export async function getQuads(params) {
   return await request("GET", quadsRoute, null, params);
}

export async function getQuadById(quadId: number, params) {
   return await request("GET", `${quadsRoute}trip/${quadId}`, null, params);
}

export async function updateQuad(quad) {
   return await request("PUT", `${quadsRoute}${quad.id}`, quad);
}

export async function deleteQuad(quadId: number) {
   return await request("DELETE", quadsRoute + quadId);
}

export async function getQuadsType(uae: string) {
   return await request("GET", quadsRoute + "types", null, { uae: uae });
}
