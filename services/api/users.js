// const URL = "http://127.0.0.1:8000/"
const URL = "http://192.168.0.214:8000/"


const headers = { "Content-Type": "application/json", }

const route = "users/"


export async function addUserAPI(user) {
    const requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(user),
    };
    const response = await fetch(URL + route, requestOptions);

    return response;
}


export async function getUsersAPI() {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };
    const response = await fetch(URL + route, requestOptions);

    return response;
}


export async function getUserById(id) {
    const requestOptions = {
        method: "GET",
        headers: headers,
    };
    const response = await fetch(URL + route + id, requestOptions);

    return response;
}

export async function updateUser(id, user) {
    const requestOptions = {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(user),
    };
    const response = await fetch(URL + route + id, requestOptions);

    return response;
}
