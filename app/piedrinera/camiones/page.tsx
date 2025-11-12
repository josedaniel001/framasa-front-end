"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Truck, CheckCircle, Wrench, Eye, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getSampleCamionesPiedrinera } from "@/lib/sample-data"

export default function CamionesPiedrineraPage() {
  const camiones = getSampleCamionesPiedrinera()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCamiones = camiones.filter(
    (camion) =>
      camion.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camion.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camion.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camion.estado.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalCamiones = camiones.length
  const camionesDisponibles = camiones.filter((c) => c.estado === "Disponible").length
  const camionesEnRuta = camiones.filter((c) => c.estado === "En Ruta").length
  const camionesEnMantenimiento = camiones.filter((c) => c.estado === "En Mantenimiento").length

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Disponible":
        return "default"
      case "En Ruta":
        return "secondary"
      case "En Mantenimiento":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Camiones</h1>
        <Link href="/piedrinera/camiones/nuevo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Camión
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Camiones</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCamiones}</div>
            <p className="text-xs text-muted-foreground">Vehículos registrados en la flota</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Camiones Disponibles</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{camionesDisponibles}</div>
            <p className="text-xs text-muted-foreground">Listos para despachar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Camiones en Ruta</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{camionesEnRuta}</div>
            <p className="text-xs text-muted-foreground">Actualmente realizando entregas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{camionesEnMantenimiento}</div>
            <p className="text-xs text-muted-foreground">Requieren atención técnica</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Camiones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar camiones por placa, marca o estado..."
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
                <TableHead>Placa</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Capacidad (m³)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Próx. Mantenimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCamiones.map((camion) => (
                <TableRow key={camion.id}>
                  <TableCell className="font-medium">{camion.placa}</TableCell>
                  <TableCell>{camion.marca}</TableCell>
                  <TableCell>{camion.modelo}</TableCell>
                  <TableCell>{camion.capacidadMetrosCubicos}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(camion.estado)}>{camion.estado}</Badge>
                  </TableCell>
                  <TableCell>{camion.proximoMantenimiento}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/piedrinera/camiones/${camion.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </Link>
                      <Link href={`/piedrinera/camiones/${camion.id}/editar`}>
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
          {filteredCamiones.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No se encontraron camiones.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
