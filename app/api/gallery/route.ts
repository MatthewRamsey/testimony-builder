import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route-handler'
import { TestimonyService } from '@/domain/testimony/services/TestimonyService'
import { SupabaseTestimonyRepository } from '@/infrastructure/database/supabase/repositories/SupabaseTestimonyRepository'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get public testimonies directly using the repository
    const repository = new SupabaseTestimonyRepository()
    const service = new TestimonyService(repository)
    const testimonies = await service.findPublicEntries(page, limit)

    // Format response to match existing gallery structure
    // Display names can be added later if a profiles table is created
    const formatted = testimonies.map((testimony) => ({
      id: testimony.id,
      displayName: null, // Can be enhanced later with user profiles
      testimony: {
        id: testimony.id,
        title: testimony.title,
        framework_type: testimony.framework_type,
        content: testimony.content,
        is_public: testimony.is_public,
        created_at: testimony.created_at,
      },
      created_at: testimony.created_at,
    }))

    return NextResponse.json(formatted, { status: 200 })
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery entries' },
      { status: 500 }
    )
  }
}

