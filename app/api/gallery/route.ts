import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route-handler'
import { Testimony } from '@/domain/testimony/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(request)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Get public gallery entries with testimonies
    const { data: entries, error } = await supabase
      .from('gallery_entries')
      .select(`
        id,
        display_name,
        created_at,
        testimonies (
          id,
          title,
          framework_type,
          content,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw new Error(`Failed to fetch gallery entries: ${error.message}`)
    }

    const formatted = (entries || []).map((entry: any) => ({
      id: entry.id,
      displayName: entry.display_name,
      testimony: entry.testimonies ? {
        id: entry.testimonies.id,
        title: entry.testimonies.title,
        framework_type: entry.testimonies.framework_type,
        content: entry.testimonies.content,
        created_at: entry.testimonies.created_at,
      } : null,
      created_at: entry.created_at,
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

