"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getSampleCotizacionesFerreteria, getSampleClientesFerreteria } from "@/lib/sample-data"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Printer } from "lucide-react"
import Link from "next/link"

interface CotizacionDetallePageProps {
  params: {
    id: string
  }
}

export default function CotizacionDetallePage({ params }: CotizacionDetallePageProps) {
  const router = useRouter()
  const cotizaciones = getSampleCotizacionesFerreteria()
  const clientes = getSampleClientesFerreteria()
  const cotizacion = cotizaciones.find((c) => c.id === params.id)

  if (!cotizacion) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-3xl font-bold">Cotización no encontrada</h1>
        <p className="text-muted-foreground">La cotización con ID {params.id} no existe.</p>
        <Button onClick={() => router.back()}>Volver a Cotizaciones</Button>
      </div>
    )
  }

  const clienteInfo = clientes.find((c) => c.nombre === cotizacion.cliente)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Aceptada":
        return "default"
      case "Pendiente":
        return "secondary"
      case "Rechazada":
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
        <h1 className="text-3xl font-bold">Detalle de Cotización: {cotizacion.codigo}</h1>
        <div className="flex gap-2">
          <Link href={`/ferreteria/cotizaciones/${cotizacion.id}/editar`}>
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
              <span className="font-medium">{cotizacion.codigo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">{cotizacion.fecha}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(cotizacion.estado)}>{cotizacion.estado}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold text-lg">Q{cotizacion.total.toFixed(2)}</span>
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
              <span className="font-medium">{cotizacion.cliente}</span>
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
            <CardTitle>Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {/* Asumiendo que la cotización tiene una propiedad 'notas' */}
              {/* @ts-ignore */}
              {cotizacion.notas || "No hay notas adicionales para esta cotización."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos Cotizados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cotizacion.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.nombreProducto}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                  <TableCell>Q{item.precioUnitario.toFixed(2)}</TableCell>
                  <TableCell className="text-right">Q{item.subtotal.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
