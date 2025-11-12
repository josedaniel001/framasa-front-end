import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/", "/login"]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Para todas las demás rutas, permitir el acceso
  // La verificación de autenticación se maneja en el cliente
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
