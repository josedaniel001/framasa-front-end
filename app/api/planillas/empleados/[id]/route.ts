import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'

// Usar 127.0.0.1 en lugar de localhost para evitar problemas con IPv6
const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

/**
 * GET /api/planillas/empleados/[id]
 * Obtiene un empleado específico desde Django
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar autenticación
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ 
        error: 'No autorizado - Token no encontrado',
        code: 'token_missing',
        redirect: '/login'
      }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ 
        error: 'Token inválido o expirado',
        code: 'token_invalid',
        redirect: '/login'
      }, { status: 401 })
    }

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/planillas/empleados/${id}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al obtener empleado' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener empleado:', error)
    return NextResponse.json(
      { error: 'Error al obtener el empleado' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/planillas/empleados/[id]
 * Actualiza un empleado en Django
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar autenticación
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ 
        error: 'No autorizado - Token no encontrado',
        code: 'token_missing',
        redirect: '/login'
      }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ 
        error: 'Token inválido o expirado',
        code: 'token_invalid',
        redirect: '/login'
      }, { status: 401 })
    }

    // Obtener el cuerpo de la petición
    const body = await request.json()

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/planillas/empleados/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
        errorData || { error: 'Error al actualizar empleado' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al actualizar empleado:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el empleado' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/planillas/empleados/[id]
 * Elimina un empleado en Django
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar autenticación
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ 
        error: 'No autorizado - Token no encontrado',
        code: 'token_missing',
        redirect: '/login'
      }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ 
        error: 'Token inválido o expirado',
        code: 'token_invalid',
        redirect: '/login'
      }, { status: 401 })
    }

    // Hacer proxy a Django
    const response = await fetch(`${DJANGO_API_URL}/api/planillas/empleados/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al eliminar empleado' },
        { status: response.status }
      )
    }

    return NextResponse.json({ message: 'Empleado eliminado exitosamente' }, { status: 204 })
  } catch (error) {
    console.error('Error al eliminar empleado:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el empleado' },
      { status: 500 }
    )
  }
}

