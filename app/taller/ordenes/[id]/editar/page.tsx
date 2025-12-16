"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  ArrowLeft,
  Save,
  Calendar,
  Wrench,
  Plus,
  X,
  ShoppingCart,
  Loader2,
  Package,
  ChevronsUpDown,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPut, apiPost } from "@/lib/api-client"
import { toast } from "sonner"

interface Maquinaria {
  id: string
  codigo: string
  nombre: string
  empresa: string
  empresaDisplay: string
}

interface Empleado {
  id: string
  codigo: string
  nombres: string
  apellidos: string
  nombreCompleto: string
  puesto: string
}

interface RepuestoExterno {
  id: string
  nombre: string
  cantidad: number
}

interface ProductoFerreteria {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  precioVenta: number
  costoUnitario: number
  unidadMedida: string
  stockActual: number
  stockMinimo: number
  activo: boolean
}

interface MaterialSeleccionado {
  productoId: string
  nombre: string
  codigo: string
  cantidad: number
  unidadMedida: string
  stockActual: number
}

interface OrdenTrabajo {
  id: string
  codigoOrden: string
  maquinariaId: number
  maquinaria_id: number
  tecnicoId: number
  tecnico_id: number
  tipoMantenimiento: string
  tipo_mantenimiento: string
  descripcionTrabajo: string
  descripcion_trabajo: string
  prioridad: string
  observaciones: string
  repuestosExternos: Array<{ nombre: string; id?: string; cantidad?: number }>
  repuestos_externos: Array<{ nombre: string; id?: string; cantidad?: number }>
  productosOrden: Array<{
    id: number
    productoId: number
    producto_id: number
    productoNombre: string
    producto_nombre: string
    productoCodigo: string
    producto_codigo: string
    productoUnidadMedida: string
    producto_unidad_medida: string
    cantidad: number
    descontadoInventario: boolean
    descontado_inventario: boolean
  }>
  productos_orden: Array<{
    id: number
    productoId: number
    producto_id: number
    productoNombre: string
    producto_nombre: string
    productoCodigo: string
    producto_codigo: string
    productoUnidadMedida: string
    producto_unidad_medida: string
    cantidad: number
    descontadoInventario: boolean
    descontado_inventario: boolean
  }>
  fechaCreacionOrden: string
  fecha_creacion_orden: string
  fechaInicio: string
  fecha_inicio: string
  fechaEstimadaTerminacion: string
  fecha_estimada_terminacion: string
  fechaTerminacionReal: string | null
  fecha_terminacion_real: string | null
  estado: string
  progreso: number
  costoEstimado: number
  costo_estimado: number
  costoTotalQ: number
  costo_total_q: number
  activo: boolean
}

