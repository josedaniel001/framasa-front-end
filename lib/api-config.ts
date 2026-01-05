/**
 * Configuración de la API
 * Todos los endpoints apuntan directamente a Django (localhost:8000/api)
 * Lee las variables de entorno desde .env
 */

/**
 * Obtiene la URL base de Django
 * En el servidor (rutas API), usa DJANGO_API_URL que puede ser configurada en runtime
 * En el cliente, usa NEXT_PUBLIC_API_URL que se embebe en el build
 */
function getDjangoApiBase(): string {
  // En el servidor, preferir DJANGO_API_URL (puede ser configurada en runtime)
  if (typeof window === 'undefined') {
    return process.env.DJANGO_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  }
  // En el cliente (navegador), SIEMPRE usar NEXT_PUBLIC_API_URL
  // El navegador necesita una URL pública accesible, no una URL interna de Docker
  const clientUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  // Log para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [API Config] URL de Django para cliente:', clientUrl)
  }
  
  return clientUrl
}

// URL base de Django
// Esta constante se usa para todos los endpoints que apuntan directamente a Django
const DJANGO_API_BASE = getDjangoApiBase()

/**
 * Obtiene la URL base de Django para uso en rutas API del servidor
 * Esta función siempre prioriza DJANGO_API_URL sobre NEXT_PUBLIC_API_URL
 * para permitir configuración en runtime dentro de contenedores Docker
 */
export function getDjangoApiUrl(): string {
  // En el servidor, preferir DJANGO_API_URL que puede ser configurada en runtime
  return process.env.DJANGO_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
}

