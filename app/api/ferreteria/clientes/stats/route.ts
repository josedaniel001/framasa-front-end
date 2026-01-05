import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

/**
 * GET /api/ferreteria/clientes/stats
 * Obtiene las estadísticas de clientes desde Django
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

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/ferreteria/clientes/stats/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Si el endpoint no existe en Django, devolver un objeto vacío en lugar de error
      if (response.status === 404) {
        return NextResponse.json({
          total_clientes: 0,
          clientes_con_compras: 0,
          clientes_con_compras_recientes: 0,
          nuevos_clientes_mes: 0,
          valor_total_compras: 0,
          promedio_compras_por_cliente: 0,
          total_cotizaciones: 0,
          total_facturas: 0,
        })
      }
      
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `Error ${response.status}: ${response.statusText}` }
      }
      return NextResponse.json(
        errorData || { error: 'Error al obtener estadísticas de clientes' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener estadísticas de clientes:', error)
    // En caso de error, devolver estadísticas vacías en lugar de error 500
    return NextResponse.json({
      total_clientes: 0,
      clientes_con_compras: 0,
      clientes_con_compras_recientes: 0,
      nuevos_clientes_mes: 0,
      valor_total_compras: 0,
      promedio_compras_por_cliente: 0,
      total_cotizaciones: 0,
      total_facturas: 0,
    })
  }
}

