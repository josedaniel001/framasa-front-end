import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

/**
 * GET /api/planillas/asistencias
 * Obtiene la lista de asistencias desde Django
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
    const djangoUrl = new URL(`${DJANGO_API_URL}/api/planillas/asistencias/`)
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
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `Error ${response.status}: ${response.statusText}` }
      }
      return NextResponse.json(
        errorData || { error: 'Error al obtener asistencias' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener asistencias:', error)
    return NextResponse.json(
      { error: 'Error al obtener las asistencias' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/planillas/asistencias
 * Crea una nueva asistencia en Django
 */
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()

    const response = await fetch(`${DJANGO_API_URL}/api/planillas/asistencias/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al crear asistencia' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error al crear asistencia:', error)
    return NextResponse.json(
      { error: 'Error al crear la asistencia' },
      { status: 500 }
    )
  }
}

