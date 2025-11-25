import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'

const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'No autorizado - Token no encontrado' }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener query parameters
    const { searchParams } = new URL(request.url)
    const empresa = searchParams.get('empresa') || 'todas'
    const limit = searchParams.get('limit') || '10'
    const fechaDesde = searchParams.get('fecha_desde')
    const fechaHasta = searchParams.get('fecha_hasta')

    // Construir URL con parámetros
    const params = new URLSearchParams()
    params.append('empresa', empresa)
    params.append('limit', limit)
    if (fechaDesde) params.append('fecha_desde', fechaDesde)
    if (fechaHasta) params.append('fecha_hasta', fechaHasta)

    const response = await fetch(`${DJANGO_API_URL}/api/reportes/top_productos_vendidos/?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al obtener top productos vendidos' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error al obtener top productos vendidos:', error)
    return NextResponse.json(
      { error: 'Error al obtener el top de productos vendidos' },
      { status: 500 }
    )
  }
}

