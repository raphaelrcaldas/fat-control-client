import request from "../Api";

const tripRoute = "ops/trips/";

export async function getTrips(params, signal?: AbortSignal) {

    return await request("GET", tripRoute, null, params, signal);
}


export async function addTrip(trip) {

    return await request("POST", tripRoute, trip);
}


export async function updateTrip(tripId, trip) {

    return await request("PUT", tripRoute + tripId, trip);
}
