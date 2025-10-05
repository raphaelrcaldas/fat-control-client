/**
 * Gera uma string aleatória e a codifica em base64url.
 * @param length O número de bytes aleatórios a serem gerados.
 */
export function generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    // crypto.getRandomValues está disponível globalmente no Edge Runtime
    crypto.getRandomValues(array);
    return base64urlencode(array);
}

/**
 * Calcula o hash SHA-256 de uma string usando a Web Crypto API.
 * Esta função é assíncrona e retorna uma Promise<string>.
 * @param str A string de entrada.
 */
export async function sha256(str: string): Promise<string> {
    const data = new TextEncoder().encode(str);
    // crypto.subtle.digest é assíncrono e retorna um ArrayBuffer
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64urlencode(digest);
}

/**
 * Codifica um ArrayBuffer ou Uint8Array em uma string base64url.
 * @param data Os dados a serem codificados.
 */
function base64urlencode(data: ArrayBuffer | Uint8Array): string {
    // btoa está disponível globalmente no Edge Runtime
    const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Função auxiliar para decodificar e verificar a expiração do token
export function isTokenExpired(token: string): boolean {
    try {
        const [, payloadBase64] = token.split(".");
        const payload = JSON.parse(atob(payloadBase64));
        const expirationTime = payload.exp * 1000; // Converte para milissegundos
        return Date.now() >= expirationTime;
    } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        return true; // Se não puder decodificar, considere-o inválido/expirado
    }
}