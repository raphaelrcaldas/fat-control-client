import { url, headers } from "./config";

const route = new URL(`${url}ops/trips/`)


export async function getTripsAPI(params) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };

    Object.keys(params).forEach(
        key => route.searchParams.set(key, params[key])
    );

    return await fetch(route, requestOptions);
}


export async function addTripAPI(trip) {
    const requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(trip),
    };

    return await fetch(route, requestOptions);
}


export async function updateTripAPI(id, trip) {
    const requestOptions = {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(trip),
    };

    return await fetch(`${url}trips/` + id, requestOptions);
}
