import { url, headers } from "./config";

const route = new URL(`${url}trips/`)

export async function getTripsAPI(params) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };

    Object.keys(params).forEach(
        key => route.searchParams.append(key, params[key])
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