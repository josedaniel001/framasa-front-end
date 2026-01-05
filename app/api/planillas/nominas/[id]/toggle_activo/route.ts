import { NextRequest, NextResponse } from "next/server"
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_BASE = getDjangoApiUrl()

// PATCH - Toggle activo de nómina
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json(
        { error: "Token no proporcionado", redirect: "/login" },
        { status: 401 }
      )
    }

    const response = await fetch(`${DJANGO_API_BASE}/api/planillas/nominas/${id}/toggle_activo/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error al toggle activo de nómina:", error)
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}

