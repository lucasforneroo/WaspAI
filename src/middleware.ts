import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // EXCEPCIÓN PARA TESTS: Si viene con la cookie de bypass, lo dejamos pasar sin chequear nada
  const skipAuth = request.cookies.get('playwright-skip-auth')?.value === 'true'
  if (skipAuth) {
    return response
  }

  // Rutas que NO queremos proteger (login, auth, assets estáticos)
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback')
  const isPublicAsset = request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)
  const isDeniedPage = request.nextUrl.pathname === '/access-denied'

  if (isAuthPage || isAuthCallback || isPublicAsset || isDeniedPage) {
    return response
  }

  // Si no hay usuario, al login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // POLÍTICA DE PUERTAS ABIERTAS: Ya no chequeamos whitelist.
  // Cualquier usuario autenticado puede entrar y el RLS se encarga del aislamiento.

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