export default function EditarOrdenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Datos para selects
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])

  // Form data
  const [formData, setFormData] = useState({
    maquinaria: "",
    tecnico: "",
    tipo_mantenimiento: "",
    descripcion_trabajo: "",
    prioridad: "",
    observaciones: "",
    fecha_creacion_orden: "",
    fecha_inicio: "",
    fecha_estimada_terminacion: "",
    fecha_terminacion_real: "",
    estado: "",
    progreso: 0,
    costo_estimado: "0",
  })

  // Repuestos externos
  const [repuestosExternos, setRepuestosExternos] = useState<RepuestoExterno[]>([])
  const [nuevoRepuestoNombre, setNuevoRepuestoNombre] = useState("")
  const [nuevoRepuestoCantidad, setNuevoRepuestoCantidad] = useState<number>(1)
  const [codigoOrden, setCodigoOrden] = useState("")

  // Productos de ferretería (materiales)
  const [productos, setProductos] = useState<ProductoFerreteria[]>([])
  const [productosLoading, setProductosLoading] = useState(false)
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState<MaterialSeleccionado[]>([])
  const [materialesOriginalesIds, setMaterialesOriginalesIds] = useState<Set<string>>(new Set())
  const [productoOpen, setProductoOpen] = useState(false)
  const [productoSearch, setProductoSearch] = useState("")

  // Función para calcular el estado automático basado en fechas
  const calcularEstadoAutomatico = (fechaInicio: string, fechaEstimadaTerminacion: string, estadoActual: string): string => {
    // Si el estado es COMPLETADA o CANCELADA, no cambiar automáticamente
    if (estadoActual === "COMPLETADA" || estadoActual === "CANCELADA") {
      return estadoActual
    }

    if (!fechaInicio || !fechaEstimadaTerminacion) {
      return estadoActual || "PENDIENTE"
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    
    const inicio = new Date(fechaInicio)
    inicio.setHours(0, 0, 0, 0)
    
    const finEstimado = new Date(fechaEstimadaTerminacion)
    finEstimado.setHours(0, 0, 0, 0)

    // Si la fecha actual es menor a la fecha de inicio → PENDIENTE
    if (hoy < inicio) {
      return "PENDIENTE"
    }
    
    // Si la fecha actual es mayor a la fecha estimada de terminación → VENCIDA
    if (hoy > finEstimado) {
      return "VENCIDA"
    }
    
    // Si la fecha actual está entre inicio y fin estimado (inclusive) → EN_PROGRESO
    if (hoy >= inicio && hoy <= finEstimado) {
      return "EN_PROGRESO"
    }

    return estadoActual || "PENDIENTE"
  }

  // Efecto para actualizar el estado automáticamente cuando cambian las fechas
  useEffect(() => {
    if (formData.fecha_inicio && formData.fecha_estimada_terminacion) {
      const nuevoEstado = calcularEstadoAutomatico(
        formData.fecha_inicio,
        formData.fecha_estimada_terminacion,
        formData.estado
      )
      if (nuevoEstado !== formData.estado) {
        setFormData((prev) => ({ ...prev, estado: nuevoEstado }))
      }
    }
  }, [formData.fecha_inicio, formData.fecha_estimada_terminacion])

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)

        // Cargar la orden
        const ordenData = await apiGet<OrdenTrabajo>(API_ENDPOINTS.TALLER.ORDEN(id))
        
        setCodigoOrden(ordenData.codigoOrden || "")
        
        // Obtener fechas para calcular estado
        const fechaInicio = ordenData.fechaInicio || ordenData.fecha_inicio || ""
        const fechaEstimadaTerminacion = ordenData.fechaEstimadaTerminacion || ordenData.fecha_estimada_terminacion || ""
        const estadoOriginal = ordenData.estado || ""
        
        // Calcular el estado automático basándose en las fechas actuales
        const estadoCalculado = calcularEstadoAutomatico(fechaInicio, fechaEstimadaTerminacion, estadoOriginal)
        
        // Mapear datos al formulario
        setFormData({
          maquinaria: String(ordenData.maquinariaId || ordenData.maquinaria_id || ""),
          tecnico: String(ordenData.tecnicoId || ordenData.tecnico_id || ""),
          tipo_mantenimiento: ordenData.tipoMantenimiento || ordenData.tipo_mantenimiento || "",
          descripcion_trabajo: ordenData.descripcionTrabajo || ordenData.descripcion_trabajo || "",
          prioridad: ordenData.prioridad || "",
          observaciones: ordenData.observaciones || "",
          fecha_creacion_orden: ordenData.fechaCreacionOrden || ordenData.fecha_creacion_orden || "",
          fecha_inicio: fechaInicio,
          fecha_estimada_terminacion: fechaEstimadaTerminacion,
          fecha_terminacion_real: ordenData.fechaTerminacionReal || ordenData.fecha_terminacion_real || "",
          estado: estadoCalculado,
          progreso: ordenData.progreso || 0,
          costo_estimado: String(ordenData.costoEstimado || ordenData.costo_estimado || ordenData.costoTotalQ || ordenData.costo_total_q || 0),
        })

        // Mapear repuestos externos
        const repuestos = ordenData.repuestosExternos || ordenData.repuestos_externos || []
        setRepuestosExternos(
          repuestos.map((r: any, idx: number) => ({
            id: r.id || String(idx),
            nombre: r.nombre || "",
            cantidad: r.cantidad || 1,
          }))
        )

        // Cargar maquinarias
        const maquinariasData = await apiGet<Maquinaria[]>(`${API_ENDPOINTS.TALLER.MAQUINARIA}?activo=activo`)
        setMaquinarias(Array.isArray(maquinariasData) ? maquinariasData : [])

        // Cargar empleados (técnicos)
        const empleadosData = await apiGet<any[]>(`${API_ENDPOINTS.PLANILLAS.EMPLEADOS}?activo=activo`)
        const empleadosMapeados = (Array.isArray(empleadosData) ? empleadosData : []).map((e: any) => ({
          id: String(e.id),
          codigo: e.codigo_empleado || e.codigo || "",
          nombres: e.nombres || "",
          apellidos: e.apellidos || "",
          nombreCompleto: e.nombre_completo || e.nombreCompleto || `${e.nombres || ""} ${e.apellidos || ""}`.trim(),
          puesto: e.puesto || e.cargo || "",
        }))
        setEmpleados(empleadosMapeados)

        // Cargar productos de ferretería
        try {
          setProductosLoading(true)
          const params = new URLSearchParams()
          params.append("estado", "activo")
          params.append("page_size", "500")
          
          const productosData = await apiGet<any>(`${API_ENDPOINTS.FERRETERIA.PRODUCTOS}?${params.toString()}`)
          
          const productosList = Array.isArray(productosData)
            ? productosData
            : productosData?.results || productosData?.data || []
          
          const productosMapeados: ProductoFerreteria[] = productosList.map((p: any) => ({
            id: String(p.id || p.pk || ""),
            codigo: p.codigo || "",
            nombre: p.nombre || "",
            descripcion: p.descripcion || "",
            categoria: p.categoria || p.categoria_nombre || "",
            precioVenta: p.precio_venta || p.precioVenta || 0,
            costoUnitario: p.costo_unitario || p.costoUnitario || 0,
            unidadMedida: p.unidad_medida || p.unidad_medida_nombre || "",
            stockActual: p.stock_actual || p.stockActual || 0,
            stockMinimo: p.stock_minimo || p.stockMinimo || 0,
            activo: p.activo !== undefined ? p.activo : true,
          }))
          
          setProductos(productosMapeados.filter((p) => p.activo))
        } catch (err) {
          console.error("Error al cargar productos:", err)
        } finally {
          setProductosLoading(false)
        }

        // Cargar productos de ferretería existentes de la orden
        const productosOrden = ordenData.productosOrden || ordenData.productos_orden || []
        if (productosOrden.length > 0) {
          const materialesMapeados: MaterialSeleccionado[] = productosOrden.map((p: any) => ({
            productoId: String(p.productoId || p.producto_id),
            nombre: p.productoNombre || p.producto_nombre || "",
            codigo: p.productoCodigo || p.producto_codigo || "",
            cantidad: p.cantidad || 1,
            unidadMedida: p.productoUnidadMedida || p.producto_unidad_medida || "",
            stockActual: p.productoStockActual || p.producto_stock_actual || 0,
          }))
          
          setMaterialesSeleccionados(materialesMapeados)
          // Guardar los IDs originales para saber cuáles ya tienen movimiento de inventario
          setMaterialesOriginalesIds(new Set(materialesMapeados.map((m) => m.productoId)))
        }
      } catch (error: any) {
        console.error("Error al cargar datos:", error)
        toast.error("Error al cargar la orden de trabajo")
        router.push("/taller/ordenes")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.maquinaria) {
      toast.error("Seleccione una maquinaria")
      return
    }
    if (!formData.tecnico) {
      toast.error("Seleccione un técnico")
      return
    }
    if (!formData.tipo_mantenimiento) {
      toast.error("Seleccione el tipo de mantenimiento")
      return
    }
    if (!formData.descripcion_trabajo) {
      toast.error("Ingrese la descripción del trabajo")
      return
    }
    if (!formData.prioridad) {
      toast.error("Seleccione la prioridad")
      return
    }
    if (!formData.fecha_inicio) {
      toast.error("Seleccione la fecha de inicio")
      return
    }
    if (!formData.fecha_estimada_terminacion) {
      toast.error("Seleccione la fecha estimada de terminación")
      return
    }

    try {
      setIsLoading(true)

      const datosOrden = {
        codigo_orden: codigoOrden,
        maquinaria: parseInt(formData.maquinaria),
        tecnico: parseInt(formData.tecnico),
        tipo_mantenimiento: formData.tipo_mantenimiento,
        descripcion_trabajo: formData.descripcion_trabajo,
        prioridad: formData.prioridad,
        observaciones: formData.observaciones || null,
        fecha_creacion_orden: formData.fecha_creacion_orden,
        fecha_inicio: formData.fecha_inicio,
        fecha_estimada_terminacion: formData.fecha_estimada_terminacion,
        fecha_terminacion_real: formData.fecha_terminacion_real || null,
        estado: formData.estado,
        progreso: formData.progreso,
        costo_estimado: parseFloat(formData.costo_estimado) || 0,
        repuestos_externos: repuestosExternos.map((r) => ({ nombre: r.nombre, cantidad: r.cantidad })),
        // Materiales de ferretería seleccionados
        materiales: materialesSeleccionados.map((m) => ({
          producto_id: parseInt(m.productoId),
          cantidad: m.cantidad,
        })),
        activo: true,
      }

      await apiPut(API_ENDPOINTS.TALLER.ORDEN(id), datosOrden)
      toast.success("Orden de trabajo actualizada exitosamente")
      router.push(`/taller/ordenes/${id}`)
    } catch (error: any) {
      console.error("Error al actualizar orden:", error)
      toast.error(error.message || "Error al actualizar la orden de trabajo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Agregar repuesto externo
  const handleAgregarRepuestoExterno = () => {
    if (!nuevoRepuestoNombre.trim()) return

    const nuevo: RepuestoExterno = {
      id: Date.now().toString(),
      nombre: nuevoRepuestoNombre.trim(),
      cantidad: nuevoRepuestoCantidad || 1,
    }

    setRepuestosExternos([...repuestosExternos, nuevo])
    setNuevoRepuestoNombre("")
    setNuevoRepuestoCantidad(1)
  }

  // Actualizar cantidad de repuesto externo
  const handleActualizarCantidadRepuesto = (idRepuesto: string, cantidad: number) => {
    setRepuestosExternos((prev) =>
      prev.map((r) => (r.id === idRepuesto ? { ...r, cantidad: Math.max(0, cantidad) } : r))
    )
  }

  // Eliminar repuesto externo
  const handleEliminarRepuestoExterno = (idRepuesto: string) => {
    setRepuestosExternos((prev) => prev.filter((r) => r.id !== idRepuesto))
  }

  // Filtrar productos para el combobox
  const productosFiltrados = productos.filter((producto) => {
    const searchLower = productoSearch.toLowerCase()
    return (
      producto.nombre.toLowerCase().includes(searchLower) ||
      producto.codigo.toLowerCase().includes(searchLower) ||
      producto.categoria.toLowerCase().includes(searchLower)
    )
  })

  // Agregar material/producto seleccionado
  const handleAgregarMaterial = (producto: ProductoFerreteria) => {
    if (materialesSeleccionados.some((m) => m.productoId === producto.id)) {
      return
    }

    const nuevoMaterial: MaterialSeleccionado = {
      productoId: producto.id,
      nombre: producto.nombre,
      codigo: producto.codigo,
      cantidad: 1,
      unidadMedida: producto.unidadMedida,
      stockActual: producto.stockActual,
    }

    setMaterialesSeleccionados([...materialesSeleccionados, nuevoMaterial])
    setProductoOpen(false)
    setProductoSearch("")
  }

  // Actualizar cantidad de material
  const handleActualizarCantidadMaterial = (productoId: string, cantidad: number) => {
    setMaterialesSeleccionados((prev) =>
      prev.map((m) => (m.productoId === productoId ? { ...m, cantidad: Math.max(0, cantidad) } : m))
    )
  }

  // Eliminar material
  const handleEliminarMaterial = (productoId: string) => {
    setMaterialesSeleccionados((prev) => prev.filter((m) => m.productoId !== productoId))
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando orden...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/taller/ordenes/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Editar Orden {codigoOrden}</h1>
            <p className="text-muted-foreground">Modificar información de la orden de trabajo</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Información Principal
                </CardTitle>
                <CardDescription>Datos básicos de la orden de trabajo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Código de Orden */}
                <div className="space-y-2">
                  <Label htmlFor="codigo_orden">Código de Orden</Label>
                  <Input
                    id="codigo_orden"
                    value={codigoOrden}
                    onChange={(e) => setCodigoOrden(e.target.value.toUpperCase())}
                    placeholder="Ej: OT-PRE-EXC-001"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Puedes modificar el código de la orden si es necesario
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maquinaria">Maquinaria / Equipo *</Label>
                    <Select
                      value={formData.maquinaria}
                      onValueChange={(value) => handleInputChange("maquinaria", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar maquinaria" />
                      </SelectTrigger>
                      <SelectContent>
                        {maquinarias.map((maq) => (
                          <SelectItem key={maq.id} value={maq.id}>
                            {maq.codigo} - {maq.nombre} ({maq.empresaDisplay || maq.empresa})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_mantenimiento">Tipo de Mantenimiento *</Label>
                    <Select
                      value={formData.tipo_mantenimiento}
                      onValueChange={(value) => handleInputChange("tipo_mantenimiento", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
                        <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
                        <SelectItem value="EMERGENCIA">Emergencia</SelectItem>
                        <SelectItem value="LEGAL_INSPECCION">Legal / Inspección</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion_trabajo">Descripción del Trabajo *</Label>
                  <Textarea
                    id="descripcion_trabajo"
                    placeholder="Describe detalladamente el trabajo a realizar..."
                    value={formData.descripcion_trabajo}
                    onChange={(e) => handleInputChange("descripcion_trabajo", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prioridad">Prioridad *</Label>
                    <Select
                      value={formData.prioridad}
                      onValueChange={(value) => handleInputChange("prioridad", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BAJA">Baja</SelectItem>
                        <SelectItem value="MEDIA">Media</SelectItem>
                        <SelectItem value="ALTA">Alta</SelectItem>
                        <SelectItem value="URGENTE">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Estado (automático)</Label>
                    <div className="flex items-center h-10 px-3 border rounded-md bg-muted/50">
                      {formData.estado === "PENDIENTE" && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Pendiente
                        </Badge>
                      )}
                      {formData.estado === "EN_PROGRESO" && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          En Progreso
                        </Badge>
                      )}
                      {formData.estado === "VENCIDA" && (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                          Vencida
                        </Badge>
                      )}
                      {formData.estado === "COMPLETADA" && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Completada
                        </Badge>
                      )}
                      {formData.estado === "CANCELADA" && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Cancelada
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El estado cambia automáticamente según las fechas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tecnico">Técnico Asignado *</Label>
                    <Select
                      value={formData.tecnico}
                      onValueChange={(value) => handleInputChange("tecnico", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {empleados.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.nombreCompleto} - {emp.puesto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costo_estimado">Costo Estimado (Q)</Label>
                  <Input
                    id="costo_estimado"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.costo_estimado}
                    onChange={(e) => handleInputChange("costo_estimado", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Observaciones adicionales..."
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Materiales y Productos de Ferretería */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Materiales y Productos de Ferretería
                </CardTitle>
                <CardDescription>
                  Selecciona los materiales del inventario de ferretería que se utilizarán en el trabajo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selector de productos con buscador */}
                <div className="space-y-2">
                  <Label>Buscar Producto</Label>
                  <Popover open={productoOpen} onOpenChange={setProductoOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={productoOpen}
                        className="w-full justify-between"
                      >
                        {productoSearch || "Buscar producto por nombre, código o categoría..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar producto..."
                          value={productoSearch}
                          onValueChange={setProductoSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {productosLoading ? "Cargando productos..." : "No se encontraron productos."}
                          </CommandEmpty>
                          <CommandGroup>
                            {productosFiltrados.slice(0, 20).map((producto) => (
                              <CommandItem
                                key={producto.id}
                                value={`${producto.nombre} ${producto.codigo} ${producto.categoria}`}
                                onSelect={() => handleAgregarMaterial(producto)}
                                disabled={materialesSeleccionados.some((m) => m.productoId === producto.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    materialesSeleccionados.some((m) => m.productoId === producto.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{producto.nombre}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Código: {producto.codigo} | Stock: {producto.stockActual} {producto.unidadMedida}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Lista de materiales seleccionados */}
                {materialesSeleccionados.length > 0 && (
                  <div className="space-y-2">
                    <Label>Materiales Seleccionados</Label>
                    <div className="space-y-2">
                      {materialesSeleccionados.map((material) => (
                        <div
                          key={material.productoId}
                          className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{material.nombre}</div>
                            <div className="text-xs text-muted-foreground">
                              Código: {material.codigo} | Stock disponible: {material.stockActual}{" "}
                              {material.unidadMedida}
                              {material.cantidad > material.stockActual && (
                                <Badge variant="destructive" className="ml-2">
                                  Stock insuficiente
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">Cantidad:</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={material.cantidad}
                              onChange={(e) =>
                                handleActualizarCantidadMaterial(material.productoId, parseFloat(e.target.value) || 0)
                              }
                              className="w-20"
                            />
                            <span className="text-xs text-muted-foreground">{material.unidadMedida}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarMaterial(material.productoId)}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {materialesSeleccionados.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay materiales seleccionados. Usa el buscador para agregar productos del inventario.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Repuestos Externos */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Repuestos Externos
                </CardTitle>
                <CardDescription>
                  Lista de materiales y repuestos externos que se necesitarán conseguir (no están en inventario)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: Bujía NGK BKR6E-11, Filtro de aceite..."
                    value={nuevoRepuestoNombre}
                    onChange={(e) => setNuevoRepuestoNombre(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAgregarRepuestoExterno()
                      }
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Cant."
                    value={nuevoRepuestoCantidad}
                    onChange={(e) => setNuevoRepuestoCantidad(parseFloat(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Button
                    type="button"
                    onClick={handleAgregarRepuestoExterno}
                    disabled={!nuevoRepuestoNombre.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {repuestosExternos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Repuestos y Materiales Agregados</Label>
                    <div className="space-y-2">
                      {repuestosExternos.map((repuesto) => (
                        <div
                          key={repuesto.id}
                          className="flex items-center gap-2 p-3 border rounded-lg bg-background"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{repuesto.nombre}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">Cantidad:</Label>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={repuesto.cantidad}
                              onChange={(e) =>
                                handleActualizarCantidadRepuesto(repuesto.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-20"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarRepuestoExterno(repuesto.id)}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Programación */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Programación
                </CardTitle>
                <CardDescription>Fechas de la orden de trabajo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => handleInputChange("fecha_inicio", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_estimada_terminacion">Fecha Estimada de Terminación *</Label>
                  <Input
                    id="fecha_estimada_terminacion"
                    type="date"
                    value={formData.fecha_estimada_terminacion}
                    onChange={(e) => handleInputChange("fecha_estimada_terminacion", e.target.value)}
                    min={formData.fecha_inicio}
                  />
                </div>

                {formData.estado === "COMPLETADA" && (
                  <div className="space-y-2">
                    <Label htmlFor="fecha_terminacion_real">Fecha Real de Terminación</Label>
                    <Input
                      id="fecha_terminacion_real"
                      type="date"
                      value={formData.fecha_terminacion_real}
                      onChange={(e) => handleInputChange("fecha_terminacion_real", e.target.value)}
                    />
                  </div>
                )}

                {/* Resumen */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Resumen</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Código:</span>
                      <span className="font-medium">{codigoOrden}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estado:</span>
                      {formData.estado === "PENDIENTE" && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Pendiente
                        </Badge>
                      )}
                      {formData.estado === "EN_PROGRESO" && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          En Progreso
                        </Badge>
                      )}
                      {formData.estado === "VENCIDA" && (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                          Vencida
                        </Badge>
                      )}
                      {formData.estado === "COMPLETADA" && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Completada
                        </Badge>
                      )}
                      {formData.estado === "CANCELADA" && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Cancelada
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha creación:</span>
                      <span className="font-medium">
                        {formData.fecha_creacion_orden
                          ? new Date(formData.fecha_creacion_orden).toLocaleDateString("es-GT")
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Link href={`/taller/ordenes/${id}`}>
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
