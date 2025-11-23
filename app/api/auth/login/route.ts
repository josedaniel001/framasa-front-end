// ⚠️ ESTA RUTA YA NO SE USA
// La autenticación ahora se maneja completamente con Django JWT
// Ver: http://localhost:8000/api/auth/login/
// El frontend está configurado para usar Django en: lib/api-config.ts

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { 
      error: 'Esta ruta ya no se usa. La autenticación ahora se maneja con Django.',
      message: 'Usa: http://localhost:8000/api/auth/login/'
    },
    { status: 410 } // 410 Gone
  )
}

