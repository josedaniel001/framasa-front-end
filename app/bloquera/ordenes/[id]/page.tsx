"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getSampleOrdenesProduccionBloquera, getSampleProductosBloquera } from "@/lib/sample-data"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Printer } from "lucide-react"
import Link from "next/link"

interface OrdenDetallePageProps {
  params: {
    id: string
  }
}

export default function OrdenDetallePage({ params }: OrdenDetallePageProps) {
  const router = useRouter()
  const ordenes = getSampleOrdenesProduccionBloquera()
  const productos = getSampleProductosBloquera()
  const orden = ordenes.find((o) => o.id === params.id)

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
        return "warning" // Assuming a warning variant exists or can be styled
      case "Mala":
        return "destructive"
      default:
        return "outline"
    }
  }

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
          <CardContent>
            <p className="text-muted-foreground">
              {orden.notas || "No hay notas adicionales para esta orden de producción."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lotes de Producción Asociados</CardTitle>
        </CardHeader>
        <CardContent>
          {orden.lotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Lote</TableHead>
                  <TableHead>Cantidad Producida</TableHead>
                  <TableHead>Cantidad Defectuosa</TableHead>
                  <TableHead>Calidad</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orden.lotes.map((lote) => (
                  <TableRow key={lote.id}>
                    <TableCell className="font-medium">{lote.fechaProduccion}</TableCell>
                    <TableCell>{lote.cantidadProducida}</TableCell>
                    <TableCell>{lote.cantidadDefectuosa}</TableCell>
                    <TableCell>
                      <Badge variant={getQualityVariant(lote.calidad)}>{lote.calidad}</Badge>
                    </TableCell>
                    <TableCell>{lote.supervisor}</TableCell>
                    <TableCell className="text-muted-foreground">{lote.notas || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground">No hay lotes de producción registrados para esta orden.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
