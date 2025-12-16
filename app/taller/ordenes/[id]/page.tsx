"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Wrench,
  CheckCircle,
  DollarSign,
  FileText,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  Package,
  XCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { toast } from "sonner"

interface ProductoOrden {
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
}

interface OrdenTrabajo {
  id: string
  codigoOrden: string
  maquinariaId: number
  maquinariaNombre: string
  maquinariaCodigo: string
  equipo: string
  tecnicoId: number
  tecnicoNombre: string
  tecnico: string
  tipoMantenimiento: string
  tipoMantenimientoDisplay: string
  tipo: string
  descripcionTrabajo: string
  descripcion: string
  prioridad: string
  prioridadDisplay: string
  observaciones: string
  repuestosExternos: Array<{ nombre: string; id?: string; cantidad?: number }>
  productosOrden: ProductoOrden[]
  productos_orden: ProductoOrden[]
  fechaCreacionOrden: string
  fechaCreacion: string
  fechaInicio: string
  fechaEstimadaTerminacion: string
  fechaTerminacionReal: string | null
  estado: string
  estadoDisplay: string
  progreso: number
  costoTotalQ: number
  costoEstimado: number
  costo_estimado: number
  costo: number
  activo: boolean
  estaVencida: boolean
  diasRestantes: number
}

const getEstadoBadge = (estado: string) => {
  const variants: Record<string, string> = {
    Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    "En Progreso": "bg-blue-100 text-blue-800 border-blue-200",
    EN_PROGRESO: "bg-blue-100 text-blue-800 border-blue-200",
    Completada: "bg-green-100 text-green-800 border-green-200",
    COMPLETADA: "bg-green-100 text-green-800 border-green-200",
    Cancelada: "bg-red-100 text-red-800 border-red-200",
    CANCELADA: "bg-red-100 text-red-800 border-red-200",
    Vencida: "bg-purple-100 text-purple-800 border-purple-200",
    VENCIDA: "bg-purple-100 text-purple-800 border-purple-200",
  }
  return variants[estado] || variants["Pendiente"]
}

const getPrioridadBadge = (prioridad: string) => {
  const variants: Record<string, string> = {
    Baja: "bg-gray-100 text-gray-800 border-gray-200",
    BAJA: "bg-gray-100 text-gray-800 border-gray-200",
    Media: "bg-yellow-100 text-yellow-800 border-yellow-200",
    MEDIA: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Alta: "bg-orange-100 text-orange-800 border-orange-200",
    ALTA: "bg-orange-100 text-orange-800 border-orange-200",
    Urgente: "bg-red-100 text-red-800 border-red-200",
    URGENTE: "bg-red-100 text-red-800 border-red-200",
  }
  return variants[prioridad] || variants["Media"]
}

