import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()

/**
 * GET /api/ferreteria/categorias
 * Obtiene la lista de categorías desde Django
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    // Next.js normaliza los headers a minúsculas
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    console.log('🔍 [API Route] Headers recibidos:', {
      authorization: request.headers.get('authorization'),
      Authorization: request.headers.get('Authorization'),
      authHeader,
    })
    
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      console.error('❌ [API Route] No se encontró token en el header. Headers recibidos:', {
        authorization: request.headers.get('authorization'),
        Authorization: request.headers.get('Authorization'),
        allHeaders: Object.fromEntries(request.headers.entries())
      })
      return NextResponse.json({ error: 'No autorizado - Token no encontrado' }, { status: 401 })
    }

    console.log('✅ [API Route] Token encontrado, verificando con Django...')
    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      console.error('❌ [API Route] Token inválido o verificación falló')
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    console.log('✅ [API Route] Token verificado correctamente, usuario:', usuario.id)

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/ferreteria/categorias/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al obtener categorías' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    )
  }
}

