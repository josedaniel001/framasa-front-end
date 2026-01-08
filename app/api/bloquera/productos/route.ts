import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

/**
 * GET /api/bloquera/productos
 * Obtiene la lista de productos de bloquera desde Django
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

    // Obtener query params para pasarlos a Django
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const djangoUrl = queryString 
      ? `${DJANGO_API_URL}/api/bloquera/productos/?${queryString}`
      : `${DJANGO_API_URL}/api/bloquera/productos/`

    // Hacer proxy a Django
    const response = await fetch(djangoUrl, {
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
        errorData || { error: 'Error al obtener productos' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener productos de bloquera:', error)
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bloquera/productos
 * Crea un nuevo producto de bloquera en Django
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
    
    // Convertir campos camelCase a snake_case para Django
    const djangoBody = {
      codigo: body.codigo,
      nombre: body.nombre,
      descripcion: body.descripcion || null,
      tipo_bloque: body.tipoBloque || body.tipo_bloque,
      dimensiones: body.dimensiones || null,
      precio_unitario: body.precioVentaUnitario || body.precio_unitario,
      precio_descuento: body.precioDescuento !== undefined && body.precioDescuento !== null && body.precioDescuento !== '' 
        ? body.precioDescuento 
        : (body.precio_descuento !== undefined && body.precio_descuento !== null && body.precio_descuento !== '' 
          ? body.precio_descuento 
          : null),
      costo_produccion: body.costoProduccionUnitario || body.costo_produccion,
      stock_actual: body.stockActual || body.stock_actual || 0,
      stock_minimo: body.stockMinimo || body.stock_minimo || 0,
      activo: body.activo !== undefined ? body.activo : true,
    }

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/bloquera/productos/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(djangoBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: any = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `Error ${response.status}: ${response.statusText}` }
      }
      
      // Log para debugging
      console.error('[BLOQUERA API] Error de Django:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        djangoBody,
      })
      
      return NextResponse.json(
        errorData || { error: 'Error al crear producto' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error al crear producto de bloquera:', error)
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    )
  }
}

