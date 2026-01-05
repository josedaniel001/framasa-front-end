import { NextRequest, NextResponse } from "next/server"
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_BASE = getDjangoApiUrl()

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = `${DJANGO_API_BASE}/api/taller/maquinaria/tipos/`

    const response = await fetch(url, {
      method: "GET",
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
    console.error("Error en GET /api/taller/maquinaria/tipos:", error)
    return NextResponse.json({ error: error.message || "Error al obtener tipos de maquinaria" }, { status: 500 })
  }
}

