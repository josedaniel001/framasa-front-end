import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

/**
 * GET /api/planillas/asistencias/empleados_sin_asistencia_hoy
 * Obtiene empleados sin asistencia registrada hoy (o con asistencia desactivada)
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

    const response = await fetch(`${DJANGO_API_URL}/api/planillas/asistencias/empleados_sin_asistencia_hoy/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al obtener empleados' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener empleados sin asistencia:', error)
    return NextResponse.json(
      { error: 'Error al obtener los empleados' },
      { status: 500 }
    )
  }
}

