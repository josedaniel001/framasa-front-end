import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación con Django
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener parámetros de fecha
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio') || null
    const fechaFin = searchParams.get('fechaFin') || null

    // Construir condiciones de fecha
    let fechaCondition = ''
    const fechaParams: string[] = []
    
    if (fechaInicio && fechaFin) {
      fechaCondition = 'WHERE v.fecha BETWEEN $1 AND $2'
      fechaParams.push(fechaInicio, fechaFin)
    } else if (fechaInicio) {
      fechaCondition = 'WHERE v.fecha >= $1'
      fechaParams.push(fechaInicio)
    } else if (fechaFin) {
      fechaCondition = 'WHERE v.fecha <= $1'
      fechaParams.push(fechaFin)
    }

    // Ventas Totales
    const ventasTotalesQuery = `
      SELECT COALESCE(SUM(v.total), 0) as total_ventas,
             COUNT(DISTINCT v.id) as total_facturas
      FROM ventas_ferreteria v
      ${fechaCondition}
    `
    const ventasResult = await query(ventasTotalesQuery, fechaParams.length > 0 ? fechaParams : undefined)

    // Productos Vendidos
    const productosVendidosQuery = `
      SELECT COALESCE(SUM(iv.cantidad), 0) as total_productos
      FROM items_venta iv
      INNER JOIN ventas_ferreteria v ON iv.venta_id = v.id
      ${fechaCondition}
    `
    const productosResult = await query(productosVendidosQuery, fechaParams.length > 0 ? fechaParams : undefined)

    // Clientes Activos
    const clientesActivosQuery = `
      SELECT COUNT(DISTINCT v.cliente_id) as clientes_activos
      FROM ventas_ferreteria v
      ${fechaCondition}
    `
    const clientesResult = await query(clientesActivosQuery, fechaParams.length > 0 ? fechaParams : undefined)

    // Comparación con mes anterior (últimos 30 días vs anteriores 30 días)
    const comparacionQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN v.fecha >= CURRENT_DATE - INTERVAL '30 days' THEN v.total ELSE 0 END), 0) as ventas_mes_actual,
        COALESCE(SUM(CASE WHEN v.fecha >= CURRENT_DATE - INTERVAL '60 days' AND v.fecha < CURRENT_DATE - INTERVAL '30 days' THEN v.total ELSE 0 END), 0) as ventas_mes_anterior,
        COUNT(CASE WHEN v.fecha >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as facturas_mes_actual,
        COUNT(CASE WHEN v.fecha >= CURRENT_DATE - INTERVAL '60 days' AND v.fecha < CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as facturas_mes_anterior
      FROM ventas_ferreteria v
    `
    const comparacionResult = await query(comparacionQuery)

    const ventasActual = parseFloat(comparacionResult.rows[0]?.ventas_mes_actual || '0')
    const ventasAnterior = parseFloat(comparacionResult.rows[0]?.ventas_mes_anterior || '0')
    const facturasActual = parseInt(comparacionResult.rows[0]?.facturas_mes_actual || '0')
    const facturasAnterior = parseInt(comparacionResult.rows[0]?.facturas_mes_anterior || '0')

    const porcentajeVentas = ventasAnterior > 0 
      ? ((ventasActual - ventasAnterior) / ventasAnterior * 100).toFixed(1)
      : '0'
    const diferenciaFacturas = facturasActual - facturasAnterior

    return NextResponse.json({
      ventasTotales: parseFloat(ventasResult.rows[0]?.total_ventas || '0'),
      totalFacturas: parseInt(ventasResult.rows[0]?.total_facturas || '0'),
      productosVendidos: parseInt(productosResult.rows[0]?.total_productos || '0'),
      clientesActivos: parseInt(clientesResult.rows[0]?.clientes_activos || '0'),
      porcentajeVentas: parseFloat(porcentajeVentas),
      diferenciaFacturas,
    })
  } catch (error) {
    console.error('Error al obtener KPIs:', error)
    return NextResponse.json(
      { error: 'Error al obtener los KPIs' },
      { status: 500 }
    )
  }
}

