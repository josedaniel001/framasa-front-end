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
    get PROVEEDORES() {
      return nextApiEndpoint('/api/ferreteria/proveedores')
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
    get CARGOS() {
      return nextApiEndpoint('/api/planillas/cargos')
    },
    // Asistencias
    get ASISTENCIAS() {
      return nextApiEndpoint('/api/planillas/asistencias')
    },
    ASISTENCIA(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/asistencias')}/${id}`
    },
    get ASISTENCIAS_STATS() {
      return nextApiEndpoint('/api/planillas/asistencias/stats')
    },
    ASISTENCIA_TOGGLE_ACTIVO(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/asistencias')}/${id}/toggle_activo`
    },
    ASISTENCIA_MARCAR_SALIDA(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/asistencias')}/${id}/marcar_salida`
    },
    get EMPLEADOS_SIN_ASISTENCIA_HOY() {
      return nextApiEndpoint('/api/planillas/asistencias/empleados_sin_asistencia_hoy')
    },
    // Nóminas
    get NOMINAS() {
      return nextApiEndpoint('/api/planillas/nominas')
    },
    NOMINA(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/nominas')}/${id}`
    },
    get NOMINAS_STATS() {
      return nextApiEndpoint('/api/planillas/nominas/stats')
    },
    NOMINA_RECALCULAR(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/nominas')}/${id}/recalcular`
    },
    NOMINA_CAMBIAR_ESTADO(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/nominas')}/${id}/cambiar_estado`
    },
    NOMINA_TOGGLE_ACTIVO(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/nominas')}/${id}/toggle_activo`
    },
    // Detalle de Nóminas
    get NOMINAS_DETALLE() {
      return nextApiEndpoint('/api/planillas/nominas-detalle')
    },
    NOMINA_DETALLE(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/nominas-detalle')}/${id}`
    },
    NOMINA_DETALLE_AJUSTAR(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/nominas-detalle')}/${id}/ajustar`
    },
    NOMINA_DETALLE_PAGAR(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/nominas-detalle')}/${id}/pagar`
    },
    NOMINA_DETALLE_ANULAR(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/nominas-detalle')}/${id}/anular`
    },
    NOMINA_DETALLE_QUITAR_ANULACION(id: number | string) {
      return `${nextApiEndpoint('/api/planillas/nominas-detalle')}/${id}/quitar_anulacion`
    },
  },
  TALLER: {
    get MAQUINARIA() {
      return nextApiEndpoint('/api/taller/maquinaria')
    },
    MAQUINARIA_ITEM(id: number | string) {
      return `${nextApiEndpoint('/api/taller/maquinaria')}/${id}`
    },
    get MAQUINARIA_TIPOS() {
      return nextApiEndpoint('/api/taller/maquinaria/tipos')
    },
    get MAQUINARIA_EMPRESAS() {
      return nextApiEndpoint('/api/taller/maquinaria/empresas')
    },
    // Órdenes de trabajo
    get ORDENES() {
      return nextApiEndpoint('/api/taller/ordenes')
    },
    ORDEN(id: number | string) {
      return `${nextApiEndpoint('/api/taller/ordenes')}/${id}`
    },
    ORDEN_CAMBIAR_ESTADO(id: number | string) {
      return `${nextApiEndpoint('/api/taller/ordenes')}/${id}/cambiar_estado`
    },
    ORDEN_ACTUALIZAR_PROGRESO(id: number | string) {
      return `${nextApiEndpoint('/api/taller/ordenes')}/${id}/actualizar_progreso`
    },
    ORDEN_DESACTIVAR(id: number | string) {
      return `${nextApiEndpoint('/api/taller/ordenes')}/${id}/desactivar`
    },
    ORDEN_ACTIVAR(id: number | string) {
      return `${nextApiEndpoint('/api/taller/ordenes')}/${id}/activar`
    },
    get ORDENES_ESTADISTICAS() {
      return nextApiEndpoint('/api/taller/ordenes/estadisticas')
    },
    get ORDENES_TIPOS_MANTENIMIENTO() {
      return nextApiEndpoint('/api/taller/ordenes/tipos_mantenimiento')
    },
    get ORDENES_PRIORIDADES() {
      return nextApiEndpoint('/api/taller/ordenes/prioridades')
    },
    get ORDENES_ESTADOS() {
      return nextApiEndpoint('/api/taller/ordenes/estados')
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
    get DASHBOARD_METRICS() {
      return nextApiEndpoint('/api/reportes/dashboard_metrics')
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
      return `${DJANGO_API_BASE}/api/facturacion/facturas/${id}/anular/`
    },
    get FACTURAS_ESTADISTICAS() {
      return nextApiEndpoint('/api/facturacion/facturas/estadisticas')
    },
    PAGOS: nextApiEndpoint('/api/facturacion/pagos'),
    PAGO: (id: string | number) => nextApiEndpoint(`/api/facturacion/pagos/${id}`),
    get COTIZACIONES() {
      return nextApiEndpoint('/api/facturacion/cotizaciones')
    },
    COTIZACION: (id: string | number) => nextApiEndpoint(`/api/facturacion/cotizaciones/${id}`),
    COTIZACION_ENVIAR: (id: string | number) => nextApiEndpoint(`/api/facturacion/cotizaciones/${id}/enviar`),
    COTIZACION_ACEPTAR: (id: string | number) => nextApiEndpoint(`/api/facturacion/cotizaciones/${id}/aceptar`),
    COTIZACION_RECHAZAR: (id: string | number) => nextApiEndpoint(`/api/facturacion/cotizaciones/${id}/rechazar`),
    COTIZACION_CONVERTIR_FACTURA: (id: string | number) => nextApiEndpoint(`/api/facturacion/cotizaciones/${id}/convertir_a_factura`),
  },
}

export default DJANGO_API_BASE
