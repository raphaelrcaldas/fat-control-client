import { URL, headers } from "./config";

const route = "trips/"


export async function getTripsAPI(uae, active) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };
    const response = await fetch(`${URL}${route}?uae=${uae}&active=${active}`, requestOptions);

    return response;
}

export async function addTripAPI(trip) {
    const requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(trip),
    };
    const response = await fetch(URL + route, requestOptions);

    return response;
}