import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // En Vercel, a veces 'origin' puede ser engañoso si hay proxies de por medio.
  // Priorizamos una variable de entorno si existe, sino usamos el origin del request.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${siteUrl}/`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${siteUrl}/login?error=auth_failed`)
}
