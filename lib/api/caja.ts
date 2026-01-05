/**
 * Funciones API para movimientos de caja
 */

import { API_ENDPOINTS } from '@/lib/api-config'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'

export interface MovimientoCajaDetalle {
  id: number
  movimiento: number
  producto_nombre: string
  cantidad: number
  costo_total: number
  created_at: string
}

export interface MovimientoCaja {
  id: number
  empresa: string
  tipo: 'ENTRADA' | 'SALIDA'
  fecha_hora: string
  referencia?: string | null
  descripcion?: string | null
  total: number
  estado: 'BORRADOR' | 'CONFIRMADO' | 'ANULADO'
  created_by_id?: number | null
  created_at: string
  updated_at: string
  detalles?: MovimientoCajaDetalle[]
}

export interface MovimientoCajaDetalleCreate {
  producto_nombre: string
  cantidad: number
  unidad_medida?: number | null
  costo_total: number
}

export interface MovimientoCajaCreate {
  empresa: string
  tipo: 'ENTRADA' | 'SALIDA'
  referencia?: string
  descripcion?: string
  total: number
  estado?: 'BORRADOR' | 'CONFIRMADO' | 'ANULADO'
  detalles_create: MovimientoCajaDetalleCreate[]
}

export interface MovimientoCajaListResponse {
  count: number
  next: string | null
  previous: string | null
  results: MovimientoCaja[]
}

export interface EstadisticasCaja {
  total_entradas: number
  total_salidas: number
  saldo_actual: number
}

/**
 * Obtiene la lista de movimientos de caja con filtros y paginación
 */
export async function getMovimientosCaja(params?: {
  page?: number
  empresa?: string
  tipo?: 'ENTRADA' | 'SALIDA' | 'todos'
  estado?: string
  search?: string
  fecha?: string
}): Promise<MovimientoCajaListResponse> {
  const queryParams = new URLSearchParams()
  
  if (params?.page) queryParams.append('page', String(params.page))
  if (params?.empresa && params.empresa !== 'todos') queryParams.append('empresa', params.empresa)
  if (params?.tipo && params.tipo !== 'todos') queryParams.append('tipo', params.tipo)
  if (params?.estado) queryParams.append('estado', params.estado)
  if (params?.search) queryParams.append('search', params.search)
  
  const queryString = queryParams.toString()
  const url = queryString 
    ? `${API_ENDPOINTS.CAJA.MOVIMIENTOS}?${queryString}`
    : API_ENDPOINTS.CAJA.MOVIMIENTOS
  
  return apiGet<MovimientoCajaListResponse>(url)
}

/**
 * Obtiene un movimiento de caja por ID
 */
export async function getMovimientoCaja(id: number | string): Promise<MovimientoCaja> {
  return apiGet<MovimientoCaja>(API_ENDPOINTS.CAJA.MOVIMIENTO(id))
}

/**
 * Crea un nuevo movimiento de caja
 */
export async function createMovimientoCaja(data: MovimientoCajaCreate): Promise<MovimientoCaja> {
  return apiPost<MovimientoCaja>(API_ENDPOINTS.CAJA.MOVIMIENTOS, data)
}

/**
 * Actualiza un movimiento de caja existente
 */
export async function updateMovimientoCaja(
  id: number | string,
  data: Partial<MovimientoCajaCreate>
): Promise<MovimientoCaja> {
  return apiPut<MovimientoCaja>(API_ENDPOINTS.CAJA.MOVIMIENTO(id), data)
}

/**
 * Actualiza parcialmente un movimiento de caja
 */
export async function patchMovimientoCaja(
  id: number | string,
  data: Partial<MovimientoCajaCreate>
): Promise<MovimientoCaja> {
  return apiPatch<MovimientoCaja>(API_ENDPOINTS.CAJA.MOVIMIENTO(id), data)
}

/**
 * Elimina un movimiento de caja
 */
export async function deleteMovimientoCaja(id: number | string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.CAJA.MOVIMIENTO(id))
}

/**
 * Calcula las estadísticas de caja desde los movimientos
 */
export async function getEstadisticasCaja(params?: {
  empresa?: string
  fecha?: string
}): Promise<EstadisticasCaja> {
  const queryParams = new URLSearchParams()
  if (params?.empresa && params.empresa !== 'todos') {
    queryParams.append('empresa', params.empresa)
  }
  if (params?.fecha) {
    queryParams.append('fecha', params.fecha)
  }
  
  // Obtener todos los movimientos confirmados para calcular estadísticas
  const queryString = queryParams.toString()
  const url = queryString 
    ? `${API_ENDPOINTS.CAJA.MOVIMIENTOS}?estado=CONFIRMADO&${queryString}`
    : `${API_ENDPOINTS.CAJA.MOVIMIENTOS}?estado=CONFIRMADO`
  
  const response = await getMovimientosCaja({
    ...params,
    estado: 'CONFIRMADO',
  })
  
  const entradas = response.results
    .filter(m => m.tipo === 'ENTRADA')
    .reduce((sum, m) => sum + Number(m.total), 0)
  
  const salidas = response.results
    .filter(m => m.tipo === 'SALIDA')
    .reduce((sum, m) => sum + Number(m.total), 0)
  
  return {
    total_entradas: entradas,
    total_salidas: salidas,
    saldo_actual: entradas - salidas,
  }
}

