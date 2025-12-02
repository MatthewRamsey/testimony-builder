import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createClient } from '@/lib/supabase/server'
import { AuthenticationError, AuthorizationError, NotFoundError } from '@/lib/errors'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const supabase = await createClient()

    // Check if user owns the gallery entry
    const { data: entry, error: fetchError } = await supabase
      .from('gallery_entries')
      .select('user_id, testimony_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !entry) {
      throw new NotFoundError('Gallery entry not found')
    }

    if (entry.user_id !== user.id) {
      throw new AuthorizationError('Not authorized to delete this gallery entry')
    }

    // Remove from gallery and make testimony private
    await supabase
      .from('testimonies')
      .update({ is_public: false })
      .eq('id', entry.testimony_id)

    const { error: deleteError } = await supabase
      .from('gallery_entries')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      throw new Error(`Failed to delete gallery entry: ${deleteError.message}`)
    }

    return NextResponse.json(null, { status: 204 })
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

    console.error('Error deleting gallery entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete gallery entry' },
      { status: 500 }
    )
  }
}

