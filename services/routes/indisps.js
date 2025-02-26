import request from "../Api";

const indispRoute = "indisp/";

export async function getCrewIndisps(func, uae) {
   return await request("GET", indispRoute, null, { funcao: func, uae: uae });
}

export async function addIndisp(indisp, token) {
   return await request("POST", indispRoute, indisp, null, token);
}

export async function updateIndisp(indisp) {
   return await request("PUT", indispRoute + indisp.id, indisp);
}

export async function deleteIndisp(indispId) {
   console.log(indispId);
   return await request("DELETE", indispRoute + indispId);
}
