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

    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const url = `${DJANGO_API_BASE}/api/taller/maquinaria/${queryString ? `?${queryString}` : ""}`

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
    console.error("Error en GET /api/taller/maquinaria:", error)
    return NextResponse.json({ error: error.message || "Error al obtener maquinaria" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const url = `${DJANGO_API_BASE}/api/taller/maquinaria/`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error("Error en POST /api/taller/maquinaria:", error)
    return NextResponse.json({ error: error.message || "Error al crear maquinaria" }, { status: 500 })
  }
}

