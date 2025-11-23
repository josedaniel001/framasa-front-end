export enum ModuloSistema {
  DASHBOARD = "dashboard",
  FERRETERIA = "ferreteria",
  BLOQUERA = "bloquera",
  PIEDRINERA = "piedrinera",
  TALLER = "taller",
  PLANILLAS = "planillas",
  REPORTES = "reportes",
}

export enum RolSistema {
  ADMIN = "admin",
  GERENTE = "gerente",
  VENDEDOR = "vendedor",
  OPERADOR = "operador",
}

export enum EstadoVenta {
  PENDIENTE = "pendiente",
  COMPLETADA = "completada",
  CANCELADA = "cancelada",
}

export enum TipoVenta {
  CONTADO = "contado",
  CREDITO = "credito",
}

export enum EstadoPago {
  PAGADO = "pagado",
  PENDIENTE = "pendiente",
  PARCIAL = "parcial",
  VENCIDO = "vencido",
}

export enum EstadoCotizacion {
  BORRADOR = "borrador",
  ENVIADA = "enviada",
  APROBADA = "aprobada",
  RECHAZADA = "rechazada",
  VENCIDA = "vencida",
}

export enum EstadoOrden {
  PENDIENTE = "pendiente",
  EN_PROCESO = "en_proceso",
  COMPLETADA = "completada",
  CANCELADA = "cancelada",
}

export enum EstadoProduccion {
  PLANIFICADA = "planificada",
  EN_PROCESO = "en_proceso",
  COMPLETADA = "completada",
  PAUSADA = "pausada",
}

export enum TipoMovimiento {
  ENTRADA = "ENTRADA",
  SALIDA = "SALIDA",
  CORRECCION = "CORRECCION",
  AJUSTE = "AJUSTE",
  TRANSFERENCIA = "TRANSFERENCIA",
}

export interface Usuario {
  id: number
  username: string
  email: string
  rol: RolSistema
  activo: boolean
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
  activo: boolean
}

export interface Cliente {
  id: number
  nombre: string
  email: string
  telefono: string
  direccion: string
  activo: boolean
}

export interface Venta {
  id: number
  clienteId: number
  fecha: string
  total: number
  estado: string
  productos: Array<{
    productoId: number
    cantidad: number
    precio: number
  }>
}

// Tipos para ventas a crédito
export interface Pago {
  id: string
  ventaId: string
  monto: number
  fechaPago: Date
  metodoPago: "efectivo" | "transferencia" | "cheque" | "otro"
  referencia?: string
  observaciones?: string
  usuarioId: string
  fechaCreacion: Date
}

// Tipos específicos para Ferretería
export interface ClienteFerreteria {
  id: number
  nombre: string
  nit: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
  activo: boolean
  fecha_registro: string
  created_at: string
  updated_at: string
  // Campos adicionales para compatibilidad con el frontend
  fechaRegistro?: string
  // Estadísticas opcionales (pueden venir del backend o calcularse)
  numero_facturas?: number
  total_compras?: number
  numero_cotizaciones?: number
  ultimaCompra?: string | null
  deudaPendiente?: number
  numeroVentasPendientes?: number
  ventasPendientes?: any[]
}

export interface VentaFerreteria {
  id: string
  codigo: string
  fecha: string
  cliente: string
  clienteId?: string
  total: number
  estado: string
  tipoVenta?: TipoVenta
  fechaVencimiento?: string
  montoPagado?: number
  saldoPendiente?: number
  estadoPago?: EstadoPago
  items: Array<{
    productoId: string
    nombreProducto: string
    cantidad: number
    precioUnitario: number
    subtotal: number
  }>
  notas?: string
  pagos?: Pago[]
}

export interface ItemVenta {
  id: string
  productoId: string
  producto: Producto
  cantidad: number
  precio: number
  descuento: number
  subtotal: number
}

// Tipos específicos para Bloquera
export interface ProductoBloquera {
  id: number | string
  codigo: string
  nombre: string
  descripcion?: string | null
  tipoBloque: string
  dimensiones?: string | null
  precioVentaUnitario: number
  costoProduccionUnitario: number
  stockActual: number
  stockMinimo: number
  activo: boolean
  fechaCreacion?: string
  ultimaActualizacion?: string
  // Campos adicionales para compatibilidad
  tieneStockBajo?: boolean
  // Campos en snake_case para compatibilidad con API
  tipo_bloque?: string
  precio_unitario?: number
  costo_produccion?: number
  stock_actual?: number
  stock_minimo?: number
  created_at?: string
  updated_at?: string
}

export interface Cotizacion {
  id: string
  numero: string
  clienteId: string
  cliente: Cliente
  fecha: Date
  fechaVencimiento: Date
  subtotal: number
  impuestos: number
  descuento: number
  total: number
  estado: EstadoCotizacion
  vendedorId: string
  items: ItemCotizacion[]
  observaciones?: string
}

export interface ItemCotizacion {
  id: string
  productoId: string
  producto: Producto
  cantidad: number
  precio: number
  descuento: number
  subtotal: number
}

export interface MovimientoInventario {
  id: number
  producto_id: number
  producto?: {
    id: number
    codigo?: string
    nombre: string
    descripcion?: string
    categoria?: string
  }
  tipo_ajuste: "ENTRADA" | "SALIDA" | "CORRECCION"
  cantidad: number
  stock_anterior: number
  stock_nuevo: number
  razon: string
  referencia?: string | null
  usuario_id?: number | null
  usuario?: {
    id: number
    username: string
    first_name?: string
    last_name?: string
  }
  fecha_creacion: string
}

export interface OrdenTrabajo {
  id: string
  numero: string
  clienteId?: string
  cliente?: Cliente
  equipoId?: string
  descripcion: string
  fechaCreacion: Date
  fechaInicio?: Date
  fechaFinalizacion?: Date
  estado: EstadoOrden
  prioridad: "baja" | "media" | "alta" | "urgente"
  tecnicoId?: string
  materiales: MaterialOrden[]
  servicios: ServicioOrden[]
  observaciones?: string
  costoMateriales: number
  costoServicios: number
  costoTotal: number
}

export interface MaterialOrden {
  id: string
  productoId: string
  producto: Producto
  cantidad: number
  costo: number
  subtotal: number
}

export interface ServicioOrden {
  id: string
  servicioId: string
  descripcion: string
  horas: number
  costoHora: number
  subtotal: number
}

export interface LoteProduccion {
  id: string
  numero: string
  productoId: string
  producto: Producto
  cantidadPlanificada: number
  cantidadProducida: number
  fechaInicio: Date
  fechaFinalizacion?: Date
  estado: EstadoProduccion
  operadorId: string
  observaciones?: string
  costoMateriales: number
  costoManoObra: number
  costoTotal: number
}

export interface Despacho {
  id: string
  numero: string
  clienteId: string
  cliente: Cliente
  camionId: string
  conductorId: string
  fecha: Date
  productos: ProductoDespacho[]
  estado: "pendiente" | "en_ruta" | "entregado" | "cancelado"
  observaciones?: string
}

export interface ProductoDespacho {
  id: string
  productoId: string
  producto: Producto
  cantidad: number
  peso?: number
}

export interface Camion {
  id: string
  placa: string
  marca: string
  modelo: string
  capacidad: number
  activo: boolean
  conductorId?: string
}

export interface Empleado {
  id: string
  codigo: string
  nombres: string
  apellidos: string
  cedula: string
  telefono?: string
  email?: string
  cargo: string
  salario: number
  fechaIngreso: Date
  activo: boolean
}
