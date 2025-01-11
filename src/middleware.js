import { NextResponse } from 'next/server'
import { isAuthenticated } from '../services/routes/auth'

export function middleware(request) {
    const path = request.nextUrl.pathname;
    // let cookie = request.cookies.get('auth')

    // response.cookies.set(
    //     {
    //         name: 'vercel',
    //         value: 'fast',
    //         path: '/',
    //     }
    // )

    /// verificar se existe token
    // verificar se é válido

    if (!isAuthenticated && path !== '/login') {
        return NextResponse.redirect(
            new URL('/login', request.url)
        )
    } else if (isAuthenticated && path == '/login') {
        return NextResponse.redirect(
            new URL('/', request.url)
        )
    }

}
