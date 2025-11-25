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
    const diasAnalisis = searchParams.get('dias_analisis') || '30'

    // Construir URL con parámetros
    const params = new URLSearchParams()
    params.append('empresa', empresa)
    params.append('dias_analisis', diasAnalisis)

    const response = await fetch(`${DJANGO_API_URL}/api/reportes/estadisticas_predictivas/?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al obtener estadísticas predictivas' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error al obtener estadísticas predictivas:', error)
    return NextResponse.json(
      { error: 'Error al obtener las estadísticas predictivas' },
      { status: 500 }
    )
  }
}

