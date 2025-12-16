import { NextRequest, NextResponse } from "next/server"

const DJANGO_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

// GET - Obtener estadísticas de nóminas
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json(
        { error: "Token no proporcionado", redirect: "/login" },
        { status: 401 }
      )
    }

    const response = await fetch(`${DJANGO_API_BASE}/api/planillas/nominas/stats/`, {
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
    console.error("Error al obtener estadísticas de nóminas:", error)
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}

