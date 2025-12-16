import { NextRequest, NextResponse } from "next/server"

const DJANGO_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const url = `${DJANGO_API_BASE}/api/taller/ordenes/${id}/cambiar_estado/`

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

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error en POST /api/taller/ordenes/[id]/cambiar_estado:", error)
    return NextResponse.json({ error: error.message || "Error al cambiar estado de la orden" }, { status: 500 })
  }
}

