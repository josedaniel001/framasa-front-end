import {
  type ProductoFerreteria,
  type VentaFerreteria,
  type ClienteFerreteria,
  type CotizacionFerreteria,
  type InventarioFerreteriaItem,
  type ProductoBloquera,
  type OrdenProduccionBloquera,
  type InventarioBloqueraItem,
  type AgregadoPiedrinera,
  type DespachoPiedrinera,
  type CamionPiedrinera,
  type VentaPiedrinera,
  type ProduccionPiedrineraLote,
  type InventarioPiedrineraItem,
  type OrdenTrabajoTaller,
  type MaterialTaller,
  type ServicioTaller,
  type EquipoTaller,
  ModuloSistema,
  RolSistema,
  type Usuario,
  type Empleado,
  type Cliente,
  type Producto,
  type CategoriaProducto,
  type UnidadMedida,
  type Bodega,
  type Inventario,
  type Cotizacion,
  type DetalleVenta,
  TipoMovimiento,
  EstadoVenta,
  EstadoCotizacion,
  EstadoOrden,
  EstadoProduccion,
  TipoVenta,
  EstadoPago,
  type Venta,
  type MovimientoInventario,
  type OrdenTrabajo,
  type LoteProduccion,
  type Camion,
  type Despacho,
  type Pago,
} from "@/types/database"

// Sample User Data
export const sampleUsuarios: Usuario[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@framasa.com",
    rol: RolSistema.ADMIN,
    activo: true,
  },
  {
    id: 2,
    username: "gerente",
    email: "gerente@framasa.com",
    rol: RolSistema.GERENTE,
    activo: true,
  },
  {
    id: 3,
    username: "vendedor",
    email: "vendedor@framasa.com",
    rol: RolSistema.VENDEDOR,
    activo: true,
  },
  {
    id: 4,
    username: "operador",
    email: "operador@framasa.com",
    rol: RolSistema.OPERADOR,
    activo: true,
  },
]

// Alias para compatibilidad con código que usa el nombre en español
export const sampleUsers = sampleUsuarios

// Ferretería Sample Data
export function getSampleProductosFerreteria(): ProductoFerreteria[] {
  return [
    {
      id: "prod1",
      codigo: "F-001",
      nombre: "Martillo de Uña 16oz",
      descripcion: "Martillo de uña con mango de fibra de vidrio, 16 onzas.",
      categoria: "Herramientas Manuales",
      precioVenta: 75.0,
      costoUnitario: 45.0,
      unidadMedida: "unidad",
      stockActual: 150,
      stockMinimo: 50,
      activo: true,
      fechaCreacion: "2023-01-15",
      ultimaActualizacion: "2024-06-01",
    },
    {
      id: "prod2",
      codigo: "F-002",
      nombre: "Caja de Tornillos Mixtos",
      descripcion: "Caja con 500 tornillos de diferentes tamaños y tipos.",
      categoria: "Fijaciones",
      precioVenta: 120.0,
      costoUnitario: 70.0,
      unidadMedida: "caja",
      stockActual: 80,
      stockMinimo: 30,
      activo: true,
      fechaCreacion: "2023-02-20",
      ultimaActualizacion: "2024-05-28",
    },
    {
      id: "prod3",
      codigo: "F-003",
      nombre: "Pintura Blanca Acrílica 1 Galón",
      descripcion: "Pintura acrílica de alta calidad para interiores y exteriores.",
      categoria: "Pinturas",
      precioVenta: 250.0,
      costoUnitario: 150.0,
      unidadMedida: "galón",
      stockActual: 60,
      stockMinimo: 20,
      activo: true,
      fechaCreacion: "2023-03-10",
      ultimaActualizacion: "2024-06-05",
    },
    {
      id: "prod4",
      codigo: "F-004",
      nombre: "Taladro Percutor 1/2 pulg.",
      descripcion: "Taladro eléctrico con función percutora, 750W.",
      categoria: "Herramientas Eléctricas",
      precioVenta: 850.0,
      costoUnitario: 500.0,
      unidadMedida: "unidad",
      stockActual: 25,
      stockMinimo: 10,
      activo: true,
      fechaCreacion: "2023-04-01",
      ultimaActualizacion: "2024-06-03",
    },
    {
      id: "prod5",
      codigo: "F-005",
      nombre: "Set de Llaves Combinadas",
      descripcion: "Set de 12 llaves combinadas de cromo vanadio.",
      categoria: "Herramientas Manuales",
      precioVenta: 300.0,
      costoUnitario: 180.0,
      unidadMedida: "set",
      stockActual: 40,
      stockMinimo: 15,
      activo: true,
      fechaCreacion: "2023-05-05",
      ultimaActualizacion: "2024-05-30",
    },
    {
      id: "prod6",
      codigo: "F-006",
      nombre: "Silicona Acética Transparente",
      descripcion: "Sellador de silicona para uso general, 300ml.",
      categoria: "Adhesivos y Selladores",
      precioVenta: 35.0,
      costoUnitario: 20.0,
      unidadMedida: "unidad",
      stockActual: 200,
      stockMinimo: 75,
      activo: true,
      fechaCreacion: "2023-06-12",
      ultimaActualizacion: "2024-06-02",
    },
    {
      id: "prod7",
      codigo: "F-007",
      nombre: "Brocha de 2 pulgadas",
      descripcion: "Brocha de cerdas sintéticas para pintura.",
      categoria: "Accesorios de Pintura",
      precioVenta: 15.0,
      costoUnitario: 8.0,
      unidadMedida: "unidad",
      stockActual: 300,
      stockMinimo: 100,
      activo: true,
      fechaCreacion: "2023-07-01",
      ultimaActualizacion: "2024-06-01",
    },
    {
      id: "prod8",
      codigo: "F-008",
      nombre: "Lija para Madera Grano 120",
      descripcion: "Pliego de lija para madera, grano medio.",
      categoria: "Abrasivos",
      precioVenta: 5.0,
      costoUnitario: 2.5,
      unidadMedida: "pliego",
      stockActual: 500,
      stockMinimo: 200,
      activo: true,
      fechaCreacion: "2023-08-01",
      ultimaActualizacion: "2024-05-29",
    },
    {
      id: "prod9",
      codigo: "F-009",
      nombre: "Candado de Seguridad 50mm",
      descripcion: "Candado de latón con grillete de acero endurecido.",
      categoria: "Seguridad",
      precioVenta: 90.0,
      costoUnitario: 55.0,
      unidadMedida: "unidad",
      stockActual: 70,
      stockMinimo: 25,
      activo: true,
      fechaCreacion: "2023-09-01",
      ultimaActualizacion: "2024-06-04",
    },
    {
      id: "prod10",
      codigo: "F-010",
      nombre: "Guantes de Trabajo Reforzados",
      descripcion: "Guantes de cuero y tela para trabajo pesado.",
      categoria: "Equipo de Protección Personal",
      precioVenta: 45.0,
      costoUnitario: 28.0,
      unidadMedida: "par",
      stockActual: 120,
      stockMinimo: 40,
      activo: true,
      fechaCreacion: "2023-10-01",
      ultimaActualizacion: "2024-06-01",
    },
  ]
}