export default function DetalleOrdenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [orden, setOrden] = useState<OrdenTrabajo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelarDialog, setShowCancelarDialog] = useState(false)
  const [showCompletarDialog, setShowCompletarDialog] = useState(false)
  const [isCompletando, setIsCompletando] = useState(false)
  const [isCancelando, setIsCancelando] = useState(false)
  const [fechaTerminacionReal, setFechaTerminacionReal] = useState("")

  // Cargar orden
  useEffect(() => {
    const loadOrden = async () => {
      try {
        setIsLoading(true)
        const data = await apiGet<OrdenTrabajo>(API_ENDPOINTS.TALLER.ORDEN(id))
        setOrden(data)
      } catch (error: any) {
        console.error("Error al cargar orden:", error)
        toast.error("Error al cargar la orden de trabajo")
        router.push("/taller/ordenes")
      } finally {
        setIsLoading(false)
      }
    }

    loadOrden()
  }, [id, router])

  // Abrir diálogo para completar orden
  const abrirDialogoCompletar = () => {
    if (!orden) return
    
    // Verificar si la orden está en estado PENDIENTE
    const estadoValor = (orden.estado || "").toUpperCase()
    const estadoDisplayValor = (orden.estadoDisplay || "").toUpperCase()
    
    if (estadoValor === "PENDIENTE" || estadoDisplayValor === "PENDIENTE") {
      toast.error(
        "No se puede completar una orden en estado Pendiente. Primero debe cambiar la fecha de inicio a la fecha actual para que la orden pase a estado 'En Progreso' y luego vuelva a intentar.",
        { duration: 6000 }
      )
      return
    }
    
    // Abrir diálogo para ingresar fecha de terminación
    setFechaTerminacionReal("")
    setShowCompletarDialog(true)
  }

  // Autorellenar fecha y hora actual (hora local de Guatemala)
  const autorellenarFechaHora = () => {
    const ahora = new Date()
    // Obtener componentes en hora local
    const año = ahora.getFullYear()
    const mes = String(ahora.getMonth() + 1).padStart(2, '0')
    const dia = String(ahora.getDate()).padStart(2, '0')
    const hora = String(ahora.getHours()).padStart(2, '0')
    const minutos = String(ahora.getMinutes()).padStart(2, '0')
    // Formato: YYYY-MM-DDTHH:MM para datetime-local
    const fechaHora = `${año}-${mes}-${dia}T${hora}:${minutos}`
    setFechaTerminacionReal(fechaHora)
  }

  // Completar orden
  const handleCompletarOrden = async () => {
    if (!orden) return

    if (!fechaTerminacionReal) {
      toast.error("Por favor, ingrese la fecha y hora de terminación")
      return
    }
    
    try {
      setIsCompletando(true)
      await apiPost(API_ENDPOINTS.TALLER.ORDEN_CAMBIAR_ESTADO(id), { 
        estado: "COMPLETADA",
        fecha_terminacion_real: fechaTerminacionReal
      })
      toast.success("Orden completada exitosamente")
      setShowCompletarDialog(false)
      // Recargar orden
      const data = await apiGet<OrdenTrabajo>(API_ENDPOINTS.TALLER.ORDEN(id))
      setOrden(data)
    } catch (error: any) {
      console.error("Error al completar orden:", error)
      toast.error(error.message || "Error al completar la orden")
    } finally {
      setIsCompletando(false)
    }
  }

  // Cancelar orden
  const handleCancelarOrden = async () => {
    if (!orden) return

    try {
      setIsCancelando(true)
      await apiPost(API_ENDPOINTS.TALLER.ORDEN_CAMBIAR_ESTADO(id), { estado: "CANCELADA" })
      toast.success(`Orden ${orden.codigoOrden} cancelada correctamente`)
      // Recargar orden
      const data = await apiGet<OrdenTrabajo>(API_ENDPOINTS.TALLER.ORDEN(id))
      setOrden(data)
    } catch (error: any) {
      console.error("Error al cancelar orden:", error)
      toast.error(error.message || "Error al cancelar la orden")
    } finally {
      setIsCancelando(false)
      setShowCancelarDialog(false)
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando orden...</span>
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Orden no encontrada</h2>
        <p className="text-muted-foreground mb-4">La orden de trabajo que buscas no existe.</p>
        <Link href="/taller/ordenes">
          <Button>Volver a Órdenes</Button>
        </Link>
      </div>
    )
  }

  const estadoActual = orden.estadoDisplay || orden.estado
  const prioridadActual = orden.prioridadDisplay || orden.prioridad
  const tipoActual = orden.tipoMantenimientoDisplay || orden.tipo || orden.tipoMantenimiento
  const costoEstimado = orden.costoEstimado || orden.costo_estimado || orden.costoTotalQ || orden.costo || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/taller/ordenes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{orden.codigoOrden}</h1>
            <p className="text-muted-foreground">{orden.equipo}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {orden.estado !== "COMPLETADA" && orden.estadoDisplay !== "Completada" && 
           orden.estado !== "CANCELADA" && orden.estadoDisplay !== "Cancelada" && (
            <Button
              onClick={abrirDialogoCompletar}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Completar Orden
            </Button>
          )}
          <Link href={`/taller/ordenes/${id}/editar`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          {orden.estado !== "CANCELADA" && orden.estadoDisplay !== "Cancelada" && 
           orden.estado !== "COMPLETADA" && orden.estadoDisplay !== "Completada" && (
            <Button
              variant="outline"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              onClick={() => setShowCancelarDialog(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar Orden
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estado y Progreso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Estado y Progreso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className={`${getEstadoBadge(estadoActual)} border`}>{estadoActual}</Badge>
                <Badge className={`${getPrioridadBadge(prioridadActual)} border`}>{prioridadActual}</Badge>
                <span className="text-sm text-muted-foreground">Tipo: {tipoActual}</span>
                {orden.estaVencida && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Vencida
                  </Badge>
                )}
              </div>

              {orden.fechaInicio && orden.fechaEstimadaTerminacion && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso del trabajo</span>
                    <span>{orden.progreso}%</span>
                  </div>
                  <Progress
                    value={orden.progreso}
                    className={`h-2 ${
                      orden.estado === "COMPLETADA" || orden.estadoDisplay === "Completada"
                        ? "[&>div]:bg-green-600"
                        : orden.estaVencida
                          ? "[&>div]:bg-red-600"
                          : "[&>div]:bg-blue-600"
                    }`}
                  />
                  {(orden.estado === "COMPLETADA" || orden.estadoDisplay === "Completada") && (
                    <div className="text-xs text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Trabajo completado exitosamente
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Inicio: {new Date(orden.fechaInicio).toLocaleDateString("es-GT")} | Fin:{" "}
                      {new Date(orden.fechaEstimadaTerminacion).toLocaleDateString("es-GT")}
                    </span>
                    <span>Costo Estimado: Q{costoEstimado.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descripción del Trabajo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Descripción del Trabajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{orden.descripcionTrabajo || orden.descripcion}</p>
              {orden.observaciones && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Observaciones</h4>
                  <p className="text-blue-800 text-sm">{orden.observaciones}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos de Ferretería Usados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos de Ferretería Usados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(orden.productosOrden || orden.productos_orden || []).length > 0 ? (
                <div className="space-y-3">
                  {(orden.productosOrden || orden.productos_orden || []).map((producto) => (
                    <div key={producto.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex-1">
                        <p className="font-medium">{producto.productoNombre || producto.producto_nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          Código: {producto.productoCodigo || producto.producto_codigo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {producto.cantidad} {producto.productoUnidadMedida || producto.producto_unidad_medida}
                        </p>
                        {(producto.descontadoInventario || producto.descontado_inventario) && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Descontado
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No hay productos de ferretería registrados en esta orden
                </p>
              )}
            </CardContent>
          </Card>

          {/* Listado de Repuestos y Materiales Externos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Listado de Repuestos y Materiales Externos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orden.repuestosExternos && orden.repuestosExternos.length > 0 ? (
                <div className="space-y-3">
                  {orden.repuestosExternos.map((repuesto, index) => (
                    <div key={repuesto.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{repuesto.nombre}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{repuesto.cantidad || 1} unidad(es)</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No hay repuestos y materiales externos registrados
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Información del Técnico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Técnico Asignado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-medium">{orden.tecnicoNombre || orden.tecnico || "Sin asignar"}</h3>
              </div>
            </CardContent>
          </Card>

          {/* Fechas Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creación:</span>
                <span>{new Date(orden.fechaCreacionOrden || orden.fechaCreacion).toLocaleDateString("es-GT")}</span>
              </div>
              {orden.fechaInicio && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inicio:</span>
                  <span>{new Date(orden.fechaInicio).toLocaleDateString("es-GT")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimada de terminación:</span>
                <span>{new Date(orden.fechaEstimadaTerminacion).toLocaleDateString("es-GT")}</span>
              </div>
              {orden.fechaTerminacionReal && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground font-medium">Terminación real:</span>
                  <span className="font-medium text-green-600">
                    {new Date(orden.fechaTerminacionReal).toLocaleDateString("es-GT")}
                  </span>
                </div>
              )}
              {!orden.fechaTerminacionReal && orden.diasRestantes !== undefined && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Días restantes:</span>
                  <span className={`font-medium ${orden.diasRestantes < 0 ? "text-red-600" : "text-green-600"}`}>
                    {orden.diasRestantes < 0 ? `${Math.abs(orden.diasRestantes)} días de atraso` : `${orden.diasRestantes} días`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen de Costos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen de Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between font-medium text-lg">
                <span>Costo Estimado:</span>
                <span>Q{costoEstimado.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Dialog de confirmación para cancelar orden */}
      <AlertDialog open={showCancelarDialog} onOpenChange={setShowCancelarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar orden de trabajo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cambiará el estado de la orden <strong>{orden.codigoOrden}</strong> a <strong>Cancelada</strong>.
              Los materiales usados no serán devueltos automáticamente al inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelando}>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelarOrden}
              disabled={isCancelando}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCancelando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Cancelar Orden"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para completar orden con fecha/hora */}
      <AlertDialog open={showCompletarDialog} onOpenChange={setShowCompletarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Completar Orden de Trabajo</AlertDialogTitle>
            <AlertDialogDescription>
              Ingrese la fecha y hora en que se terminó realmente la orden <strong>{orden.codigoOrden}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha y Hora de Terminación Real</label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={fechaTerminacionReal}
                  onChange={(e) => setFechaTerminacionReal(e.target.value)}
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={autorellenarFechaHora}
                  className="whitespace-nowrap"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Ahora
                </Button>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompletando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompletarOrden}
              disabled={isCompletando || !fechaTerminacionReal}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCompletando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar Orden
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
