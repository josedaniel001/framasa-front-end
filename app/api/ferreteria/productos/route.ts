import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'

// Usar 127.0.0.1 en lugar de localhost para evitar problemas con IPv6
const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

/**
 * GET /api/ferreteria/productos
 * Obtiene la lista de productos desde Django
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    // Next.js normaliza los headers a minúsculas
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    console.log('🔍 [API Route - Productos] Headers recibidos:', {
      authorization: request.headers.get('authorization'),
      Authorization: request.headers.get('Authorization'),
      authHeader,
    })
    
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      console.error('❌ [API Route - Productos] No se encontró token en el header. Headers recibidos:', {
        authorization: request.headers.get('authorization'),
        Authorization: request.headers.get('Authorization'),
        allHeaders: Object.fromEntries(request.headers.entries())
      })
      return NextResponse.json({ error: 'No autorizado - Token no encontrado' }, { status: 401 })
    }

    console.log('✅ [API Route - Productos] Token encontrado, verificando con Django...')
    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      console.error('❌ [API Route - Productos] Token inválido o verificación falló')
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    console.log('✅ [API Route - Productos] Token verificado correctamente, usuario:', usuario.id)

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/ferreteria/productos/`, {
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
      console.error('❌ [API Route - Productos GET] Error de Django:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        errorText,
      })
      return NextResponse.json(
        errorData || { error: 'Error al obtener productos' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route - Productos GET] Respuesta exitosa de Django:', {
      cantidad: Array.isArray(data) ? data.length : 'N/A',
      tipo: Array.isArray(data) ? 'array' : typeof data,
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [API Route - Productos GET] Error al obtener productos:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Stack trace:', errorStack)
    return NextResponse.json(
      { 
        error: 'Error al obtener los productos',
        detail: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ferreteria/productos
 * Crea un nuevo producto en Django
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    // Next.js normaliza los headers a minúsculas
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      console.error('No se encontró token en el header. Headers recibidos:', {
        authorization: request.headers.get('authorization'),
        Authorization: request.headers.get('Authorization'),
        allHeaders: Object.fromEntries(request.headers.entries())
      })
      return NextResponse.json({ error: 'No autorizado - Token no encontrado' }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener el cuerpo de la petición
    const body = await request.json()
    console.log('🔍 [API Route - Productos POST] Datos recibidos:', body)
    console.log('🔍 [API Route - Productos POST] URL de Django:', `${DJANGO_API_URL}/api/ferreteria/productos/`)

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/ferreteria/productos/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('🔍 [API Route - Productos POST] Respuesta de Django:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ [API Route - Productos POST] Error de Django:', {
        status: response.status,
        errorData,
      })
      return NextResponse.json(
        errorData || { error: 'Error al crear producto' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    )
  }
}