export function getSampleVentasFerreteria(): VentaFerreteria[] {
  return [
    {
      id: "venta1",
      codigo: "V-2024-001",
      fecha: "2024-06-10",
      cliente: "Construcciones Modernas S.A.",
      clienteId: "cli1",
      total: 1500.0,
      estado: "Completada",
      tipoVenta: TipoVenta.CONTADO,
      montoPagado: 1500.0,
      saldoPendiente: 0,
      estadoPago: EstadoPago.PAGADO,
      items: [
        {
          productoId: "prod1",
          nombreProducto: "Martillo de Uña 16oz",
          cantidad: 5,
          precioUnitario: 75.0,
          subtotal: 375.0,
        },
        {
          productoId: "prod4",
          nombreProducto: "Taladro Percutor 1/2 pulg.",
          cantidad: 1,
          precioUnitario: 850.0,
          subtotal: 850.0,
        },
        {
          productoId: "prod6",
          nombreProducto: "Silicona Acética Transparente",
          cantidad: 10,
          precioUnitario: 35.0,
          subtotal: 350.0,
        },
      ],
    },
    {
      id: "venta2",
      codigo: "V-2024-002",
      fecha: "2024-06-11",
      cliente: "Juan Pérez",
      clienteId: "cli2",
      total: 240.0,
      estado: "Completada",
      tipoVenta: TipoVenta.CONTADO,
      montoPagado: 240.0,
      saldoPendiente: 0,
      estadoPago: EstadoPago.PAGADO,
      items: [
        {
          productoId: "prod2",
          nombreProducto: "Caja de Tornillos Mixtos",
          cantidad: 2,
          precioUnitario: 120.0,
          subtotal: 240.0,
        },
      ],
    },
    {
      id: "venta3",
      codigo: "V-2024-003",
      fecha: "2024-06-12",
      cliente: "Reformas Express",
      clienteId: "cli3",
      total: 750.0,
      estado: "Pendiente",
      tipoVenta: TipoVenta.CREDITO,
      fechaVencimiento: "2024-07-12",
      montoPagado: 0,
      saldoPendiente: 750.0,
      estadoPago: EstadoPago.PENDIENTE,
      items: [
        {
          productoId: "prod3",
          nombreProducto: "Pintura Blanca Acrílica 1 Galón",
          cantidad: 3,
          precioUnitario: 250.0,
          subtotal: 750.0,
        },
      ],
    },
    {
      id: "venta4",
      codigo: "V-2024-004",
      fecha: "2024-06-13",
      cliente: "María López",
      clienteId: "cli4",
      total: 90.0,
      estado: "Completada",
      tipoVenta: TipoVenta.CONTADO,
      montoPagado: 90.0,
      saldoPendiente: 0,
      estadoPago: EstadoPago.PAGADO,
      items: [
        {
          productoId: "prod9",
          nombreProducto: "Candado de Seguridad 50mm",
          cantidad: 1,
          precioUnitario: 90.0,
          subtotal: 90.0,
        },
      ],
    },
    {
      id: "venta5",
      codigo: "V-2024-005",
      fecha: "2024-06-14",
      cliente: "Pedro Gómez",
      clienteId: "cli5",
      total: 135.0,
      estado: "Cancelada",
      tipoVenta: TipoVenta.CONTADO,
      items: [
        {
          productoId: "prod10",
          nombreProducto: "Guantes de Trabajo Reforzados",
          cantidad: 3,
          precioUnitario: 45.0,
          subtotal: 135.0,
        },
      ],
    },
    {
      id: "venta6",
      codigo: "V-2024-006",
      fecha: "2024-05-15",
      cliente: "Construcciones Modernas S.A.",
      clienteId: "cli1",
      total: 2500.0,
      estado: "Pendiente",
      tipoVenta: TipoVenta.CREDITO,
      fechaVencimiento: "2024-06-15",
      montoPagado: 1000.0,
      saldoPendiente: 1500.0,
      estadoPago: EstadoPago.VENCIDO,
      items: [
        {
          productoId: "prod4",
          nombreProducto: "Taladro Percutor 1/2 pulg.",
          cantidad: 2,
          precioUnitario: 850.0,
          subtotal: 1700.0,
        },
        {
          productoId: "prod1",
          nombreProducto: "Martillo de Uña 16oz",
          cantidad: 10,
          precioUnitario: 75.0,
          subtotal: 750.0,
        },
      ],
    },
    {
      id: "venta7",
      codigo: "V-2024-007",
      fecha: "2024-06-01",
      cliente: "Reformas Express",
      clienteId: "cli3",
      total: 1200.0,
      estado: "Pendiente",
      tipoVenta: TipoVenta.CREDITO,
      fechaVencimiento: "2024-07-01",
      montoPagado: 600.0,
      saldoPendiente: 600.0,
      estadoPago: EstadoPago.PARCIAL,
      items: [
        {
          productoId: "prod3",
          nombreProducto: "Pintura Blanca Acrílica 1 Galón",
          cantidad: 4,
          precioUnitario: 250.0,
          subtotal: 1000.0,
        },
        {
          productoId: "prod6",
          nombreProducto: "Silicona Acética Transparente",
          cantidad: 5,
          precioUnitario: 35.0,
          subtotal: 175.0,
        },
      ],
    },
  ]
}

// Datos de muestra para pagos
export function getSamplePagos(): Pago[] {
  return [
    {
      id: "pago1",
      ventaId: "venta6",
      monto: 1000.0,
      fechaPago: new Date("2024-05-20"),
      metodoPago: "transferencia",
      referencia: "TRF-001234",
      usuarioId: "3",
      fechaCreacion: new Date("2024-05-20"),
    },
    {
      id: "pago2",
      ventaId: "venta7",
      monto: 600.0,
      fechaPago: new Date("2024-06-05"),
      metodoPago: "efectivo",
      usuarioId: "3",
      fechaCreacion: new Date("2024-06-05"),
    },
  ]
}

