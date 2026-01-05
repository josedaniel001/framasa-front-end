import { NextRequest, NextResponse } from "next/server";
import { extractTokenFromHeader } from "@/lib/verify-token-django";
import { getDjangoApiUrl } from "@/lib/api-config";

const DJANGO_METRICS_PATH = "/api/reportes/dashboard_metrics/";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [Dashboard Metrics] Iniciando petición");

    // 1) Extraer Bearer token del request que viene del frontend
    const authHeader =
      request.headers.get("authorization") || request.headers.get("Authorization");

    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      console.error("❌ [Dashboard Metrics] Token de autorización no encontrado");
      return NextResponse.json(
        { error: "Token de autorización requerido" },
        { status: 401 }
      );
    }

    // 2) URL del backend Django para server-side (dentro del contenedor)
    // Para tu compose actual (solo frontend), esto debe resolver a host.docker.internal
    const DJANGO_API_BASE = getDjangoApiUrl().replace(/\/+$/, "");
    const djangoUrl = `${DJANGO_API_BASE}${DJANGO_METRICS_PATH}`;

    console.log("🔍 [Dashboard Metrics] URL de Django:", djangoUrl);
    console.log("🔍 [Dashboard Metrics] Env:", {
      DJANGO_API_URL: process.env.DJANGO_API_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      resolved: DJANGO_API_BASE,
    });

    // 3) Fetch directo al endpoint protegido (sin verify previo)
    const djangoResponse = await fetch(djangoUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const contentType = djangoResponse.headers.get("content-type") || "";
    const rawBody = await djangoResponse.text();

    console.log("🔍 [Dashboard Metrics] Respuesta de Django:", {
      status: djangoResponse.status,
      statusText: djangoResponse.statusText,
      ok: djangoResponse.ok,
      contentType,
    });

    if (!djangoResponse.ok) {
      let errorData: any = {};
      if (contentType.includes("application/json")) {
        try {
          errorData = JSON.parse(rawBody);
        } catch {
          errorData = { raw: rawBody.substring(0, 500) };
        }
      } else {
        errorData = { raw: rawBody.substring(0, 500) };
      }

      let errorMessage = "Error al obtener métricas del dashboard";
      if (errorData?.detail) errorMessage = errorData.detail;
      else if (errorData?.error) errorMessage = errorData.error;
      else if (errorData?.message) errorMessage = errorData.message;
      else if (typeof errorData === "string") errorMessage = errorData;
      else if (errorData?.raw?.includes?.("DisallowedHost")) {
        errorMessage =
          "Error de configuración: Django no acepta el host de la petición (ALLOWED_HOSTS)";
      }

      console.error("❌ [Dashboard Metrics] Error desde Django:", {
        status: djangoResponse.status,
        statusText: djangoResponse.statusText,
        errorMessage,
        url: djangoUrl,
        token_preview: token.substring(0, 20) + "...",
        errorData,
      });

      return NextResponse.json(
        {
          error: errorMessage,
          status: djangoResponse.status,
          details:
            process.env.NODE_ENV === "development"
              ? { djangoUrl, errorData }
              : undefined,
        },
        { status: djangoResponse.status }
      );
    }

    // OK
    if (contentType.includes("application/json")) {
      try {
        const data = JSON.parse(rawBody);
        console.log("✅ [Dashboard Metrics] Métricas obtenidas exitosamente");
        return NextResponse.json(data, {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        });
      } catch {
        console.warn(
          "⚠️ [Dashboard Metrics] Django devolvió JSON inválido, retornando texto."
        );
      }
    }

    return new NextResponse(rawBody, {
      status: 200,
      headers: {
        "Content-Type": contentType || "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("❌ [Dashboard Metrics] Error interno en route.ts:", {
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error?.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}
