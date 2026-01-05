import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

/**
 * GET /api/planillas/asistencias/stats
 * Obtiene estadísticas de asistencias
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ 
        error: 'No autorizado - Token no encontrado',
        code: 'token_missing',
        redirect: '/login'
      }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ 
        error: 'Token inválido o expirado',
        code: 'token_invalid',
        redirect: '/login'
      }, { status: 401 })
    }

    // Obtener query params para pasarlos a Django
    const searchParams = request.nextUrl.searchParams
    const djangoUrl = new URL(`${DJANGO_API_URL}/api/planillas/asistencias/stats/`)
    searchParams.forEach((value, key) => {
      djangoUrl.searchParams.append(key, value)
    })

    const response = await fetch(djangoUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al obtener estadísticas' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json(
      { error: 'Error al obtener las estadísticas' },
      { status: 500 }
    )
  }
}

