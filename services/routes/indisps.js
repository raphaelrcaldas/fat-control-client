import { request } from "../Api";

const indispRoute = "indisp/";

export async function getCrewIndisps(func) {
   return await request("GET", indispRoute, null, { funcao: func });
}

export async function addIndisp(indisp) {
   return await request("POST", indispRoute, indisp);
}

export async function updateIndisp(indisp) {
   return await request("PUT", indispRoute + indisp.id, indisp);
}

export async function deleteIndisp(indispId) {
   console.log(indispId);
   return await request("DELETE", indispRoute + indispId);
}
