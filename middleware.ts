import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Prepara a resposta base
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Inicializa o Cliente Supabase no contexto do Middleware (Edge)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 3. SEGURANÇA MÁXIMA: Verifica a sessão do usuário no servidor
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. BLOQUEIO DE ROTA: Se não tiver usuário e tentar acessar dashboard
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'access_denied')
    return NextResponse.redirect(url)
  }

  // 5. Se o usuário estiver logado mas tentar acessar login/cadastro, manda pro dashboard
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/')) {
    // Opcional: Redirecionar para dashboard se já estiver logado
    // const url = request.nextUrl.clone()
    // url.pathname = '/dashboard'
    // return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/stripe (webhooks must bypass auth sometimes, handled internally)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/stripe|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}