"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { getSampleOrdenesProduccionBloquera, getSampleProductosBloquera } from "@/lib/sample-data"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Printer, Package, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface OrdenDetallePageProps {
  params: {
    id: string
  }
}

interface LoteProduccion {
  id: string
  ordenId: string
  fechaProduccion: string
  cantidadProducida: number
  cantidadDefectuosa: number
  calidad: string
  supervisor: string
  notas?: string
}

export default function OrdenDetallePage({ params }: OrdenDetallePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const ordenes = getSampleOrdenesProduccionBloquera()
  const productos = getSampleProductosBloquera()
  const orden = ordenes.find((o) => o.id === params.id)

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loteToDelete, setLoteToDelete] = useState<any>(null)
  const [loteForm, setLoteForm] = useState({
    fechaProduccion: new Date().toISOString().split('T')[0],
    horaInicio: '',
    horaFin: '',
    cantidadProducida: '',
    cantidadDefectuosa: '',
    calidad: '',
    supervisor: '',
    notas: '',
  })

  if (!orden) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-3xl font-bold">Orden de Producción no encontrada</h1>
        <p className="text-muted-foreground">La orden con ID {params.id} no existe.</p>
        <Button onClick={() => router.back()}>Volver a Órdenes</Button>
      </div>
    )
  }

  const productoInfo = productos.find((p) => p.id === orden.productoId)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completada":
        return "default"
      case "En Proceso":
        return "secondary"
      case "Pendiente":
        return "outline"
      case "Cancelada":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getQualityVariant = (quality: string) => {
    switch (quality) {
      case "Excelente":
        return "default"
      case "Buena":
        return "secondary"
      case "Regular":
        return "secondary" // Using secondary for regular quality
      case "Mala":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleLoteFormChange = (field: string, value: string) => {
    setLoteForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleRegistrarLote = async () => {
    // Validaciones
    if (!loteForm.fechaProduccion) {
      toast({
        title: "Error",
        description: "Selecciona una fecha de producción",
        variant: "destructive",
      })
      return
    }

    if (!loteForm.horaInicio || !loteForm.horaFin) {
      toast({
        title: "Error",
        description: "Ingresa las horas de inicio y fin",
        variant: "destructive",
      })
      return
    }

    if (!loteForm.cantidadProducida || parseInt(loteForm.cantidadProducida) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa una cantidad producida válida",
        variant: "destructive",
      })
      return
    }

    if (!loteForm.calidad) {
      toast({
        title: "Error",
        description: "Selecciona la calidad del lote",
        variant: "destructive",
      })
      return
    }

    if (!loteForm.supervisor.trim()) {
      toast({
        title: "Error",
        description: "Ingresa el nombre del supervisor",
        variant: "destructive",
      })
      return
    }

    try {
      // Simulación de API call - en producción esto iría a la API real
      const nuevoLote = {
        id: `lote-${Date.now()}`,
        ordenId: orden.id,
        fechaProduccion: loteForm.fechaProduccion,
        horaInicio: loteForm.horaInicio,
        horaFin: loteForm.horaFin,
        cantidadProducida: parseInt(loteForm.cantidadProducida),
        cantidadDefectuosa: parseInt(loteForm.cantidadDefectuosa) || 0,
        calidad: loteForm.calidad,
        supervisor: loteForm.supervisor.trim(),
        notas: loteForm.notas.trim() || undefined,
      }

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log("Nuevo lote registrado:", nuevoLote)

      toast({
        title: "Lote Registrado",
        description: `Lote de ${nuevoLote.cantidadProducida} unidades registrado exitosamente`,
      })

      // Resetear formulario y cerrar modal
      setLoteForm({
        fechaProduccion: new Date().toISOString().split('T')[0],
        horaInicio: '',
        horaFin: '',
        cantidadProducida: '',
        cantidadDefectuosa: '',
        calidad: '',
        supervisor: '',
        notas: '',
      })
      setModalOpen(false)

      // Recargar la página para mostrar el nuevo lote
      window.location.reload()

    } catch (error: any) {
      console.error("Error al registrar lote:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el lote",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLote = (lote: any) => {
    setLoteToDelete(lote)
    setDeleteDialogOpen(true)
  }

  const confirmarEliminacionLote = async () => {
    if (!loteToDelete) return

    try {
      // Simulación de eliminación - en producción esto iría a la API real
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log("Eliminando lote:", loteToDelete.id)

      toast({
        title: "Lote Eliminado",
        description: `El lote de ${loteToDelete.cantidadProducida} unidades ha sido eliminado exitosamente`,
      })

      // Recargar la página para actualizar la lista
      window.location.reload()

    } catch (error: any) {
      console.error("Error al eliminar lote:", error)
      toast({
        title: "Error al Eliminar",
        description: error.message || "No se pudo eliminar el lote",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setLoteToDelete(null)
    }
  }

  // Verificar si hay excedente
  const tieneExcedente = orden.cantidadProducida > orden.cantidadSolicitada
  const excedente = tieneExcedente ? orden.cantidadProducida - orden.cantidadSolicitada : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <h1 className="text-3xl font-bold">Detalle de Orden: {orden.codigo}</h1>
        <div className="flex gap-2">
          <Link href={`/bloquera/ordenes/${orden.id}/editar`}>
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
              <span className="font-medium">{orden.codigo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Producto:</span>
              <span className="font-medium">{orden.nombreProducto}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cantidad Solicitada:</span>
              <span className="font-medium">{orden.cantidadSolicitada} unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cantidad Producida:</span>
              <span className="font-medium">{orden.cantidadProducida} unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(orden.estado)}>{orden.estado}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Responsable:</span>
              <span className="font-medium">{orden.responsable}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fechas Clave</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha de Creación:</span>
              <span className="font-medium">{orden.fechaCreacion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha de Inicio:</span>
              <span className="font-medium">{orden.fechaInicio || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha Fin Estimada:</span>
              <span className="font-medium">{orden.fechaFinEstimada || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">
              {orden.notas || "No hay notas adicionales para esta orden de producción."}
            </p>
            {tieneExcedente && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="text-amber-800 text-sm font-medium">
                  ⚠️ Excedente de Producción
                </div>
                <div className="text-amber-700 text-sm">
                  Se han producido {excedente} unidades más de las solicitadas ({orden.cantidadProducida} / {orden.cantidadSolicitada})
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lotes de Producción Asociados</CardTitle>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Package className="mr-2 h-4 w-4" />
                  Registrar Lote
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Lote de Producción</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo lote de producción para la orden {orden.codigo}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="fechaProduccion">Fecha de Producción *</Label>
                      <Input
                        id="fechaProduccion"
                        type="date"
                        value={loteForm.fechaProduccion}
                        onChange={(e) => handleLoteFormChange('fechaProduccion', e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="supervisor">Supervisor *</Label>
                      <Input
                        id="supervisor"
                        type="text"
                        placeholder="Nombre del supervisor"
                        value={loteForm.supervisor}
                        onChange={(e) => handleLoteFormChange('supervisor', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="horaInicio">Hora de Inicio *</Label>
                      <Input
                        id="horaInicio"
                        type="time"
                        value={loteForm.horaInicio}
                        onChange={(e) => handleLoteFormChange('horaInicio', e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="horaFin">Hora Final *</Label>
                      <Input
                        id="horaFin"
                        type="time"
                        value={loteForm.horaFin}
                        onChange={(e) => handleLoteFormChange('horaFin', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="cantidadProducida">Cantidad Producida *</Label>
                      <Input
                        id="cantidadProducida"
                        type="number"
                        min="1"
                        placeholder="0"
                        value={loteForm.cantidadProducida}
                        onChange={(e) => handleLoteFormChange('cantidadProducida', e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cantidadDefectuosa">Cantidad Defectuosa</Label>
                      <Input
                        id="cantidadDefectuosa"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={loteForm.cantidadDefectuosa}
                        onChange={(e) => handleLoteFormChange('cantidadDefectuosa', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="calidad">Calidad *</Label>
                    <Select value={loteForm.calidad} onValueChange={(value) => handleLoteFormChange('calidad', value)}>
                      <SelectTrigger id="calidad">
                        <SelectValue placeholder="Selecciona la calidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excelente">Excelente</SelectItem>
                        <SelectItem value="Buena">Buena</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Mala">Mala</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notas">Notas Adicionales</Label>
                    <Textarea
                      id="notas"
                      placeholder="Observaciones adicionales sobre el lote..."
                      value={loteForm.notas}
                      onChange={(e) => handleLoteFormChange('notas', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleRegistrarLote}>
                    Registrar Lote
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {orden.lotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Lote</TableHead>
                  <TableHead>Hora Inicio</TableHead>
                  <TableHead>Hora Final</TableHead>
                  <TableHead>Cantidad Producida</TableHead>
                  <TableHead>Cantidad Defectuosa</TableHead>
                  <TableHead>Calidad</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orden.lotes.map((lote: any) => (
                  <TableRow key={lote.id}>
                    <TableCell className="font-medium">{lote.fechaProduccion}</TableCell>
                    <TableCell>{lote.horaInicio || "N/A"}</TableCell>
                    <TableCell>{lote.horaFin || "N/A"}</TableCell>
                    <TableCell>{lote.cantidadProducida}</TableCell>
                    <TableCell>{lote.cantidadDefectuosa}</TableCell>
                    <TableCell>
                      <Badge variant={getQualityVariant(lote.calidad)}>{lote.calidad}</Badge>
                    </TableCell>
                    <TableCell>{lote.supervisor}</TableCell>
                    <TableCell className="text-muted-foreground">{lote.notas || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLote(lote)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        aria-label="Eliminar lote"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground">No hay lotes de producción registrados para esta orden.</p>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar lote */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este lote?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el lote de producción de{' '}
              <strong>{loteToDelete?.cantidadProducida} unidades</strong> registrado el{' '}
              <strong>{loteToDelete?.fechaProduccion}</strong> bajo la supervisión de{' '}
              <strong>{loteToDelete?.supervisor}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminacionLote}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar Lote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
