"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Package, DollarSign, ArrowDownCircle, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getSampleInventarioPiedrinera } from "@/lib/sample-data"

export default function InventarioPiedrineraPage() {
  const inventario = getSampleInventarioPiedrinera()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInventario = inventario.filter(
    (item) =>
      item.nombreAgregado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tipo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalArticulos = inventario.length
  const valorTotalInventario = inventario.reduce(
    (sum, item) => sum + item.cantidadMetrosCubicos * item.precioUnitario,
    0,
  )
  const stockBajo = inventario.filter((item) => item.cantidadMetrosCubicos <= item.stockMinimoMetrosCubicos).length
  // Asumiendo que "últimos movimientos" es un conteo simple por ahora
  const ultimosMovimientos = 10 // Placeholder

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventario de Piedrinera</h1>
        <Link href="/piedrinera/inventario/ajustar">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajustar Inventario
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agregados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticulos}</div>
            <p className="text-xs text-muted-foreground">Tipos de agregados únicos en stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Q {valorTotalInventario.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Costo total de los agregados en stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockBajo}</div>
            <p className="text-xs text-muted-foreground">Agregados que necesitan producción</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Últimos Movimientos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ultimosMovimientos}</div>
            <p className="text-xs text-muted-foreground">Movimientos en las últimas 24h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agregados en Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por código, nombre o tipo de agregado..."
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
                <TableHead>Nombre del Agregado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad (m³)</TableHead>
                <TableHead>Stock Mínimo (m³)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventario.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.codigo}</TableCell>
                  <TableCell>{item.nombreAgregado}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.cantidadMetrosCubicos}</TableCell>
                  <TableCell>{item.stockMinimoMetrosCubicos}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.cantidadMetrosCubicos <= item.stockMinimoMetrosCubicos ? "destructive" : "secondary"
                      }
                    >
                      {item.cantidadMetrosCubicos <= item.stockMinimoMetrosCubicos ? "Bajo" : "Suficiente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/piedrinera/inventario/${item.id}/ajustar`}>
                      <Button variant="outline" size="sm">
                        Ajustar
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredInventario.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No se encontraron agregados en inventario.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
