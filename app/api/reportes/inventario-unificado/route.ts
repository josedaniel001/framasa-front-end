import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [API Route - Inventario Unificado] Iniciando request')
    
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      console.error('❌ [API Route - Inventario Unificado] No se encontró token')
      return NextResponse.json({ error: 'No autorizado - Token no encontrado' }, { status: 401 })
    }

    console.log('✅ [API Route - Inventario Unificado] Token encontrado, verificando...')
    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      console.error('❌ [API Route - Inventario Unificado] Token inválido')
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const DJANGO_API_URL = getDjangoApiUrl()
    console.log('🔄 [API Route - Inventario Unificado] Haciendo request a Django:', `${DJANGO_API_URL}/api/reportes/inventario_unificado/`)
    const response = await fetch(`${DJANGO_API_URL}/api/reportes/inventario_unificado/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 [API Route - Inventario Unificado] Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ [API Route - Inventario Unificado] Error de Django:', errorData)
      return NextResponse.json(
        errorData || { error: 'Error al obtener inventario unificado' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API Route - Inventario Unificado] Datos obtenidos exitosamente')
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('❌ [API Route - Inventario Unificado] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener el inventario unificado', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

