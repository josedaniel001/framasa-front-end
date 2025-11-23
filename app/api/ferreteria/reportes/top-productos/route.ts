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

    // Obtener top productos
    const topProductosQuery = `
      SELECT 
        p.nombre as producto,
        COALESCE(SUM(iv.cantidad), 0) as ventas,
        COALESCE(SUM(iv.cantidad * iv.precio_unitario), 0) as ingresos
      FROM items_venta iv
      INNER JOIN ventas_ferreteria v ON iv.venta_id = v.id
      INNER JOIN productos_ferreteria p ON iv.producto_id = p.id
      WHERE v.fecha >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY p.id, p.nombre
      ORDER BY ingresos DESC
      LIMIT 10
    `

    const result = await query(topProductosQuery)
    
    const topProductos = result.rows.map((row: any) => ({
      producto: row.producto,
      ventas: parseInt(row.ventas),
      ingresos: parseFloat(row.ingresos),
    }))

    return NextResponse.json(topProductos)
  } catch (error) {
    console.error('Error al obtener top productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener los top productos' },
      { status: 500 }
    )
  }
}