// Función auxiliar para calcular deuda total por cliente
export function calcularDeudaCliente(clienteId: string, ventas: VentaFerreteria[]): number {
  return ventas
    .filter((v) => v.clienteId === clienteId && v.tipoVenta === TipoVenta.CREDITO && v.estadoPago !== EstadoPago.PAGADO)
    .reduce((sum, v) => sum + (v.saldoPendiente || 0), 0)
}

// Función auxiliar para obtener ventas pendientes de pago por cliente
export function obtenerVentasPendientesPorCliente(clienteId: string, ventas: VentaFerreteria[]): VentaFerreteria[] {
  return ventas.filter(
    (v) =>
      v.clienteId === clienteId &&
      v.tipoVenta === TipoVenta.CREDITO &&
      v.estadoPago !== EstadoPago.PAGADO &&
      v.estado !== "Cancelada"
  )
}

export function getSampleClientesFerreteria(): ClienteFerreteria[] {
  return [
    {
      id: "cli1",
      nombre: "Construcciones Modernas S.A.",
      nit: "1234567-8",
      direccion: "Av. Reforma 1-23, Zona 9",
      telefono: "2345-6789",
      email: "info@construccionesmodernas.com",
      fechaRegistro: "2022-11-01",
    },
    {
      id: "cli2",
      nombre: "Juan Pérez",
      nit: "9876543-2",
      direccion: "Calle Real 4-56, Zona 1",
      telefono: "5555-1234",
      email: "juan.perez@example.com",
      fechaRegistro: "2023-01-20",
    },
    {
      id: "cli3",
      nombre: "Reformas Express",
      nit: "5432109-1",
      direccion: "Blvd. Los Próceres 7-89, Zona 10",
      telefono: "6666-5678",
      email: "contacto@reformasexpress.com",
      fechaRegistro: "2023-03-15",
    },
    {
      id: "cli4",
      nombre: "María López",
      nit: "1122334-5",
      direccion: "Diagonal 6 10-11, Zona 14",
      telefono: "7777-9012",
      email: "maria.lopez@example.com",
      fechaRegistro: "2023-05-01",
    },
    {
      id: "cli5",
      nombre: "Pedro Gómez",
      nit: "6789012-3",
      direccion: "Calzada Roosevelt 13-14, Zona 7",
      telefono: "8888-3456",
      email: "pedro.gomez@example.com",
      fechaRegistro: "2023-07-01",
    },
  ]
}

export function getSampleCotizacionesFerreteria(): CotizacionFerreteria[] {
  return [
    {
      id: "cot1",
      codigo: "C-2024-001",
      fecha: "2024-05-20",
      cliente: "Construcciones del Futuro",
      total: 3500.0,
      estado: "Aceptada",
      items: [
        {
          productoId: "prod3",
          nombreProducto: "Pintura Blanca Acrílica 1 Galón",
          cantidad: 10,
          precioUnitario: 250.0,
          subtotal: 2500.0,
        },
        {
          productoId: "prod4",
          nombreProducto: "Taladro Percutor 1/2 pulg.",
          cantidad: 1,
          precioUnitario: 850.0,
          subtotal: 850.0,
        },
        {
          productoId: "prod7",
          nombreProducto: "Brocha de 2 pulgadas",
          cantidad: 10,
          precioUnitario: 15.0,
          subtotal: 150.0,
        },
      ],
    },
    {
      id: "cot2",
      codigo: "C-2024-002",
      fecha: "2024-05-25",
      cliente: "Diseños Innovadores",
      total: 600.0,
      estado: "Pendiente",
      items: [
        {
          productoId: "prod5",
          nombreProducto: "Set de Llaves Combinadas",
          cantidad: 2,
          precioUnitario: 300.0,
          subtotal: 600.0,
        },
      ],
    },
    {
      id: "cot3",
      codigo: "C-2024-003",
      fecha: "2024-06-01",
      cliente: "Hogar Feliz",
      total: 100.0,
      estado: "Rechazada",
      items: [
        {
          productoId: "prod8",
          nombreProducto: "Lija para Madera Grano 120",
          cantidad: 20,
          precioUnitario: 5.0,
          subtotal: 100.0,
        },
      ],
    },
  ]
}

export function getSampleInventarioFerreteria(): InventarioFerreteriaItem[] {
  const productos = getSampleProductosFerreteria()
  return productos.map((p) => ({
    id: `inv-${p.id}`,
    productoId: p.id,
    codigo: p.codigo,
    nombreProducto: p.nombre,
    categoria: p.categoria,
    cantidad: p.stockActual,
    stockMinimo: p.stockMinimo,
    precioUnitario: p.precioVenta,
    ultimaActualizacion: p.ultimaActualizacion,
  }))
}

// Bloquera Sample Data
export function getSampleProductosBloquera(): ProductoBloquera[] {
  return [
    {
      id: "bloq1",
      codigo: "B-001",
      nombre: "Bloque de Concreto 15x20x40",
      descripcion: "Bloque de concreto estándar para muros y cimentaciones.",
      tipoBloque: "Bloque de 15",
      dimensiones: "15x20x40 cm",
      precioVentaUnitario: 5.5,
      costoProduccionUnitario: 3.0,
      stockActual: 5000,
      stockMinimo: 1000,
      activo: true,
      fechaCreacion: "2023-01-01",
      ultimaActualizacion: "2024-06-10",
    },
    {
      id: "bloq2",
      codigo: "B-002",
      nombre: "Ladrillo de Arcilla Rojo",
      descripcion: "Ladrillo tradicional de arcilla cocida.",
      tipoBloque: "Ladrillo",
      dimensiones: "6x12x24 cm",
      precioVentaUnitario: 1.8,
      costoProduccionUnitario: 1.0,
      stockActual: 10000,
      stockMinimo: 2000,
      activo: true,
      fechaCreacion: "2023-02-01",
      ultimaActualizacion: "2024-06-05",
    },
    {
      id: "bloq3",
      codigo: "B-003",
      nombre: "Bloque Cara Vista 20x20x40",
      descripcion: "Bloque de concreto con acabado estético para fachadas.",
      tipoBloque: "Bloque Cara Vista",
      dimensiones: "20x20x40 cm",
      precioVentaUnitario: 8.0,
      costoProduccionUnitario: 4.5,
      stockActual: 2000,
      stockMinimo: 500,
      activo: true,
      fechaCreacion: "2023-03-01",
      ultimaActualizacion: "2024-06-08",
    },
    {
      id: "bloq4",
      codigo: "B-004",
      nombre: "Adoquín Rectangular",
      descripcion: "Adoquín de concreto para pavimentos y caminos.",
      tipoBloque: "Adoquín",
      dimensiones: "10x20x6 cm",
      precioVentaUnitario: 3.0,
      costoProduccionUnitario: 1.5,
      stockActual: 7000,
      stockMinimo: 1500,
      activo: true,
      fechaCreacion: "2023-04-01",
      ultimaActualizacion: "2024-06-09",
    },
  ]
}