// Helper para construir endpoints de Django directamente
function djangoApiEndpoint(path: string): string {
  // Remover el prefijo /api si ya existe en el path
  const cleanPath = path.startsWith('/api/') ? path : `/api${path}`
  // Asegurar que termine con /
  const finalPath = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`
  return `${DJANGO_API_BASE}${finalPath}`
}

export const API_ENDPOINTS = {
  AUTH: {
    // Autenticación va directo a Django
    LOGIN: djangoApiEndpoint('/api/auth/login/'),
    VERIFY: djangoApiEndpoint('/api/auth/verify/'),
    LOGOUT: djangoApiEndpoint('/api/auth/logout/'),
  },
  FERRETERIA: {
    // Todos los endpoints apuntan directamente a Django
    get PRODUCTOS() {
      return djangoApiEndpoint('/api/ferreteria/productos/')
    },
    PRODUCTOS_STATS: djangoApiEndpoint('/api/ferreteria/productos/stats/'),
    PRODUCTOS_CATEGORIAS: djangoApiEndpoint('/api/ferreteria/productos/categorias/'),
    get CATEGORIAS() {
      return djangoApiEndpoint('/api/ferreteria/categorias/')
    },
    get UNIDADES_MEDIDA() {
      return djangoApiEndpoint('/api/ferreteria/unidades-medida/')
    },
    get MOVIMIENTOS_INVENTARIO() {
      return djangoApiEndpoint('/api/ferreteria/movimientos-inventario/')
    },
    MOVIMIENTOS_INVENTARIO_STATS: djangoApiEndpoint('/api/ferreteria/movimientos-inventario/stats/'),
    get CLIENTES() {
      return djangoApiEndpoint('/api/ferreteria/clientes/')
    },
    get CLIENTES_STATS() {
      return djangoApiEndpoint('/api/ferreteria/clientes/stats/')
    },
    get PROVEEDORES() {
      return djangoApiEndpoint('/api/ferreteria/proveedores/')
    },
  },
  BLOQUERA: {
    get PRODUCTOS() {
      return djangoApiEndpoint('/api/bloquera/productos/')
    },
    PRODUCTOS_STATS: djangoApiEndpoint('/api/bloquera/productos/stats/'),
    get MOVIMIENTOS_INVENTARIO() {
      return djangoApiEndpoint('/api/bloquera/movimientos-inventario/')
    },
  },
  PIEDRINERA: {
    get PRODUCTOS() {
      return djangoApiEndpoint('/api/piedrinera/productos/')
    },
    PRODUCTOS_STATS: djangoApiEndpoint('/api/piedrinera/productos/stats/'),
    get CAMIONES() {
      return djangoApiEndpoint('/api/piedrinera/camiones/')
    },
    get MOVIMIENTOS_INVENTARIO() {
      return djangoApiEndpoint('/api/piedrinera/movimientos-inventario/')
    },
  },
  PLANILLAS: {
    get EMPLEADOS() {
      return djangoApiEndpoint('/api/planillas/empleados/')
    },
    get EMPLEADOS_STATS() {
      return djangoApiEndpoint('/api/planillas/empleados/stats/')
    },
    get CARGOS() {
      return djangoApiEndpoint('/api/planillas/cargos/')
    },
    // Asistencias
    get ASISTENCIAS() {
      return djangoApiEndpoint('/api/planillas/asistencias/')
    },
    ASISTENCIA(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/asistencias/${id}/`)
    },
    get ASISTENCIAS_STATS() {
      return djangoApiEndpoint('/api/planillas/asistencias/stats/')
    },
    ASISTENCIA_TOGGLE_ACTIVO(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/asistencias/${id}/toggle_activo/`)
    },
    ASISTENCIA_MARCAR_SALIDA(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/asistencias/${id}/marcar_salida/`)
    },
    get EMPLEADOS_SIN_ASISTENCIA_HOY() {
      return djangoApiEndpoint('/api/planillas/asistencias/empleados_sin_asistencia_hoy/')
    },
    // Nóminas
    get NOMINAS() {
      return djangoApiEndpoint('/api/planillas/nominas/')
    },
    NOMINA(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/nominas/${id}/`)
    },
    get NOMINAS_STATS() {
      return djangoApiEndpoint('/api/planillas/nominas/stats/')
    },
    NOMINA_RECALCULAR(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/nominas/${id}/recalcular/`)
    },
    NOMINA_CAMBIAR_ESTADO(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/nominas/${id}/cambiar_estado/`)
    },
    NOMINA_TOGGLE_ACTIVO(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/nominas/${id}/toggle_activo/`)
    },
    // Detalle de Nóminas
    get NOMINAS_DETALLE() {
      return djangoApiEndpoint('/api/planillas/nominas-detalle/')
    },
    NOMINA_DETALLE(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/nominas-detalle/${id}/`)
    },
    NOMINA_DETALLE_AJUSTAR(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/nominas-detalle/${id}/ajustar/`)
    },
    NOMINA_DETALLE_PAGAR(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/nominas-detalle/${id}/pagar/`)
    },
    NOMINA_DETALLE_ANULAR(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/nominas-detalle/${id}/anular/`)
    },
    NOMINA_DETALLE_QUITAR_ANULACION(id: number | string) {
      return djangoApiEndpoint(`/api/planillas/nominas-detalle/${id}/quitar_anulacion/`)
    },
  },
  TALLER: {
    get MAQUINARIA() {
      return djangoApiEndpoint('/api/taller/maquinaria/')
    },
    MAQUINARIA_ITEM(id: number | string) {
      return djangoApiEndpoint(`/api/taller/maquinaria/${id}/`)
    },
    get MAQUINARIA_TIPOS() {
      return djangoApiEndpoint('/api/taller/maquinaria/tipos/')
    },
    get MAQUINARIA_EMPRESAS() {
      return djangoApiEndpoint('/api/taller/maquinaria/empresas/')
    },
    // Órdenes de trabajo
    get ORDENES() {
      return djangoApiEndpoint('/api/taller/ordenes/')
    },
    ORDEN(id: number | string) {
      return djangoApiEndpoint(`/api/taller/ordenes/${id}/`)
    },
    ORDEN_CAMBIAR_ESTADO(id: number | string) {
      return djangoApiEndpoint(`/api/taller/ordenes/${id}/cambiar_estado/`)
    },
    ORDEN_ACTUALIZAR_PROGRESO(id: number | string) {
      return djangoApiEndpoint(`/api/taller/ordenes/${id}/actualizar_progreso/`)
    },
    ORDEN_DESACTIVAR(id: number | string) {
      return djangoApiEndpoint(`/api/taller/ordenes/${id}/desactivar/`)
    },
    ORDEN_ACTIVAR(id: number | string) {
      return djangoApiEndpoint(`/api/taller/ordenes/${id}/activar/`)
    },
    get ORDENES_ESTADISTICAS() {
      return djangoApiEndpoint('/api/taller/ordenes/estadisticas/')
    },
    get ORDENES_TIPOS_MANTENIMIENTO() {
      return djangoApiEndpoint('/api/taller/ordenes/tipos_mantenimiento/')
    },
    get ORDENES_PRIORIDADES() {
      return djangoApiEndpoint('/api/taller/ordenes/prioridades/')
    },
    get ORDENES_ESTADOS() {
      return djangoApiEndpoint('/api/taller/ordenes/estados/')
    },
  },
  REPORTES: {
    get INVENTARIO_UNIFICADO() {
      return djangoApiEndpoint('/api/reportes/inventario_unificado/')
    },
    get TOP_PRODUCTOS_VENDIDOS() {
      return djangoApiEndpoint('/api/reportes/top_productos_vendidos/')
    },
    get ESTADISTICAS_PREDICTIVAS() {
      return djangoApiEndpoint('/api/reportes/estadisticas_predictivas/')
    },
    get DASHBOARD_METRICS() {
      return djangoApiEndpoint('/api/reportes/dashboard_metrics/')
    },
  },
  FACTURACION: {
    get FACTURAS() {
      return djangoApiEndpoint('/api/facturacion/facturas/')
    },
    FACTURA(id: number | string) {
      return djangoApiEndpoint(`/api/facturacion/facturas/${id}/`)
    },
    FACTURA_AGREGAR_PAGOS_MULTIPLES(id: number | string) {
      return djangoApiEndpoint(`/api/facturacion/facturas/${id}/agregar-pagos-multiples/`)
    },
    FACTURA_ANULAR(id: number | string) {
      return djangoApiEndpoint(`/api/facturacion/facturas/${id}/anular/`)
    },
    get FACTURAS_ESTADISTICAS() {
      return djangoApiEndpoint('/api/facturacion/facturas/estadisticas/')
    },
    PAGOS: djangoApiEndpoint('/api/facturacion/pagos/'),
    PAGO: (id: string | number) => djangoApiEndpoint(`/api/facturacion/pagos/${id}/`),
    get COTIZACIONES() {
      return djangoApiEndpoint('/api/facturacion/cotizaciones/')
    },
    COTIZACION: (id: string | number) => djangoApiEndpoint(`/api/facturacion/cotizaciones/${id}/`),
    COTIZACION_ENVIAR: (id: string | number) => djangoApiEndpoint(`/api/facturacion/cotizaciones/${id}/enviar/`),
    COTIZACION_ACEPTAR: (id: string | number) => djangoApiEndpoint(`/api/facturacion/cotizaciones/${id}/aceptar/`),
    COTIZACION_RECHAZAR: (id: string | number) => djangoApiEndpoint(`/api/facturacion/cotizaciones/${id}/rechazar/`),
    COTIZACION_CONVERTIR_FACTURA: (id: string | number) => djangoApiEndpoint(`/api/facturacion/cotizaciones/${id}/convertir_a_factura/`),
  },
  CAJA: {
    get MOVIMIENTOS() {
      return djangoApiEndpoint('/api/caja/movimientos/')
    },
    MOVIMIENTO(id: number | string) {
      return djangoApiEndpoint(`/api/caja/movimientos/${id}/`)
    },
    get DETALLES() {
      return djangoApiEndpoint('/api/caja/detalles/')
    },
    DETALLE(id: number | string) {
      return djangoApiEndpoint(`/api/caja/detalles/${id}/`)
    },
  },
}

export default DJANGO_API_BASE
