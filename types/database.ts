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
  ENTRADA = "entrada",
  SALIDA = "salida",
  AJUSTE = "ajuste",
  TRANSFERENCIA = "transferencia",
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
  id: string
  nombre: string
  nit: string
  direccion: string
  telefono: string
  email: string
  fechaRegistro: string
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
  id: string
  productoId: string
  producto: Producto
  tipo: TipoMovimiento
  cantidad: number
  cantidadAnterior: number
  cantidadNueva: number
  costo?: number
  referencia?: string
  observaciones?: string
  usuarioId: string
  fecha: Date
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
