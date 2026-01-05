import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

// Log para verificar que el archivo se carga
console.log('✅ [API Route - Clientes] Archivo route.ts cargado')

/**
 * GET /api/ferreteria/clientes
 * Obtiene la lista de clientes desde Django
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API Route - Clientes GET] Petición recibida')
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
    const periodoRegistro = searchParams.get('periodo_registro')
    const tieneCompras = searchParams.get('tiene_compras')

    // Construir query string
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    if (activo !== null) queryParams.append('activo', activo)
    if (periodoRegistro) queryParams.append('periodo_registro', periodoRegistro)
    if (tieneCompras) queryParams.append('tiene_compras', tieneCompras)

    const queryString = queryParams.toString()
    const baseUrl = `${DJANGO_API_URL}/api/ferreteria/clientes/`
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
        console.warn('Endpoint de clientes no encontrado en Django, devolviendo array vacío')
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
        errorData || { error: 'Error al obtener clientes' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { 
        error: 'Error al obtener los clientes',
        detail: errorMessage,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ferreteria/clientes
 * Crea un nuevo cliente en Django
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [API Route - Clientes POST] Petición recibida')
    
    // Verificar autenticación
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      console.error('❌ [API Route - Clientes POST] No se encontró token')
      return NextResponse.json({ error: 'No autorizado - Token no encontrado' }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      console.error('❌ [API Route - Clientes POST] Token inválido')
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener el cuerpo de la petición
    const body = await request.json()
    console.log('🔍 [API Route - Clientes POST] Datos recibidos:', body)

    // Hacer proxy a Django
    const djangoUrl = `${DJANGO_API_URL}/api/ferreteria/clientes/`
    console.log('🔍 [API Route - Clientes POST] Enviando a Django:', djangoUrl)
    
    const response = await fetch(djangoUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('🔍 [API Route - Clientes POST] Respuesta de Django:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    if (!response.ok) {
      // Si el endpoint no existe en Django (404), devolver un mensaje más claro
      if (response.status === 404) {
        console.warn('⚠️ [API Route - Clientes POST] Endpoint de clientes no encontrado en Django')
        return NextResponse.json(
          { 
            error: 'Endpoint no disponible',
            detail: 'El endpoint de clientes no está implementado en el backend de Django. Por favor, contacta al administrador del sistema.',
            suggestion: 'Necesitas agregar la ruta de clientes en Django REST Framework'
          },
          { status: 404 }
        )
      }
      
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `Error ${response.status}: ${response.statusText}` }
      }
      console.error('❌ [API Route - Clientes POST] Error de Django:', errorData)
      return NextResponse.json(
        errorData || { error: 'Error al crear cliente' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route - Clientes POST] Cliente creado exitosamente')
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('❌ [API Route - Clientes POST] Error al crear cliente:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { 
        error: 'Error al crear el cliente',
        detail: errorMessage,
      },
      { status: 500 }
    )
  }
}
