import { request } from "../Api";

const tripRoute = "ops/trips/";

export async function getTrips(params) {

    return await request("GET", tripRoute, params = params);
}


export async function addTripAPI(trip) {

    return await request("POST", tripRoute, trip);
}


export async function updateTripAPI(tripId, trip) {

    return await request("PUT", tripRoute + tripId, trip);
}
