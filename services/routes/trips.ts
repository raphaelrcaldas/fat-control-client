import request from "../Api";

const tripRoute = "ops/trips/";

import { UserPublic } from "./users";
import { CrewFunc, CreateCrewFunc } from "./funcs";

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


export async function addCrewFunc(tripId: number, funcData: CreateCrewFunc) {

    return await request("POST", `${tripRoute}func/?trip_id=${tripId}`, funcData);
}


export async function updateCrewFunc(funcId: number, funcData: CreateCrewFunc) {

    return await request("PUT", `${tripRoute}func/${funcId}`, funcData);
}


export async function deleteCrewFunc(funcId: number) {

    return await request("DELETE", `${tripRoute}func/${funcId}`);
}
