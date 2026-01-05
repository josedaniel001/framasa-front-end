import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/planillas/asistencias/[id]/toggle_activo
 * Activa/Desactiva una asistencia
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado - Token no encontrado' }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ 
        error: 'Token inválido o expirado',
        code: 'token_invalid',
        redirect: '/login'
      }, { status: 401 })
    }

    const response = await fetch(`${DJANGO_API_URL}/api/planillas/asistencias/${id}/toggle_activo/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al cambiar estado de asistencia' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al cambiar estado de asistencia:', error)
    return NextResponse.json(
      { error: 'Error al cambiar estado de la asistencia' },
      { status: 500 }
    )
  }
}

