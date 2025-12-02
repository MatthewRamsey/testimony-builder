import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { TestimonyService } from '@/domain/testimony/services/TestimonyService'
import { SupabaseTestimonyRepository } from '@/infrastructure/database/supabase/repositories/SupabaseTestimonyRepository'
import { ExportService } from '@/infrastructure/export/ExportService'
import { PDFProvider } from '@/infrastructure/export/providers/PDFProvider'
import { AuthenticationError, AuthorizationError, NotFoundError, RateLimitError } from '@/lib/errors'
import { z } from 'zod'

const requestSchema = z.object({
  testimonyId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { testimonyId } = requestSchema.parse(body)

    // Get testimony and verify ownership
    const repository = new SupabaseTestimonyRepository()
    const service = new TestimonyService(repository)
    const testimony = await service.getById(user.id, testimonyId)

    // TODO: Implement rate limiting
    // const rateLimitResult = await rateLimiter.check(user.id, 'export')
    // if (!rateLimitResult.allowed) {
    //   throw new RateLimitError('Export rate limit exceeded')
    // }

    // Generate PDF
    const pdfProvider = new PDFProvider()
    const exportService = new ExportService(pdfProvider)
    const pdfBuffer = await exportService.exportToPDF(testimony)

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${testimony.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
      },
    })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error exporting PDF:', error)
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    )
  }
}

