import request from "../Api";

const usersRoute = "users/";

export async function getUsers() {

    return await request("GET", usersRoute);;
};


export async function getUserById(userId) {

    return await request("GET", usersRoute + userId);;
};


export async function addUser(userBody) {

    return await request("POST", usersRoute, userBody);
};


export async function updateUser(userId, userBody) {

    return await request("PUT", usersRoute + userId, userBody);
};