import request from "../Api";

const postoRoute = "postos/";


export async function getPostos() {

    return await request("GET", postoRoute)
}