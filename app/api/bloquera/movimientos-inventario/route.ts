import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

/**
 * GET /api/bloquera/movimientos-inventario
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
    const baseUrl = `${DJANGO_API_URL}/api/bloquera/movimientos-inventario/`
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
 * POST /api/bloquera/movimientos-inventario
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

    // Convertir campos camelCase a snake_case para Django (si es necesario)
    // Django espera: producto (ID), tipo, cantidad, motivo, observaciones (opcional)
    // El usuario se asigna automáticamente desde el token en Django
    const productoId = body.producto || body.producto_id
    
    // Asegurar que productoId sea un número
    if (!productoId) {
      return NextResponse.json(
        { error: 'El campo producto es requerido' },
        { status: 400 }
      )
    }

    const djangoBody: any = {
      producto: Number(productoId), // Asegurar que sea un número
      tipo: body.tipo,
      cantidad: Number(body.cantidad), // Asegurar que sea un número
    }

    // Manejar motivo: si viene como string vacío, enviar null; si tiene contenido, enviar el string
    if (body.motivo !== undefined && body.motivo !== null) {
      const motivoTrimmed = String(body.motivo).trim()
      djangoBody.motivo = motivoTrimmed || null
    } else if (body.razon !== undefined && body.razon !== null) {
      const razonTrimmed = String(body.razon).trim()
      djangoBody.motivo = razonTrimmed || null
    } else {
      djangoBody.motivo = null
    }

    // Manejar observaciones: si viene como string vacío, enviar null; si tiene contenido, enviar el string
    if (body.observaciones !== undefined && body.observaciones !== null) {
      const obsTrimmed = String(body.observaciones).trim()
      djangoBody.observaciones = obsTrimmed || null
    } else if (body.referencia !== undefined && body.referencia !== null) {
      const refTrimmed = String(body.referencia).trim()
      djangoBody.observaciones = refTrimmed || null
    } else {
      djangoBody.observaciones = null
    }

    // Remover campos undefined y null (excepto motivo y observaciones que pueden ser null)
    Object.keys(djangoBody).forEach(key => {
      if (djangoBody[key] === undefined) {
        delete djangoBody[key]
      }
    })

    // Validar campos requeridos
    if (!djangoBody.tipo) {
      return NextResponse.json(
        { error: 'El campo tipo es requerido' },
        { status: 400 }
      )
    }

    // Validar que el tipo sea uno de los valores permitidos
    const tiposValidos = ['ENTRADA', 'SALIDA', 'AJUSTE', 'TRANSFERENCIA', 'DEVOLUCION']
    if (!tiposValidos.includes(djangoBody.tipo)) {
      return NextResponse.json(
        { error: `El tipo de movimiento debe ser uno de: ${tiposValidos.join(', ')}` },
        { status: 400 }
      )
    }

    if (djangoBody.cantidad === undefined || djangoBody.cantidad === null || isNaN(djangoBody.cantidad)) {
      return NextResponse.json(
        { error: 'El campo cantidad es requerido y debe ser un número válido' },
        { status: 400 }
      )
    }

    // Validar cantidad según tipo de movimiento
    // Para AJUSTE, la cantidad puede ser positiva o negativa, pero no puede ser 0
    if (djangoBody.tipo === 'AJUSTE') {
      if (djangoBody.cantidad === 0) {
        return NextResponse.json(
          { error: 'La cantidad de ajuste no puede ser 0' },
          { status: 400 }
        )
      }
    } else if (['ENTRADA', 'SALIDA', 'DEVOLUCION', 'TRANSFERENCIA'].includes(djangoBody.tipo)) {
      // Para otros tipos, la cantidad debe ser positiva
      if (djangoBody.cantidad <= 0) {
        return NextResponse.json(
          { error: 'La cantidad debe ser mayor a 0 para este tipo de movimiento' },
          { status: 400 }
        )
      }
    }

    // Log para debugging
    console.log('[BLOQUERA API] Creando movimiento:', {
      bodyOriginal: body,
      djangoBody,
      productoId: typeof productoId,
      cantidadType: typeof djangoBody.cantidad,
      cantidadValue: djangoBody.cantidad,
      tipo: djangoBody.tipo,
    })

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/bloquera/movimientos-inventario/`, {
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
      console.error('[BLOQUERA API] Error de Django al crear movimiento:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        errorData,
        djangoBody,
        bodyOriginal: body,
      })
      
      // Si errorData es un objeto con campos de validación, mantenerlo tal cual
      // Si es un string o tiene un campo 'error', mantenerlo
      const responseError = errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0
        ? errorData
        : { error: errorText || `Error ${response.status}: ${response.statusText}` }
      
      return NextResponse.json(
        responseError,
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