export function getSampleOrdenesProduccionBloquera(): OrdenProduccionBloquera[] {
  return [
    {
      id: "opb1",
      codigo: "OP-2024-001",
      fechaCreacion: "2024-05-01",
      fechaInicio: "2024-05-05",
      fechaFinEstimada: "2024-05-15",
      productoId: "bloq1",
      nombreProducto: "Bloque de Concreto 15x20x40",
      cantidadSolicitada: 3000,
      cantidadProducida: 3000,
      estado: "Completada",
      responsable: "Carlos Ruíz",
      notas: "Producción estándar para stock.",
      lotes: [
        {
          id: "lote1",
          ordenId: "opb1",
          fechaProduccion: "2024-05-08",
          horaInicio: "08:00",
          horaFin: "17:00",
          cantidadProducida: 1500,
          cantidadDefectuosa: 30,
          calidad: "Buena",
          supervisor: "Ana García",
          notas: "",
        },
        {
          id: "lote2",
          ordenId: "opb1",
          fechaProduccion: "2024-05-12",
          horaInicio: "08:30",
          horaFin: "16:45",
          cantidadProducida: 1500,
          cantidadDefectuosa: 20,
          calidad: "Excelente",
          supervisor: "Ana García",
          notas: "",
        },
      ],
    },
    {
      id: "opb2",
      codigo: "OP-2024-002",
      fechaCreacion: "2024-05-10",
      fechaInicio: "2024-05-18",
      fechaFinEstimada: "2024-05-25",
      productoId: "bloq2",
      nombreProducto: "Ladrillo de Arcilla Rojo",
      cantidadSolicitada: 5000,
      cantidadProducida: 3500,
      estado: "En Proceso",
      responsable: "Pedro Solís",
      notas: "Pedido urgente cliente 'Constructora del Sol'.",
      lotes: [
        {
          id: "lote3",
          ordenId: "opb2",
          fechaProduccion: "2024-05-20",
          horaInicio: "07:30",
          horaFin: "16:30",
          cantidadProducida: 2000,
          cantidadDefectuosa: 50,
          calidad: "Regular",
          supervisor: "Juan Pérez",
          notas: "Problemas con la mezcla inicial.",
        },
        {
          id: "lote4",
          ordenId: "opb2",
          fechaProduccion: "2024-05-23",
          horaInicio: "08:00",
          horaFin: "17:15",
          cantidadProducida: 1500,
          cantidadDefectuosa: 10,
          calidad: "Buena",
          supervisor: "Juan Pérez",
          notas: "",
        },
      ],
    },
    {
      id: "opb3",
      codigo: "OP-2024-003",
      fechaCreacion: "2024-06-01",
      fechaInicio: "2024-06-05",
      fechaFinEstimada: "2024-06-10",
      productoId: "bloq3",
      nombreProducto: "Bloque Cara Vista 20x20x40",
      cantidadSolicitada: 1000,
      cantidadProducida: 0,
      estado: "Pendiente",
      responsable: "Carlos Ruíz",
      notas: "Nuevo diseño de bloque.",
      lotes: [],
    },
  ]
}

export function getSampleInventarioBloquera(): InventarioBloqueraItem[] {
  const productos = getSampleProductosBloquera()
  return productos.map((p) => ({
    id: `invb-${p.id}`,
    productoId: p.id,
    codigo: p.codigo,
    nombreProducto: p.nombre,
    tipoBloque: p.tipoBloque,
    cantidad: p.stockActual,
    stockMinimo: p.stockMinimo,
    precioUnitario: p.precioVentaUnitario,
    ultimaActualizacion: p.ultimaActualizacion,
  }))
}

// Piedrinera Sample Data
export function getSampleAgregadosPiedrinera(): AgregadoPiedrinera[] {
  return [
    {
      id: "agr1",
      codigo: "P-001",
      nombre: "Arena de Río",
      descripcion: "Arena fina para mezcla de concreto y acabados.",
      tipo: "Arena",
      granulometria: "Fino",
      precioVentaPorMetroCubico: 120.0,
      costoProduccionPorMetroCubico: 70.0,
      stockActualMetrosCubicos: 1500,
      stockMinimoMetrosCubicos: 500,
      activo: true,
      fechaCreacion: "2023-01-01",
      ultimaActualizacion: "2024-06-10",
    },
    {
      id: "agr2",
      codigo: "P-002",
      nombre: "Grava 3/4 pulg.",
      descripcion: "Grava triturada para concreto estructural.",
      tipo: "Grava",
      granulometria: "3/4",
      precioVentaPorMetroCubico: 150.0,
      costoProduccionPorMetroCubico: 90.0,
      stockActualMetrosCubicos: 2000,
      stockMinimoMetrosCubicos: 700,
      activo: true,
      fechaCreacion: "2023-02-01",
      ultimaActualizacion: "2024-06-08",
    },
    {
      id: "agr3",
      codigo: "P-003",
      nombre: "Piedrín 1/2 pulg.",
      descripcion: "Piedrín para mezcla de asfalto y bases.",
      tipo: "Piedrín",
      granulometria: "1/2",
      precioVentaPorMetroCubico: 130.0,
      costoProduccionPorMetroCubico: 80.0,
      stockActualMetrosCubicos: 1200,
      stockMinimoMetrosCubicos: 400,
      activo: true,
      fechaCreacion: "2023-03-01",
      ultimaActualizacion: "2024-06-09",
    },
    {
      id: "agr4",
      codigo: "P-004",
      nombre: "Base para Carretera",
      descripcion: "Mezcla de agregados para sub-base de carreteras.",
      tipo: "Mezcla",
      granulometria: "Variada",
      precioVentaPorMetroCubico: 100.0,
      costoProduccionPorMetroCubico: 60.0,
      stockActualMetrosCubicos: 800,
      stockMinimoMetrosCubicos: 300,
      activo: true,
      fechaCreacion: "2023-04-01",
      ultimaActualizacion: "2024-06-07",
    },
    {
      id: "agr5",
      codigo: "P-005",
      nombre: "Arena Gruesa",
      descripcion: "Arena para rellenos y nivelaciones.",
      tipo: "Arena",
      granulometria: "Grueso",
      precioVentaPorMetroCubico: 110.0,
      costoProduccionPorMetroCubico: 65.0,
      stockActualMetrosCubicos: 900,
      stockMinimoMetrosCubicos: 350,
      activo: true,
      fechaCreacion: "2023-05-01",
      ultimaActualizacion: "2024-06-06",
    },
    {
      id: "agr6",
      codigo: "P-006",
      nombre: "Grava 1/2 pulg.",
      descripcion: "Grava triturada para drenajes y paisajismo.",
      tipo: "Grava",
      granulometria: "1/2",
      precioVentaPorMetroCubico: 140.0,
      costoProduccionPorMetroCubico: 85.0,
      stockActualMetrosCubicos: 1800,
      stockMinimoMetrosCubicos: 600,
      activo: true,
      fechaCreacion: "2023-06-01",
      ultimaActualizacion: "2024-06-05",
    },
  ]
}

