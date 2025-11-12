import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          Editar Venta: <Skeleton className="h-8 w-32 inline-block" />
        </h1>
      </div>
      <p className="text-muted-foreground">Modifica los detalles de la venta existente.</p>

      <form className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha de Venta</Label>
              <Input id="fecha" type="date" disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado de la Venta</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea id="notas" placeholder="Cargando..." disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agregados de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-[3fr_1fr_auto]">
              <div className="grid gap-2">
                <Label htmlFor="agregado">Agregado</Label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cantidadMetrosCubicos">Cantidad (m³)</Label>
                <Input id="cantidadMetrosCubicos" type="number" disabled />
              </div>
              <div className="flex items-end">
                <Button type="button" disabled>
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agregado</TableHead>
                  <TableHead>Cantidad (m³)</TableHead>
                  <TableHead>Precio Unitario</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <Label className="text-lg font-semibold">Total:</Label>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled>
            Cancelar
          </Button>
          <Button type="submit" disabled>
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
