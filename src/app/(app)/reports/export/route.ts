import { NextResponse, type NextRequest } from "next/server"

import { getActiveMembership } from "@/lib/auth/dal"
import { exportCsv, exportPdf } from "@/features/reports/services"
import { isReportPeriod, resolveFilters, resolvePeriod, type ReportPeriod } from "@/features/reports/schemas"
import { logError } from "@/lib/logger"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  const membership = await getActiveMembership()
  if (!membership) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 })
  }

  if (!rateLimit(`reports-export:${membership.organizationId}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ message: "Muitas exportações. Tente novamente em alguns minutos." }, { status: 429 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const periodParam = searchParams.get("period") ?? undefined
    const period: ReportPeriod = isReportPeriod(periodParam) ? periodParam : "month"
    const range = resolvePeriod(
      period,
      searchParams.get("from") ?? undefined,
      searchParams.get("to") ?? undefined
    )
    const filters = resolveFilters({
      employeeId: searchParams.get("employeeId") ?? undefined,
      serviceId: searchParams.get("serviceId") ?? undefined,
    })

    const format = searchParams.get("format") === "pdf" ? "pdf" : "csv"

    if (format === "pdf") {
      const pdf = await exportPdf(membership.organizationId, range, filters)

      return new NextResponse(Buffer.from(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="relatorio-${period}.pdf"`,
        },
      })
    }

    const csv = await exportCsv(membership.organizationId, range, filters)
    const bom = String.fromCharCode(0xfeff)

    return new NextResponse(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="relatorio-${period}.csv"`,
      },
    })
  } catch (error) {
    logError("reports.export_failed", error, { organizationId: membership.organizationId })
    return NextResponse.json({ message: "Não foi possível gerar o relatório." }, { status: 500 })
  }
}
