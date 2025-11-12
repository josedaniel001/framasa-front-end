"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Printer, Truck, Wrench, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getSampleCamionesPiedrinera } from "@/lib/sample-data"

interface CamionDetallePageProps {
  params: {
    id: string
  }
}

export default function CamionDetallePage({ params }: CamionDetallePageProps) {
  const router = useRouter()
  const camiones = getSampleCamionesPiedrinera()
  const camion = camiones.find((c) => c.id === params.id)

  if (!camion) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-3xl font-bold">Camión no encontrado</h1>
        <p className="text-muted-foreground">El camión con ID {params.id} no existe.</p>
        <Button onClick={() => router.back()}>Volver a Camiones</Button>
      </div>
    )
  }

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
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <h1 className="text-3xl font-bold">Detalle de Camión: {camion.placa}</h1>
        <div className="flex gap-2">
          <Link href={`/piedrinera/camiones/${camion.id}/editar`}>
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
              <span className="text-muted-foreground">Placa:</span>
              <span className="font-medium">{camion.placa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Marca:</span>
              <span className="font-medium">{camion.marca}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modelo:</span>
              <span className="font-medium">{camion.modelo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capacidad:</span>
              <span className="font-medium">{camion.capacidadMetrosCubicos} m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(camion.estado)}>{camion.estado}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Último Mantenimiento:</span>
              <span className="font-medium">
                {new Date(camion.ultimoMantenimiento).toLocaleDateString("es-GT")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Próximo Mantenimiento:</span>
              <span className="font-medium">
                {new Date(camion.proximoMantenimiento).toLocaleDateString("es-GT")}
              </span>
            </div>
            {camion.conductorAsignado && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conductor:</span>
                <span className="font-medium">{camion.conductorAsignado}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {camion.observaciones && (
              <div>
                <span className="text-muted-foreground">Observaciones:</span>
                <p className="font-medium mt-1">{camion.observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
