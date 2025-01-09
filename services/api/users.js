import { url, headers } from "./config";

const route = `${url}users/`

export async function addUserAPI(user) {
    const requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(user),
    };
    const usersRoute = new URL(route);
    const response = await fetch(usersRoute, requestOptions);

    return response;
}


export async function getUsersAPI() {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };
    const usersRoute = new URL(route);
    const response = await fetch(usersRoute, requestOptions);

    return response;
}


export async function getUserById(id) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };
    const usersRoute = new URL(route);
    const response = await fetch(`${usersRoute}${id}`, requestOptions);

    return response;
}

export async function updateUser(id, user) {
    const requestOptions = {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(user),
    };
    const usersRoute = new URL(route);
    const response = await fetch(`${usersRoute}${id}`, requestOptions);

    return response;
}


export async function deleteUser(id) {
    const requestOptions = {
        method: "DELETE",
        headers: headers,
    };
    const usersRoute = new URL(route);
    const response = await fetch(`${usersRoute}${id}`, requestOptions);

    return response;
}
