import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

/**
 * GET /api/piedrinera/movimientos-inventario
 * Obtiene la lista de movimientos de inventario desde Django
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado - Token no encontrado' }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tipo = searchParams.get('tipo')
    const tipoAjuste = searchParams.get('tipo_ajuste') // Compatibilidad con código legacy
    const producto = searchParams.get('producto')
    const productoId = searchParams.get('producto_id') // Compatibilidad con código legacy
    const fechaDesde = searchParams.get('fecha_desde')
    const fechaHasta = searchParams.get('fecha_hasta')
    const page = searchParams.get('page')

    // Construir query string según documentación API
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    // Priorizar 'tipo' sobre 'tipo_ajuste' para compatibilidad
    if (tipo) {
      queryParams.append('tipo', tipo)
    } else if (tipoAjuste) {
      queryParams.append('tipo', tipoAjuste)
    }
    // Priorizar 'producto' sobre 'producto_id' para compatibilidad
    if (producto) {
      queryParams.append('producto', producto)
    } else if (productoId) {
      queryParams.append('producto', productoId)
    }
    if (fechaDesde) queryParams.append('fecha_desde', fechaDesde)
    if (fechaHasta) queryParams.append('fecha_hasta', fechaHasta)
    if (page) queryParams.append('page', page)

    const queryString = queryParams.toString()
    const baseUrl = `${DJANGO_API_URL}/api/piedrinera/movimientos-inventario/`
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl

    // Hacer proxy a Django
    const response = await fetch(url, {
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
        errorData || { error: 'Error al obtener movimientos de inventario' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener movimientos de inventario:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { 
        error: 'Error al obtener los movimientos de inventario',
        detail: errorMessage,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/piedrinera/movimientos-inventario
 * Crea un nuevo movimiento de inventario en Django
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado - Token no encontrado' }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener el cuerpo de la petición
    const body = await request.json()

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/piedrinera/movimientos-inventario/`, {
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
        errorData || { error: 'Error al crear movimiento de inventario' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error al crear movimiento de inventario:', error)
    return NextResponse.json(
      { error: 'Error al crear el movimiento de inventario' },
      { status: 500 }
    )
  }
}

