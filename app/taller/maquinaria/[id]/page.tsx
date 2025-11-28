"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Edit, Printer, Settings, Wrench, Calendar, CheckCircle, AlertTriangle, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiDelete } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface MaquinariaDetallePageProps {
  params: Promise<{
    id: string
  }>
}

export default function MaquinariaDetallePage({ params }: MaquinariaDetallePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [maquinaria, setMaquinaria] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMaquinaria = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiGet<any>(API_ENDPOINTS.TALLER.MAQUINARIA_ITEM(id))
        setMaquinaria(data)
      } catch (err: any) {
        console.error("Error al cargar maquinaria:", err)
        setError(err.message || "No se pudo cargar la maquinaria")
        toast({
          title: "Error",
          description: err.message || "No se pudo cargar la maquinaria.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadMaquinaria()
  }, [id, toast])

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await apiDelete(API_ENDPOINTS.TALLER.MAQUINARIA_ITEM(id))
      toast({
        title: "Maquinaria Eliminada",
        description: "La maquinaria ha sido eliminada exitosamente.",
      })
      router.push("/taller/maquinaria")
    } catch (err: any) {
      console.error("Error al eliminar maquinaria:", err)
      toast({
        title: "Error",
        description: err.message || "No se pudo eliminar la maquinaria.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const getStatusVariant = (status: string) => {
    const statusLower = status?.toLowerCase() || ""
    if (statusLower.includes("operativa") || statusLower.includes("operativo")) {
      return "default"
    }
    if (statusLower.includes("mantenimiento")) {
      return "secondary"
    }
    if (statusLower.includes("fuera") || statusLower.includes("servicio") || statusLower.includes("reparacion")) {
      return "destructive"
    }
    if (statusLower.includes("reservada")) {
      return "outline"
    }
    return "outline"
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A"
    try {
      return new Date(date).toLocaleDateString("es-GT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <h1 className="text-3xl font-bold">Cargando...</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !maquinaria) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-3xl font-bold">Maquinaria no encontrada</h1>
        <p className="text-muted-foreground">
          {error || `La maquinaria con ID ${id} no existe.`}
        </p>
        <Button onClick={() => router.push("/taller/maquinaria")}>Volver a Maquinaria</Button>
      </div>
    )
  }

  // Normalizar datos
  const codigo = maquinaria.codigo || ""
  const nombre = maquinaria.nombre || ""
  const empresa = maquinaria.empresaDisplay || maquinaria.empresa_display || maquinaria.empresa || ""
  const tipoMaquinaria = maquinaria.tipoMaquinariaDisplay || maquinaria.tipo_maquinaria_display || maquinaria.tipoMaquinaria || maquinaria.tipo_maquinaria || ""
  const marca = maquinaria.marca || ""
  const modelo = maquinaria.modelo || ""
  const numeroSerie = maquinaria.numeroSerie || maquinaria.numero_serie || ""
  const añoFabricacion = maquinaria.añoFabricacion || maquinaria.año_fabricacion || null
  const estado = maquinaria.estadoActual || maquinaria.estado_actual || maquinaria.estado || ""
  const fechaUltimoMantenimiento = maquinaria.fechaUltimoMantenimiento || maquinaria.fecha_ultimo_mantenimiento || null
  const fechaProximoMantenimiento = maquinaria.fechaProximoMantenimiento || maquinaria.fecha_proximo_mantenimiento || maquinaria.proximoMantenimiento || null
  const horasOperacion = maquinaria.horasOperacion || maquinaria.horas_operacion || 0
  const kilometraje = maquinaria.kilometraje || 0
  const seguroVigente = maquinaria.seguroVigente ?? maquinaria.seguro_vigente ?? true
  const documentacionVigente = maquinaria.documentacionVigente ?? maquinaria.documentacion_vigente ?? true
  const ubicacionActual = maquinaria.ubicacionActual || maquinaria.ubicacion_actual || ""
  const observaciones = maquinaria.observaciones || ""
  const activo = maquinaria.activo !== undefined ? maquinaria.activo : true
  const createdAt = maquinaria.createdAt || maquinaria.created_at || null
  const updatedAt = maquinaria.updatedAt || maquinaria.updated_at || null

  const mantenimientoVencido = fechaProximoMantenimiento && new Date(fechaProximoMantenimiento) < new Date()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <h1 className="text-3xl font-bold">Detalle de Maquinaria: {codigo}</h1>
        <div className="flex gap-2">
          <Link href={`/taller/maquinaria/${id}/editar`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
          </Link>
          <Button>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código:</span>
              <span className="font-medium">{codigo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">{nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Empresa:</span>
              <Badge variant="outline">{empresa}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium">{tipoMaquinaria}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Marca:</span>
              <span className="font-medium">{marca}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modelo:</span>
              <span className="font-medium">{modelo}</span>
            </div>
            {numeroSerie && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Número de Serie:</span>
                <span className="font-medium">{numeroSerie}</span>
              </div>
            )}
            {añoFabricacion && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Año de Fabricación:</span>
                <span className="font-medium">{añoFabricacion}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(estado)}>{estado}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Activo:</span>
              <div className="flex items-center gap-1">
                {activo ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Activo</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">Inactivo</span>
                  </>
                )}
              </div>
            </div>
            {ubicacionActual && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ubicación:</span>
                <span className="font-medium">{ubicacionActual}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Último Mantenimiento:</span>
              <span className="font-medium">{formatDate(fechaUltimoMantenimiento)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Próximo Mantenimiento:</span>
              <span className={`font-medium ${mantenimientoVencido ? "text-red-600" : ""}`}>
                {formatDate(fechaProximoMantenimiento)}
                {mantenimientoVencido && <AlertTriangle className="h-4 w-4 inline ml-1" />}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horas de Operación:</span>
              <span className="font-medium">{horasOperacion.toLocaleString()} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kilometraje:</span>
              <span className="font-medium">{kilometraje.toLocaleString()} km</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Documentación
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Seguro:</span>
              <div className="flex items-center gap-1">
                {seguroVigente ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Vigente</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Vencido</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Documentación:</span>
              <div className="flex items-center gap-1">
                {documentacionVigente ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Vigente</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Vencida</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {observaciones && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{observaciones}</p>
            </CardContent>
          </Card>
        )}

        {(createdAt || updatedAt) && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              {createdAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de Creación:</span>
                  <span className="font-medium">{formatDate(createdAt)}</span>
                </div>
              )}
              {updatedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última Actualización:</span>
                  <span className="font-medium">{formatDate(updatedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Link href={`/taller/ordenes/nueva?maquinaria=${id}`}>
              <Button variant="outline">
                <Wrench className="mr-2 h-4 w-4" />
                Nueva Orden de Trabajo
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Maquinaria
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente la maquinaria{" "}
                    <strong>{codigo} - {nombre}</strong> del sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                    {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

