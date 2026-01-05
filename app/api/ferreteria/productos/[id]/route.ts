import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

/**
 * GET /api/ferreteria/productos/[id]
 * Obtiene un producto específico desde Django
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/ferreteria/productos/${id}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al obtener producto' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/ferreteria/productos/[id]
 * Actualiza un producto en Django
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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
    console.log('🔍 [API Route - Productos PUT] Actualizando producto:', { id, body })

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/ferreteria/productos/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('🔍 [API Route - Productos PUT] Respuesta de Django:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `Error ${response.status}: ${response.statusText}` }
      }
      console.error('❌ [API Route - Productos PUT] Error de Django:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        errorText,
      })
      return NextResponse.json(
        errorData || { error: 'Error al actualizar producto' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route - Productos PUT] Producto actualizado exitosamente')
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [API Route - Productos PUT] Error al actualizar producto:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Stack trace:', errorStack)
    return NextResponse.json(
      { 
        error: 'Error al actualizar el producto',
        detail: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ferreteria/productos/[id]
 * Elimina un producto en Django
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/ferreteria/productos/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al eliminar producto' },
        { status: response.status }
      )
    }

    return NextResponse.json({ message: 'Producto eliminado exitosamente' }, { status: 204 })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    )
  }
}

