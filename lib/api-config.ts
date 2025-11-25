/**
 * Configuración de la API
 * Usa rutas API locales de Next.js que actúan como proxy a Django
 */

// URL base de Django (solo para autenticación directa)
// Usar 127.0.0.1 en lugar de localhost para evitar problemas con IPv6
const DJANGO_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

// URL base para rutas API locales de Next.js
// Se calcula dinámicamente para funcionar tanto en cliente como servidor
export function getNextApiBase(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_NEXTJS_URL || 'http://localhost:3000'
}

// Helper para construir endpoints de Next.js API
function nextApiEndpoint(path: string): string {
  return `${getNextApiBase()}${path}`
}

export const API_ENDPOINTS = {
  AUTH: {
    // Autenticación sigue yendo directo a Django
    LOGIN: `${DJANGO_API_BASE}/api/auth/login/`,
    VERIFY: `${DJANGO_API_BASE}/api/auth/verify/`,
    LOGOUT: `${DJANGO_API_BASE}/api/auth/logout/`,
  },
  FERRETERIA: {
    // Rutas API locales que actúan como proxy a Django
    // Se calculan dinámicamente para usar la URL correcta
    get PRODUCTOS() {
      return nextApiEndpoint('/api/ferreteria/productos')
    },
    PRODUCTOS_STATS: `${DJANGO_API_BASE}/api/ferreteria/productos/stats/`,
    PRODUCTOS_CATEGORIAS: `${DJANGO_API_BASE}/api/ferreteria/productos/categorias/`,
    get CATEGORIAS() {
      return nextApiEndpoint('/api/ferreteria/categorias')
    },
    get UNIDADES_MEDIDA() {
      return nextApiEndpoint('/api/ferreteria/unidades-medida')
    },
    get MOVIMIENTOS_INVENTARIO() {
      return nextApiEndpoint('/api/ferreteria/movimientos-inventario')
    },
    MOVIMIENTOS_INVENTARIO_STATS: `${DJANGO_API_BASE}/api/ferreteria/movimientos-inventario/stats/`,
    get CLIENTES() {
      return nextApiEndpoint('/api/ferreteria/clientes')
    },
    get CLIENTES_STATS() {
      return nextApiEndpoint('/api/ferreteria/clientes/stats')
    },
  },
  BLOQUERA: {
    get PRODUCTOS() {
      return nextApiEndpoint('/api/bloquera/productos')
    },
    PRODUCTOS_STATS: `${DJANGO_API_BASE}/api/bloquera/productos/stats/`,
    get MOVIMIENTOS_INVENTARIO() {
      return nextApiEndpoint('/api/bloquera/movimientos-inventario')
    },
  },
  PIEDRINERA: {
    get PRODUCTOS() {
      return nextApiEndpoint('/api/piedrinera/productos')
    },
    PRODUCTOS_STATS: `${DJANGO_API_BASE}/api/piedrinera/productos/stats/`,
    get CAMIONES() {
      return nextApiEndpoint('/api/piedrinera/camiones')
    },
    get MOVIMIENTOS_INVENTARIO() {
      return nextApiEndpoint('/api/piedrinera/movimientos-inventario')
    },
  },
  PLANILLAS: {
    get EMPLEADOS() {
      return nextApiEndpoint('/api/planillas/empleados')
    },
    get EMPLEADOS_STATS() {
      return nextApiEndpoint('/api/planillas/empleados/stats')
    },
  },
  REPORTES: {
    get INVENTARIO_UNIFICADO() {
      return nextApiEndpoint('/api/reportes/inventario-unificado')
    },
    get TOP_PRODUCTOS_VENDIDOS() {
      return nextApiEndpoint('/api/reportes/top-productos-vendidos')
    },
    get ESTADISTICAS_PREDICTIVAS() {
      return nextApiEndpoint('/api/reportes/estadisticas-predictivas')
    },
  },
  FACTURACION: {
    get FACTURAS() {
      return nextApiEndpoint('/api/facturacion/facturas')
    },
    FACTURA(id: number | string) {
      return `${nextApiEndpoint('/api/facturacion/facturas')}/${id}`
    },
    FACTURA_AGREGAR_PAGOS_MULTIPLES(id: number | string) {
      return `${nextApiEndpoint('/api/facturacion/facturas')}/${id}/agregar-pagos-multiples`
    },
    FACTURA_ANULAR(id: number | string) {
      return `${nextApiEndpoint('/api/facturacion/facturas')}/${id}/anular`
    },
    get FACTURAS_ESTADISTICAS() {
      return nextApiEndpoint('/api/facturacion/facturas/estadisticas')
    },
  },
}

export default DJANGO_API_BASE

