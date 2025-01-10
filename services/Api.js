const baseUrl = "http://127.0.0.1:8000/"
// const url = "http://192.168.0.139:8000/"

const request = async (method, endpoint, body, params, token = null) => {
    let fullUrl = `${baseUrl}${endpoint}`;
    let headers = { 'Content-Type': 'application/json' };
    let options = { method: method, headers: headers };

    if (params) {
        let entries = Object.entries(params).map((e) => (e.join("=")));
        entries = entries.join("&");

        fullUrl += `?${entries}`
    }

    if (body) { options.body = JSON.stringify(body) };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    };

    let req = await fetch(fullUrl, options);

    return await req.json();
};

export async function Users(method, user_id, body) {

    const response = await request(method, `users/${user_id}`, body);

    return response;
};