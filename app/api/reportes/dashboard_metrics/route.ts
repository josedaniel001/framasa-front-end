import { NextRequest, NextResponse } from 'next/server'

const DJANGO_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remover 'Bearer '

    // Hacer la petición a Django
    const djangoResponse = await fetch(`${DJANGO_API_BASE}/api/reportes/dashboard_metrics/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!djangoResponse.ok) {
      const errorData = await djangoResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || 'Error al obtener métricas del dashboard' },
        { status: djangoResponse.status }
      )
    }

    const data = await djangoResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error en proxy del dashboard metrics:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
