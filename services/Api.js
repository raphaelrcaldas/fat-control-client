export const baseUrl = process.env.API_URL

export default async function request(method, endpoint, body = null, params = null, token = null) {
    let fullUrl = `${baseUrl}${endpoint}`;
    let headers = { 'Content-Type': 'application/json' };
    let options = { method: method, headers: headers };

    if (params) {
        let searchParams = Object.entries(params).map((e) => (e.join("=")));
        searchParams = searchParams.join("&");

        fullUrl += `?${searchParams}`
    }

    if (body) { options.body = JSON.stringify(body) };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    };

    return await fetch(fullUrl, options);
};