export function getSampleDespachosPiedrinera(): DespachoPiedrinera[] {
  return [
    {
      id: "desp1",
      codigo: "D-2024-001",
      fecha: "2024-06-10",
      cliente: "Constructora del Valle",
      camionId: "cam1",
      placaCamion: "C-123ABC",
      piloto: "Roberto Fuentes",
      agregadoId: "agr1",
      nombreAgregado: "Arena de Río",
      cantidadMetrosCubicos: 15,
      precioTotal: 1800.0,
      estado: "Despachado",
      notas: "Entrega en obra 1.",
    },
    {
      id: "desp2",
      codigo: "D-2024-002",
      fecha: "2024-06-11",
      cliente: "Ingeniería Civil S.A.",
      camionId: "cam2",
      placaCamion: "P-456DEF",
      piloto: "Mario Estrada",
      agregadoId: "agr2",
      nombreAgregado: "Grava 3/4 pulg.",
      cantidadMetrosCubicos: 20,
      precioTotal: 3000.0,
      estado: "Entregado",
      notas: "Urgente para fundición.",
    },
    {
      id: "desp3",
      codigo: "D-2024-003",
      fecha: "2024-06-12",
      cliente: "Municipalidad de Xela",
      camionId: "cam3",
      placaCamion: "A-789GHI",
      piloto: "Luis Morales",
      agregadoId: "agr3",
      nombreAgregado: "Piedrín 1/2 pulg.",
      cantidadMetrosCubicos: 10,
      precioTotal: 1300.0,
      estado: "Pendiente",
      notas: "Para proyecto de adoquinado.",
    },
    {
      id: "desp4",
      codigo: "D-2024-004",
      fecha: "2024-06-13",
      cliente: "Desarrollos Urbanos",
      camionId: "cam1",
      placaCamion: "C-123ABC",
      piloto: "Roberto Fuentes",
      agregadoId: "agr4",
      nombreAgregado: "Base para Carretera",
      cantidadMetrosCubicos: 25,
      precioTotal: 2500.0,
      estado: "Despachado",
      notas: "Entrega en fase 2.",
    },
    {
      id: "desp5",
      codigo: "D-2024-005",
      fecha: "2024-06-14",
      cliente: "Particular Sra. García",
      camionId: "cam2",
      placaCamion: "P-456DEF",
      piloto: "Mario Estrada",
      agregadoId: "agr5",
      nombreAgregado: "Arena Gruesa",
      cantidadMetrosCubicos: 5,
      precioTotal: 550.0,
      estado: "Cancelado",
      notas: "Cliente cambió de opinión.",
    },
  ]
}

export function getSampleCamionesPiedrinera(): CamionPiedrinera[] {
  return [
    {
      id: "cam1",
      placa: "C-123ABC",
      marca: "Freightliner",
      modelo: "Cascadia",
      capacidadMetrosCubicos: 15,
      estado: "En Ruta",
      ultimoMantenimiento: "2024-05-01",
      proximoMantenimiento: "2024-08-01",
    },
    {
      id: "cam2",
      placa: "P-456DEF",
      marca: "Kenworth",
      modelo: "T680",
      capacidadMetrosCubicos: 20,
      estado: "Disponible",
      ultimoMantenimiento: "2024-04-15",
      proximoMantenimiento: "2024-07-15",
    },
    {
      id: "cam3",
      placa: "A-789GHI",
      marca: "Volvo",
      modelo: "VNL",
      capacidadMetrosCubicos: 10,
      estado: "En Mantenimiento",
      ultimoMantenimiento: "2024-06-01",
      proximoMantenimiento: "2024-09-01",
    },
    {
      id: "cam4",
      placa: "B-012JKL",
      marca: "Mack",
      modelo: "Anthem",
      capacidadMetrosCubicos: 25,
      estado: "Disponible",
      ultimoMantenimiento: "2024-03-20",
      proximoMantenimiento: "2024-06-20",
    },
  ]
}

export function getSampleVentasPiedrinera(): VentaPiedrinera[] {
  return [
    {
      id: "vp1",
      codigo: "VP-2024-001",
      fecha: "2024-06-01",
      cliente: "Constructora Alfa",
      total: 1200.0,
      estado: "Completada",
      items: [
        {
          agregadoId: "agr1",
          nombreAgregado: "Arena de Río",
          cantidadMetrosCubicos: 10,
          precioUnitario: 120.0,
          subtotal: 1200.0,
        },
      ],
    },
    {
      id: "vp2",
      codigo: "VP-2024-002",
      fecha: "2024-06-05",
      cliente: "Desarrollos del Sur",
      total: 4500.0,
      estado: "Pendiente",
      items: [
        {
          agregadoId: "agr2",
          nombreAgregado: "Grava 3/4 pulg.",
          cantidadMetrosCubicos: 30,
          precioUnitario: 150.0,
          subtotal: 4500.0,
        },
      ],
    },
    {
      id: "vp3",
      codigo: "VP-2024-003",
      fecha: "2024-06-08",
      cliente: "Inversiones del Norte",
      total: 2600.0,
      estado: "Completada",
      items: [
        {
          agregadoId: "agr3",
          nombreAgregado: "Piedrín 1/2 pulg.",
          cantidadMetrosCubicos: 20,
          precioUnitario: 130.0,
          subtotal: 2600.0,
        },
      ],
    },
  ]
}

