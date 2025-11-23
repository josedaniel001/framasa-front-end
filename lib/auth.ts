import jwt, { type SignOptions } from 'jsonwebtoken'
import type { Usuario, RolSistema } from '@/types/database'

// Clave secreta para firmar los tokens (debe estar en variables de entorno)
const JWT_SECRET: string = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura-cambiar-en-produccion'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h'

// Interfaz para el payload del token
export interface TokenPayload {
  userId: number
  username: string
  email: string
  rol: RolSistema
}

// Función para generar un token JWT
export function generateToken(usuario: Usuario): string {
  const payload: TokenPayload = {
    userId: usuario.id,
    username: usuario.username,
    email: usuario.email,
    rol: usuario.rol,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions)
}

// Función para verificar y decodificar un token
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Función para extraer el token del header Authorization
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// Función para verificar si un token es válido (sin decodificar)
export function isTokenValid(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

