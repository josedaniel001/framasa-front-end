"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, ClipboardList, Clock, PlayCircle, CheckCircle, Eye, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getSampleOrdenesProduccionBloquera } from "@/lib/sample-data"

export default function OrdenesBloqueraPage() {
  const ordenes = getSampleOrdenesProduccionBloquera()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrdenes = ordenes.filter(
    (orden) =>
      orden.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.responsable.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalOrdenes = ordenes.length
  const ordenesPendientes = ordenes.filter((o) => o.estado === "Pendiente").length
  const ordenesEnProceso = ordenes.filter((o) => o.estado === "En Proceso").length
  const ordenesCompletadas = ordenes.filter((o) => o.estado === "Completada").length

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Órdenes de Producción</h1>
        <Link href="/bloquera/ordenes/nueva">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nueva Orden
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrdenes}</div>
            <p className="text-xs text-muted-foreground">Órdenes de producción registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordenesPendientes}</div>
            <p className="text-xs text-muted-foreground">En espera de inicio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes en Proceso</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordenesEnProceso}</div>
            <p className="text-xs text-muted-foreground">Actualmente en fabricación</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordenesCompletadas}</div>
            <p className="text-xs text-muted-foreground">Producción finalizada</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Órdenes de Producción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar órdenes por código, producto o responsable..."
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
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad Solicitada</TableHead>
                <TableHead>Cantidad Producida</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrdenes.map((orden) => (
                <TableRow key={orden.id}>
                  <TableCell className="font-medium">{orden.codigo}</TableCell>
                  <TableCell>{orden.nombreProducto}</TableCell>
                  <TableCell>{orden.cantidadSolicitada}</TableCell>
                  <TableCell>{orden.cantidadProducida}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(orden.estado)}>{orden.estado}</Badge>
                  </TableCell>
                  <TableCell>{orden.fechaCreacion}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/bloquera/ordenes/${orden.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </Link>
                      <Link href={`/bloquera/ordenes/${orden.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredOrdenes.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No se encontraron órdenes de producción.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