export function getSampleProduccionPiedrinera(): ProduccionPiedrineraLote[] {
  return [
    {
      id: "ppl1",
      fechaProduccion: "2024-06-01",
      agregadoId: "agr1",
      nombreAgregado: "Arena de Río",
      cantidadProducidaMetrosCubicos: 100,
      costoTotalLote: 7000.0,
      supervisor: "Juan López",
      notas: "Producción diaria normal.",
    },
    {
      id: "ppl2",
      fechaProduccion: "2024-06-02",
      agregadoId: "agr2",
      nombreAgregado: "Grava 3/4 pulg.",
      cantidadProducidaMetrosCubicos: 150,
      costoTotalLote: 13500.0,
      supervisor: "María García",
      notas: "Alta demanda de grava.",
    },
    {
      id: "ppl3",
      fechaProduccion: "2024-06-03",
      agregadoId: "agr3",
      nombreAgregado: "Piedrín 1/2 pulg.",
      cantidadProducidaMetrosCubicos: 80,
      costoTotalLote: 6400.0,
      supervisor: "Juan López",
      notas: "Mantenimiento de trituradora menor.",
    },
  ]
}

export function getSampleInventarioPiedrinera(): InventarioPiedrineraItem[] {
  const agregados = getSampleAgregadosPiedrinera()
  return agregados.map((a) => ({
    id: `invp-${a.id}`,
    agregadoId: a.id,
    codigo: a.codigo,
    nombreAgregado: a.nombre,
    tipo: a.tipo,
    cantidadMetrosCubicos: a.stockActualMetrosCubicos,
    stockMinimoMetrosCubicos: a.stockMinimoMetrosCubicos,
    precioUnitario: a.precioVentaPorMetroCubico,
    ultimaActualizacion: a.ultimaActualizacion,
  }))
}

// Taller Sample Data
export function getSampleOrdenesTrabajoTaller(): OrdenTrabajoTaller[] {
  return [
    {
      id: "ot1",
      codigo: "OT-2024-001",
      fechaCreacion: "2024-06-01",
      fechaInicio: "2024-06-03",
      fechaFinEstimada: "2024-06-05",
      equipoId: "eq1",
      nombreEquipo: "Retroexcavadora CAT 320D",
      descripcionProblema: "Falla hidráulica en brazo principal.",
      estado: "En Proceso",
      tecnicoAsignado: "Carlos Méndez",
      prioridad: "Alta",
      costoEstimado: 850.0,
      costoReal: 0, // Se actualiza al completar
      materialesUsados: [
        { materialId: "mat1", nombreMaterial: "Aceite Hidráulico ISO 46", cantidad: 20, precioUnitario: 15.0 },
        { materialId: "mat2", nombreMaterial: "Filtro de Aceite Hidráulico", cantidad: 1, precioUnitario: 80.0 },
      ],
      serviciosRealizados: [
        { servicioId: "serv1", nombreServicio: "Diagnóstico de Sistema Hidráulico", horas: 2, costoPorHora: 50.0 },
        { servicioId: "serv2", nombreServicio: "Reparación de Fuga Hidráulica", horas: 4, costoPorHora: 50.0 },
      ],
      notas: "Esperando repuesto de válvula.",
    },
    {
      id: "ot2",
      codigo: "OT-2024-002",
      fechaCreacion: "2024-06-02",
      fechaInicio: "2024-06-02",
      fechaFinEstimada: "2024-06-02",
      equipoId: "eq2",
      nombreEquipo: "Camión Volteo Mack",
      descripcionProblema: "Cambio de aceite y filtros (mantenimiento preventivo).",
      estado: "Completada",
      tecnicoAsignado: "Ana López",
      prioridad: "Media",
      costoEstimado: 300.0,
      costoReal: 320.0,
      materialesUsados: [
        { materialId: "mat3", nombreMaterial: "Aceite de Motor 15W-40", cantidad: 15, precioUnitario: 12.0 },
        { materialId: "mat4", nombreMaterial: "Filtro de Aire Camión", cantidad: 1, precioUnitario: 60.0 },
        { materialId: "mat5", nombreMaterial: "Filtro de Combustible Camión", cantidad: 1, precioUnitario: 40.0 },
      ],
      serviciosRealizados: [
        { servicioId: "serv3", nombreServicio: "Mantenimiento Preventivo Básico", horas: 3, costoPorHora: 50.0 },
      ],
      notas: "Mantenimiento de rutina realizado satisfactoriamente.",
    },
    {
      id: "ot3",
      codigo: "OT-2024-003",
      fechaCreacion: "2024-06-05",
      fechaInicio: "",
      fechaFinEstimada: "2024-06-07",
      equipoId: "eq3",
      nombreEquipo: "Cargador Frontal John Deere",
      descripcionProblema: "Revisión de sistema eléctrico, luces no encienden.",
      estado: "Pendiente",
      tecnicoAsignado: "Pedro Gómez",
      prioridad: "Baja",
      costoEstimado: 200.0,
      costoReal: 0,
      materialesUsados: [],
      serviciosRealizados: [
        { servicioId: "serv4", nombreServicio: "Diagnóstico de Sistema Eléctrico", horas: 1, costoPorHora: 50.0 },
      ],
      notas: "Programado para el viernes.",
    },
  ]
}

export function getSampleMaterialesTaller(): MaterialTaller[] {
  return [
    {
      id: "mat1",
      codigo: "MT-001",
      nombre: "Aceite Hidráulico ISO 46",
      descripcion: "Aceite para sistemas hidráulicos de maquinaria pesada.",
      unidadMedida: "litro",
      stockActual: 250,
      stockMinimo: 50,
      precioUnitario: 15.0,
      ubicacion: "Almacén A, Estante 1",
      activo: true,
      ultimaActualizacion: "2024-06-10",
    },
    {
      id: "mat2",
      codigo: "MT-002",
      nombre: "Filtro de Aceite Hidráulico",
      descripcion: "Filtro de repuesto para sistemas hidráulicos.",
      unidadMedida: "unidad",
      stockActual: 30,
      stockMinimo: 10,
      precioUnitario: 80.0,
      ubicacion: "Almacén A, Estante 2",
      activo: true,
      ultimaActualizacion: "2024-06-08",
    },
    {
      id: "mat3",
      codigo: "MT-003",
      nombre: "Aceite de Motor 15W-40",
      descripcion: "Aceite multigrado para motores diésel.",
      unidadMedida: "litro",
      stockActual: 300,
      stockMinimo: 70,
      precioUnitario: 12.0,
      ubicacion: "Almacén B, Estante 1",
      activo: true,
      ultimaActualizacion: "2024-06-09",
    },
    {
      id: "mat4",
      codigo: "MT-004",
      nombre: "Filtro de Aire Camión",
      descripcion: "Filtro de aire para camiones de carga.",
      unidadMedida: "unidad",
      stockActual: 20,
      stockMinimo: 5,
      precioUnitario: 60.0,
      ubicacion: "Almacén B, Estante 3",
      activo: true,
      ultimaActualizacion: "2024-06-07",
    },
    {
      id: "mat5",
      codigo: "MT-005",
      nombre: "Filtro de Combustible Camión",
      descripcion: "Filtro de combustible para motores diésel.",
      unidadMedida: "unidad",
      stockActual: 25,
      stockMinimo: 8,
      precioUnitario: 40.0,
      ubicacion: "Almacén B, Estante 3",
      activo: true,
      ultimaActualizacion: "2024-06-06",
    },
    {
      id: "mat6",
      codigo: "MT-006",
      nombre: "Batería 12V 100Ah",
      descripcion: "Batería para vehículos y maquinaria.",
      unidadMedida: "unidad",
      stockActual: 10,
      stockMinimo: 3,
      precioUnitario: 800.0,
      ubicacion: "Almacén C, Estante 1",
      activo: true,
      ultimaActualizacion: "2024-06-05",
    },
    {
      id: "mat7",
      codigo: "MT-007",
      nombre: "Pastillas de Freno Delanteras",
      descripcion: "Juego de pastillas de freno para camión.",
      unidadMedida: "juego",
      stockActual: 15,
      stockMinimo: 5,
      precioUnitario: 250.0,
      ubicacion: "Almacén C, Estante 2",
      activo: true,
      ultimaActualizacion: "2024-06-04",
    },
  ]
}

