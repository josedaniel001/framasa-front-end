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

    // Obtener top clientes
    const topClientesQuery = `
      SELECT 
        c.id,
        c.nombre,
        COUNT(DISTINCT v.id) as numero_facturas,
        COALESCE(SUM(v.total), 0) as total_compras
      FROM ventas_ferreteria v
      INNER JOIN clientes_ferreteria c ON v.cliente_id = c.id
      WHERE v.fecha >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY c.id, c.nombre
      ORDER BY total_compras DESC
      LIMIT 10
    `

    const result = await query(topClientesQuery)
    
    const topClientes = result.rows.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      numero_facturas: parseInt(row.numero_facturas),
      total_compras: parseFloat(row.total_compras),
    }))

    return NextResponse.json(topClientes)
  } catch (error) {
    console.error('Error al obtener top clientes:', error)
    return NextResponse.json(
      { error: 'Error al obtener los top clientes' },
      { status: 500 }
    )
  }
}

