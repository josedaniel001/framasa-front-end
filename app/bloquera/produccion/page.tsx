"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Factory, CheckCircle, Clock, XCircle, Eye, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getSampleOrdenesProduccionBloquera } from "@/lib/sample-data"

export default function ProduccionBloqueraPage() {
  const ordenes = getSampleOrdenesProduccionBloquera()
  // Aplanar los lotes para mostrarlos en una tabla única
  const lotes = ordenes.flatMap((orden) =>
    orden.lotes.map((lote) => ({
      ...lote,
      ordenCodigo: orden.codigo,
      nombreProducto: orden.nombreProducto,
    })),
  )
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLotes = lotes.filter(
    (lote) =>
      lote.ordenCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lote.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lote.supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lote.calidad.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalLotesProducidosMes = lotes.filter(
    (l) => new Date(l.fechaProduccion).getMonth() === new Date().getMonth(),
  ).length
  const cantidadProducidaMes = lotes
    .filter((l) => new Date(l.fechaProduccion).getMonth() === new Date().getMonth())
    .reduce((sum, l) => sum + l.cantidadProducida, 0)
  const lotesEnProceso = ordenes.filter((o) => o.estado === "En Proceso").length
  const lotesCompletados = ordenes.filter((o) => o.estado === "Completada").length

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
        <h1 className="text-3xl font-bold">Producción de Bloques</h1>
        <Link href="/bloquera/produccion/nuevo-lote">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Lote
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lotes Producidos (Mes)</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLotesProducidosMes}</div>
            <p className="text-xs text-muted-foreground">Lotes finalizados este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cantidad Producida (Mes)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cantidadProducidaMes}</div>
            <p className="text-xs text-muted-foreground">Unidades producidas este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes en Proceso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lotesEnProceso}</div>
            <p className="text-xs text-muted-foreground">Órdenes activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Completadas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lotesCompletados}</div>
            <p className="text-xs text-muted-foreground">Órdenes finalizadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Lotes de Producción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar lotes por código de orden, producto o supervisor..."
                className="w-full rounded-lg bg-background pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">Filtrar</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Orden</TableHead>
                <TableHead>Fecha Producción</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad Producida</TableHead>
                <TableHead>Cantidad Defectuosa</TableHead>
                <TableHead>Calidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLotes.map((lote) => (
                <TableRow key={lote.id}>
                  <TableCell className="font-medium">{lote.ordenCodigo}</TableCell>
                  <TableCell>{lote.fechaProduccion}</TableCell>
                  <TableCell>{lote.nombreProducto}</TableCell>
                  <TableCell>{lote.cantidadProducida}</TableCell>
                  <TableCell>{lote.cantidadDefectuosa}</TableCell>
                  <TableCell>
                    <Badge variant={getQualityVariant(lote.calidad)}>{lote.calidad}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Enlace para ver la orden completa */}
                      <Link href={`/bloquera/ordenes/${lote.ordenId}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver Orden</span>
                        </Button>
                      </Link>
                      {/* Enlace para editar el lote específico si fuera necesario */}
                      <Link href={`/bloquera/produccion/${lote.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar Lote</span>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredLotes.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No se encontraron lotes de producción.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