export function getSampleServiciosTaller(): ServicioTaller[] {
  return [
    {
      id: "serv1",
      codigo: "SERV-001",
      nombre: "Diagnóstico de Sistema Hidráulico",
      descripcion: "Revisión y detección de fallas en sistemas hidráulicos.",
      costoPorHora: 50.0,
      duracionEstimadaHoras: 2,
      activo: true,
      ultimaActualizacion: "2024-06-10",
    },
    {
      id: "serv2",
      codigo: "SERV-002",
      nombre: "Reparación de Fuga Hidráulica",
      descripcion: "Reparación de fugas en mangueras, cilindros o bombas.",
      costoPorHora: 50.0,
      duracionEstimadaHoras: 4,
      activo: true,
      ultimaActualizacion: "2024-06-09",
    },
    {
      id: "serv3",
      codigo: "SERV-003",
      nombre: "Mantenimiento Preventivo Básico",
      descripcion: "Cambio de aceite, filtros y revisión general.",
      costoPorHora: 50.0,
      duracionEstimadaHoras: 3,
      activo: true,
      ultimaActualizacion: "2024-06-08",
    },
    {
      id: "serv4",
      codigo: "SERV-004",
      nombre: "Diagnóstico de Sistema Eléctrico",
      descripcion: "Revisión y solución de problemas eléctricos.",
      costoPorHora: 50.0,
      duracionEstimadaHoras: 1,
      activo: true,
      ultimaActualizacion: "2024-06-07",
    },
    {
      id: "serv5",
      codigo: "SERV-005",
      nombre: "Alineación y Balanceo",
      descripcion: "Servicio de alineación de dirección y balanceo de neumáticos.",
      costoPorHora: 60.0,
      duracionEstimadaHoras: 2,
      activo: true,
      ultimaActualizacion: "2024-06-06",
    },
  ]
}

export function getSampleEquiposTaller(): EquipoTaller[] {
  return [
    {
      id: "eq1",
      codigo: "EQ-001",
      nombre: "Retroexcavadora CAT 320D",
      tipo: "Maquinaria Pesada",
      marca: "Caterpillar",
      modelo: "320D",
      numeroSerie: "ABC123XYZ",
      fechaAdquisicion: "2020-01-10",
      estado: "En Reparación",
      ultimaOrdenTrabajoId: "ot1",
      proximoMantenimiento: "2024-09-01",
      notas: "Requiere cambio de bomba hidráulica.",
    },
    {
      id: "eq2",
      codigo: "EQ-002",
      nombre: "Camión Volteo Mack",
      tipo: "Vehículo",
      marca: "Mack",
      modelo: "Granite",
      numeroSerie: "DEF456UVW",
      fechaAdquisicion: "2018-05-20",
      estado: "Operativo",
      ultimaOrdenTrabajoId: "ot2",
      proximoMantenimiento: "2024-12-01",
      notas: "Mantenimiento preventivo reciente.",
    },
    {
      id: "eq3",
      codigo: "EQ-003",
      nombre: "Cargador Frontal John Deere",
      tipo: "Maquinaria Pesada",
      marca: "John Deere",
      modelo: "544K",
      numeroSerie: "GHI789RST",
      fechaAdquisicion: "2021-03-15",
      estado: "Operativo",
      ultimaOrdenTrabajoId: "ot3",
      proximoMantenimiento: "2024-10-15",
      notas: "Luces delanteras no funcionan.",
    },
    {
      id: "eq4",
      codigo: "EQ-004",
      nombre: "Minicargador Bobcat S70",
      tipo: "Maquinaria Ligera",
      marca: "Bobcat",
      modelo: "S70",
      numeroSerie: "JKL012QWE",
      fechaAdquisicion: "2022-08-01",
      estado: "Operativo",
      ultimaOrdenTrabajoId: null,
      proximoMantenimiento: "2025-02-01",
      notas: "En buen estado general.",
    },
  ]
}

// --- Permisos por rol de sistema (acceso y acciones) ---
export const permisosPorRol: Record<RolSistema, ModuloSistema[]> = {
  [RolSistema.ADMIN]: [
    ModuloSistema.DASHBOARD,
    ModuloSistema.FERRETERIA,
    ModuloSistema.BLOQUERA,
    ModuloSistema.PIEDRINERA,
    ModuloSistema.TALLER,
    ModuloSistema.PLANILLAS,
    ModuloSistema.CAJA,
    ModuloSistema.REPORTES,
  ],
  [RolSistema.GERENTE]: [
    ModuloSistema.DASHBOARD,
    ModuloSistema.FERRETERIA,
    ModuloSistema.BLOQUERA,
    ModuloSistema.PIEDRINERA,
    ModuloSistema.CAJA,
    ModuloSistema.REPORTES,
  ],
  [RolSistema.VENDEDOR]: [ModuloSistema.DASHBOARD, ModuloSistema.FERRETERIA],
  [RolSistema.OPERADOR]: [
    ModuloSistema.DASHBOARD,
    ModuloSistema.BLOQUERA,
    ModuloSistema.PIEDRINERA,
    ModuloSistema.TALLER,
  ],
}

// Sample Client Data
export const sampleClientes: Cliente[] = [
  {
    id: 1,
    nombre: "Constructora ABC",
    email: "contacto@abc.com",
    telefono: "2234-5678",
    direccion: "Zona 10, Guatemala",
    activo: true,
  },
  {
    id: 2,
    nombre: "Juan Pérez",
    email: "juan@email.com",
    telefono: "5555-1234",
    direccion: "Zona 1, Guatemala",
    activo: true,
  },
]

