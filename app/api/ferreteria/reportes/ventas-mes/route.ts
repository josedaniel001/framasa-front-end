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

    // Obtener ventas por mes (últimos 6 meses)
    const ventasPorMesQuery = `
      SELECT 
        TO_CHAR(v.fecha, 'Mon') as mes,
        TO_CHAR(v.fecha, 'YYYY-MM') as mes_completo,
        COALESCE(SUM(v.total), 0) as ventas,
        COUNT(DISTINCT v.id) as facturas
      FROM ventas_ferreteria v
      WHERE v.fecha >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(v.fecha, 'Mon'), TO_CHAR(v.fecha, 'YYYY-MM')
      ORDER BY TO_CHAR(v.fecha, 'YYYY-MM')
    `

    const result = await query(ventasPorMesQuery)
    
    // Mapear los meses al formato esperado
    const meses = result.rows.map((row: any) => ({
      mes: row.mes.substring(0, 3), // Primeras 3 letras del mes
      ventas: parseFloat(row.ventas),
      facturas: parseInt(row.facturas),
    }))

    return NextResponse.json(meses)
  } catch (error) {
    console.error('Error al obtener ventas por mes:', error)
    return NextResponse.json(
      { error: 'Error al obtener las ventas por mes' },
      { status: 500 }
    )
  }
}

