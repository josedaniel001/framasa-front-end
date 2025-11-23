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

    // Obtener ventas por forma de pago
    const ventasPorFormaPagoQuery = `
      SELECT 
        CASE 
          WHEN v.tipo_venta = 'CONTADO' THEN 'Efectivo'
          WHEN v.tipo_venta = 'CREDITO' THEN 'Crédito'
          WHEN v.tipo_venta = 'TRANSFERENCIA' THEN 'Transferencia'
          WHEN v.tipo_venta = 'CHEQUE' THEN 'Cheque'
          ELSE 'Otro'
        END as forma_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(v.total), 0) as total
      FROM ventas_ferreteria v
      WHERE v.fecha >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY v.tipo_venta
    `

    const result = await query(ventasPorFormaPagoQuery)
    
    const colores: { [key: string]: string } = {
      'Efectivo': '#10B981',
      'Crédito': '#3B82F6',
      'Transferencia': '#8B5CF6',
      'Cheque': '#F59E0B',
      'Otro': '#6B7280',
    }

    const totalVentas = result.rows.reduce((sum: number, row: any) => sum + parseFloat(row.total), 0)
    
    const ventasPorFormaPago = result.rows.map((row: any) => ({
      name: row.forma_pago,
      value: totalVentas > 0 ? Math.round((parseFloat(row.total) / totalVentas) * 100) : 0,
      color: colores[row.forma_pago] || '#6B7280',
    }))

    return NextResponse.json(ventasPorFormaPago)
  } catch (error) {
    console.error('Error al obtener ventas por forma de pago:', error)
    return NextResponse.json(
      { error: 'Error al obtener las ventas por forma de pago' },
      { status: 500 }
    )
  }
}

