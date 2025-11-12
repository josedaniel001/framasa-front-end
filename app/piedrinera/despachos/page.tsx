"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Truck, Clock, CheckCircle, XCircle, Eye, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getSampleDespachosPiedrinera } from "@/lib/sample-data"

export default function DespachosPiedrineraPage() {
  const despachos = getSampleDespachosPiedrinera()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDespachos = despachos.filter(
    (despacho) =>
      despacho.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      despacho.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      despacho.placaCamion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      despacho.nombreAgregado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      despacho.estado.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalDespachos = despachos.length
  const despachosPendientes = despachos.filter((d) => d.estado === "Pendiente").length
  const despachosDespachados = despachos.filter((d) => d.estado === "Despachado").length
  const despachosEntregados = despachos.filter((d) => d.estado === "Entregado").length

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
        <h1 className="text-3xl font-bold">Despachos</h1>
        <Link href="/piedrinera/despachos/nuevo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Despacho
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despachos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDespachos}</div>
            <p className="text-xs text-muted-foreground">Despachos registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despachos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{despachosPendientes}</div>
            <p className="text-xs text-muted-foreground">Por salir de planta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despachos Despachados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{despachosDespachados}</div>
            <p className="text-xs text-muted-foreground">En ruta al destino</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despachos Entregados</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{despachosEntregados}</div>
            <p className="text-xs text-muted-foreground">Entregas completadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Despachos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar despachos por código, cliente, placa o agregado..."
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
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Agregado</TableHead>
                <TableHead>Cantidad (m³)</TableHead>
                <TableHead>Camión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDespachos.map((despacho) => (
                <TableRow key={despacho.id}>
                  <TableCell className="font-medium">{despacho.codigo}</TableCell>
                  <TableCell>{despacho.fecha}</TableCell>
                  <TableCell>{despacho.cliente}</TableCell>
                  <TableCell>{despacho.nombreAgregado}</TableCell>
                  <TableCell>{despacho.cantidadMetrosCubicos}</TableCell>
                  <TableCell>{despacho.placaCamion}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(despacho.estado)}>{despacho.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/piedrinera/despachos/${despacho.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </Link>
                      <Link href={`/piedrinera/despachos/${despacho.id}/editar`}>
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
          {filteredDespachos.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No se encontraron despachos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
