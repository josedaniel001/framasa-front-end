"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  getSampleDespachosPiedrinera,
  getSampleAgregadosPiedrinera,
  getSampleCamionesPiedrinera,
  getSampleClientesFerreteria,
} from "@/lib/sample-data"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Printer } from "lucide-react"
import Link from "next/link"

interface DespachoDetallePageProps {
  params: {
    id: string
  }
}

export default function DespachoDetallePage({ params }: DespachoDetallePageProps) {
  const router = useRouter()
  const despachos = getSampleDespachosPiedrinera()
  const agregados = getSampleAgregadosPiedrinera()
  const camiones = getSampleCamionesPiedrinera()
  const clientes = getSampleClientesFerreteria()
  const despacho = despachos.find((d) => d.id === params.id)

  if (!despacho) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-3xl font-bold">Despacho no encontrado</h1>
        <p className="text-muted-foreground">El despacho con ID {params.id} no existe.</p>
        <Button onClick={() => router.back()}>Volver a Despachos</Button>
      </div>
    )
  }

  const agregadoInfo = agregados.find((a) => a.id === despacho.agregadoId)
  const camionInfo = camiones.find((c) => c.id === despacho.camionId)
  const clienteInfo = clientes.find((c) => c.nombre === despacho.cliente)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Entregado":
        return "default"
      case "Despachado":
        return "secondary"
      case "Pendiente":
        return "outline"
      case "Cancelado":
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
        <h1 className="text-3xl font-bold">Detalle de Despacho: {despacho.codigo}</h1>
        <div className="flex gap-2">
          <Link href={`/piedrinera/despachos/${despacho.id}/editar`}>
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
              <span className="font-medium">{despacho.codigo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">{despacho.fecha}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(despacho.estado)}>{despacho.estado}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold text-lg">Q{despacho.precioTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">{despacho.cliente}</span>
            </div>
            {clienteInfo && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NIT:</span>
                  <span className="font-medium">{clienteInfo.nit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span className="font-medium">{clienteInfo.telefono}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{clienteInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dirección:</span>
                  <span className="font-medium text-right">{clienteInfo.direccion}</span>
                </div>
              </>
            )}
            {!clienteInfo && <p className="text-muted-foreground text-sm">Detalles del cliente no disponibles.</p>}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Información del Camión</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Placa:</span>
              <span className="font-medium">{despacho.placaCamion}</span>
            </div>
            {camionInfo && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marca:</span>
                  <span className="font-medium">{camionInfo.marca}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modelo:</span>
                  <span className="font-medium">{camionInfo.modelo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacidad:</span>
                  <span className="font-medium">{camionInfo.capacidadMetrosCubicos} m³</span>
                </div>
              </>
            )}
            {!camionInfo && <p className="text-muted-foreground text-sm">Detalles del camión no disponibles.</p>}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Piloto:</span>
              <span className="font-medium">{despacho.piloto}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Agregado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agregado</TableHead>
                <TableHead>Cantidad (m³)</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{despacho.nombreAgregado}</TableCell>
                <TableCell>{despacho.cantidadMetrosCubicos}</TableCell>
                <TableCell>Q{(agregadoInfo?.precioVentaPorMetroCubico || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">Q{despacho.precioTotal.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
