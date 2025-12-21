"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Clock, Calculator, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PlanillasHomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Módulo de Planillas</h1>
          <p className="text-muted-foreground">Gestión de empleados, control de asistencia y administración de nómina.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/planillas/empleados">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empleados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestión de Personal</div>
              <p className="text-xs text-muted-foreground">Administrar información de empleados, contratos y datos personales.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/planillas/asistencias">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Control de Asistencia</div>
              <p className="text-xs text-muted-foreground">Registro de entradas/salidas, control de horas y ausencias.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/planillas/nominas">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nómina</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Cálculo de Salarios</div>
              <p className="text-xs text-muted-foreground">Generar nóminas, calcular deducciones y procesar pagos.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
