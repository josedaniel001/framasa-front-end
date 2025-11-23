import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'

// Usar 127.0.0.1 en lugar de localhost para evitar problemas con IPv6
const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

/**
 * GET /api/bloquera/productos/[id]
 * Obtiene un producto de bloquera por ID desde Django
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[BLOQUERA API] Ruta GET llamada para productos/[id]')
  try {
    const { id } = await params
    console.log('[BLOQUERA API] ID recibido:', id)
    
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

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/bloquera/productos/${id}/`, {
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
        errorData || { error: 'Error al obtener producto' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener producto de bloquera:', error)
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/bloquera/productos/[id]
 * Actualiza un producto de bloquera en Django
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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
    
    // Convertir campos camelCase a snake_case para Django
    const djangoBody = {
      codigo: body.codigo,
      nombre: body.nombre,
      descripcion: body.descripcion || null,
      tipo_bloque: body.tipoBloque || body.tipo_bloque,
      dimensiones: body.dimensiones || null,
      precio_unitario: body.precioVentaUnitario || body.precio_unitario,
      costo_produccion: body.costoProduccionUnitario || body.costo_produccion,
      stock_actual: body.stockActual !== undefined ? (body.stockActual || body.stock_actual) : undefined,
      stock_minimo: body.stockMinimo !== undefined ? (body.stockMinimo || body.stock_minimo) : undefined,
      activo: body.activo !== undefined ? body.activo : undefined,
    }

    // Remover campos undefined
    Object.keys(djangoBody).forEach(key => {
      if (djangoBody[key as keyof typeof djangoBody] === undefined) {
        delete djangoBody[key as keyof typeof djangoBody]
      }
    })

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/bloquera/productos/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(djangoBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al actualizar producto' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al actualizar producto de bloquera:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bloquera/productos/[id]
 * Desactiva un producto de bloquera en Django (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/bloquera/productos/${id}/`, {
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

    // DELETE puede retornar 204 No Content
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await response.json().catch(() => null)
    return NextResponse.json(data || {}, { status: 200 })
  } catch (error) {
    console.error('Error al eliminar producto de bloquera:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    )
  }
}

