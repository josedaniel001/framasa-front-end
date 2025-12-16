import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyTokenWithDjango } from '@/lib/verify-token-django'

const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/planillas/asistencias/[id]
 * Obtiene una asistencia específica
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
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

    const response = await fetch(`${DJANGO_API_URL}/api/planillas/asistencias/${id}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al obtener asistencia' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener asistencia:', error)
    return NextResponse.json(
      { error: 'Error al obtener la asistencia' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/planillas/asistencias/[id]
 * Actualiza una asistencia
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado - Token no encontrado' }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ 
        error: 'Token inválido o expirado',
        code: 'token_invalid',
        redirect: '/login'
      }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${DJANGO_API_URL}/api/planillas/asistencias/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al actualizar asistencia' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al actualizar asistencia:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la asistencia' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/planillas/asistencias/[id]
 * Desactiva una asistencia (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado - Token no encontrado' }, { status: 401 })
    }

    const usuario = await verifyTokenWithDjango(token)
    if (!usuario) {
      return NextResponse.json({ 
        error: 'Token inválido o expirado',
        code: 'token_invalid',
        redirect: '/login'
      }, { status: 401 })
    }

    const response = await fetch(`${DJANGO_API_URL}/api/planillas/asistencias/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        errorData || { error: 'Error al desactivar asistencia' },
        { status: response.status }
      )
    }

    return NextResponse.json({ message: 'Asistencia desactivada correctamente' }, { status: 200 })
  } catch (error) {
    console.error('Error al desactivar asistencia:', error)
    return NextResponse.json(
      { error: 'Error al desactivar la asistencia' },
      { status: 500 }
    )
  }
}

