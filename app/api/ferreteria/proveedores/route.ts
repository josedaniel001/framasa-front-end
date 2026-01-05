import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

/**
 * GET /api/ferreteria/proveedores
 * Obtiene la lista de proveedores desde Django
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
    const activo = searchParams.get('activo')

    // Construir query string
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    if (activo !== null) queryParams.append('activo', activo)

    const queryString = queryParams.toString()
    const baseUrl = `${DJANGO_API_URL}/api/ferreteria/proveedores/`
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
      // Si el endpoint no existe en Django (404), devolver un array vacío
      if (response.status === 404) {
        console.warn('Endpoint de proveedores no encontrado en Django, devolviendo array vacío')
        return NextResponse.json([])
      }
      
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `Error ${response.status}: ${response.statusText}` }
      }
      return NextResponse.json(
        errorData || { error: 'Error al obtener proveedores' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener proveedores:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { 
        error: 'Error al obtener los proveedores',
        detail: errorMessage,
      },
      { status: 500 }
    )
  }
}

