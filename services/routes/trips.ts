import request from "../Api";

const tripRoute = "ops/trips/";

import { UserPublic } from "./users";
import { CrewFunc } from "./funcs";

export interface CrewMember {
    id?: number
    trig: string
    user: UserPublic
    uae: string
    active: boolean
    funcs?: CrewFunc[]
    func?: CrewFunc
}


export async function getTrips(params): Promise<CrewMember[]> {
    const response = await request("GET", tripRoute, null, params);

    return await response.json() as CrewMember[];
}


export async function addTrip(trip) {

    return await request("POST", tripRoute, trip);
}


export async function updateTrip(tripId, trip) {

    return await request("PUT", tripRoute + tripId, trip);
}