// Sample Category Data
export const sampleCategorias: CategoriaProducto[] = [
  { id: 1, nombre: "Cemento y Agregados" },
  { id: 2, nombre: "Hierro y Acero" },
  { id: 3, nombre: "Herramientas" },
  { id: 4, nombre: "Bloques y Ladrillos" },
  { id: 5, nombre: "Pinturas y Acabados" },
]

// Sample Unit Data
export const sampleUnidadesMedida: UnidadMedida[] = [
  { id: 1, nombre: "Unidad", abreviatura: "und" },
  { id: 2, nombre: "Metro", abreviatura: "m" },
  { id: 3, nombre: "Kilogramo", abreviatura: "kg" },
  { id: 4, nombre: "Saco", abreviatura: "saco" },
  { id: 5, nombre: "Galón", abreviatura: "gal" },
  { id: 6, nombre: "Metro Cúbico", abreviatura: "m³" },
]

// Sample Warehouse Data
export const sampleBodegas: Bodega[] = [
  { id: 1, nombre: "Bodega Principal", ubicacion: "Zona Industrial" },
  { id: 2, nombre: "Bodega Ferretería", ubicacion: "Local Comercial" },
  { id: 3, nombre: "Patio Bloques", ubicacion: "Área de Producción" },
]

// Sample Product Data
export const sampleProductos: Producto[] = [
  {
    id: 1,
    nombre: "Cemento UGC 50kg",
    descripcion: "Cemento Portland tipo I",
    precio: 85.0,
    stock: 150,
    categoria: "Cemento",
    activo: true,
  },
  {
    id: 2,
    nombre: 'Hierro 3/8"',
    descripcion: "Varilla de hierro corrugado",
    precio: 45.0,
    stock: 200,
    categoria: "Hierro",
    activo: true,
  },
  {
    id: 3,
    nombre: "Block 15x20x40",
    descripcion: "Block de concreto estándar",
    precio: 3.5,
    stock: 500,
    categoria: "Blocks",
    activo: true,
  },
]

// Sample Inventory Data
export const sampleInventario: Inventario[] = [
  { id: 1, producto_id: 1, bodega_id: 1, cantidad: 150 },
  { id: 2, producto_id: 2, bodega_id: 1, cantidad: 200 },
  { id: 3, producto_id: 3, bodega_id: 3, cantidad: 800 },
]

// Sample Quotation Data
export const sampleCotizaciones: Cotizacion[] = [
  {
    id: "1",
    numero: "C-2024-001",
    clienteId: 1,
    cliente: sampleClientes[0],
    fecha: new Date("2024-01-15"),
    fechaVencimiento: new Date("2024-01-30"),
    subtotal: 15750.0,
    impuestos: 1575.0,
    descuento: 0.0,
    total: 17325.0,
    estado: EstadoCotizacion.ACEPTADA,
    vendedorId: 3,
    items: [],
    observaciones: "Cotización para proyecto residencial",
  },
]

// Sample Sale Data
export const sampleVentas: Venta[] = [
  {
    id: 1,
    numero: "V-2024-001",
    clienteId: 1,
    cliente: sampleClientes[0],
    fecha: new Date("2024-01-20"),
    subtotal: 12500.0,
    impuestos: 1250.0,
    descuento: 0.0,
    total: 13750.0,
    estado: EstadoVenta.COMPLETADA,
    vendedorId: 3,
    items: [],
    observaciones: "Venta al contado",
  },
]

// Sample Sale Detail Data
export const sampleDetallesVenta: DetalleVenta[] = [
  {
    id: 1,
    factura_id: 1,
    producto_id: 1,
    cantidad: 100,
    precio_unitario: 85.0,
    subtotal: 8500.0,
  },
  {
    id: 2,
    factura_id: 1,
    producto_id: 2,
    cantidad: 50,
    precio_unitario: 45.0,
    subtotal: 2250.0,
  },
]

// Sample Inventory Movement Data
export const sampleMovimientos: MovimientoInventario[] = [
  {
    id: "1",
    productoId: 1,
    tipo: TipoMovimiento.ENTRADA,
    cantidad: 100,
    cantidadAnterior: 50,
    cantidadNueva: 150,
    costo: 7.2,
    referencia: "COMP-001",
    observaciones: "Compra a proveedor",
    usuarioId: 3,
    fecha: new Date("2024-01-10"),
  },
]

// Sample Work Order Data
export const sampleOrdenes: OrdenTrabajo[] = [
  {
    id: "1",
    numero: "OT-2024-001",
    clienteId: 2,
    cliente: sampleClientes[1],
    descripcion: "Reparación de mezcladora",
    fechaCreacion: new Date("2024-01-15"),
    estado: EstadoOrden.PENDIENTE,
    prioridad: "media",
    materiales: [],
    servicios: [],
    costoMateriales: 0,
    costoServicios: 0,
    costoTotal: 0,
  },
]

// Sample Production Lot Data
export const sampleLotes: LoteProduccion[] = [
  {
    id: "1",
    numero: "LP-2024-001",
    productoId: 3,
    cantidadPlanificada: 1000,
    cantidadProducida: 0,
    fechaInicio: new Date("2024-01-20"),
    estado: EstadoProduccion.PLANIFICADA,
    operadorId: 4,
    costoMateriales: 0,
    costoManoObra: 0,
    costoTotal: 0,
  },
]

// Sample Truck Data
export const sampleCamiones: Camion[] = [
  {
    id: "1",
    placa: "P123-456",
    marca: "Volvo",
    modelo: "FH16",
    capacidad: 25000,
    activo: true,
    conductorId: 5,
  },
]

// Sample Dispatch Data
export const sampleDespachos: Despacho[] = [
  {
    id: "1",
    numero: "D-2024-001",
    clienteId: 1,
    cliente: sampleClientes[0],
    camionId: "1",
    conductorId: 5,
    fecha: new Date("2024-01-18"),
    productos: [],
    estado: "pendiente",
    observaciones: "Entrega programada para mañana",
  },
]

// Sample Employee Data
export const sampleEmpleados: Empleado[] = [
  {
    id: "1",
    codigo: "EMP001",
    nombres: "Carlos",
    apellidos: "González",
    cedula: "12345678-9",
    telefono: "7890-1234",
    email: "carlos.gonzalez@framasa.com",
    cargo: "Operador de Producción",
    salario: 800.0,
    fechaIngreso: new Date("2023-06-01"),
    activo: true,
  },
]
