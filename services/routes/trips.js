import request from "../Api";

const tripRoute = "ops/trips/";

export async function getTrips(params) {

    return await request("GET", tripRoute, null, params);
}


export async function addTrip(trip) {

    return await request("POST", tripRoute, trip);
}


export async function updateTrip(tripId, trip) {

    return await request("PUT", tripRoute + tripId, trip);
}
