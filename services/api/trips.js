import { url, headers } from "./config";

const route = `${url}ops/trips/`


export async function getTripsAPI(params) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };

    const tripRoute = new URL(route);

    Object.keys(params).forEach(
        key => tripRoute.searchParams.set(key, params[key])
    );

    return await fetch(tripRoute, requestOptions);
}


export async function addTripAPI(trip) {
    const requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(trip),
    };

    const tripRoute = new URL(route);

    return await fetch(tripRoute, requestOptions);
}


export async function updateTripAPI(id, trip) {
    const requestOptions = {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(trip),
    };

    const tripRoute = new URL(route);

    return await fetch(`${tripRoute}` + id, requestOptions);
}
