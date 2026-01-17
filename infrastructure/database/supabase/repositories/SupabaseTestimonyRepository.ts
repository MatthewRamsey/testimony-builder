import { ITestimonyRepository } from '@/domain/testimony/repositories/ITestimonyRepository'
import { Testimony, PublicTestimony, CreateTestimonyDto, UpdateTestimonyDto } from '@/domain/testimony/types'
import { createClient } from '@/lib/supabase/server'

export class SupabaseTestimonyRepository implements ITestimonyRepository {
  async create(data: CreateTestimonyDto & { user_id: string; share_token?: string }): Promise<Testimony> {
    const supabase = await createClient()

    const { data: testimony, error } = await supabase
      .from('testimonies')
      .insert({
        user_id: data.user_id,
        title: data.title,
        framework_type: data.framework_type,
        content: data.content,
        share_token: data.share_token,
        is_public: data.is_public ?? false,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create testimony: ${error.message}`)
    }

    return this.mapToTestimony(testimony)
  }

  async findById(id: string): Promise<Testimony | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('testimonies')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find testimony: ${error.message}`)
    }

    return data ? this.mapToTestimony(data) : null
  }

  async findByUserId(userId: string): Promise<Testimony[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('testimonies')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to find testimonies: ${error.message}`)
    }

    return (data || []).map(this.mapToTestimony)
  }

  async findByShareToken(token: string): Promise<Testimony | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('testimonies')
      .select()
      .eq('share_token', token)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find testimony by share token: ${error.message}`)
    }

    return data ? this.mapToTestimony(data) : null
  }

  async findPublicByShareToken(token: string): Promise<PublicTestimony | null> {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc(
      'get_public_testimony_by_share_token',
      { share_token: token }
    )

    if (error) {
      throw new Error(`Failed to find public testimony by share token: ${error.message}`)
    }

    const row = Array.isArray(data) ? data[0] : data
    if (!row) {
      return null
    }

    return {
      id: row.id,
      title: row.title,
      framework_type: row.framework_type,
      content: row.content,
      is_public: row.is_public,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }
  }

  async update(id: string, data: UpdateTestimonyDto): Promise<Testimony> {
    const supabase = await createClient()
    
    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) updateData.content = data.content
    if (data.is_public !== undefined) updateData.is_public = data.is_public

    const { data: testimony, error } = await supabase
      .from('testimonies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update testimony: ${error.message}`)
    }

    return this.mapToTestimony(testimony)
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('testimonies')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete testimony: ${error.message}`)
    }
  }

  async findPublicEntries(page: number = 1, limit: number = 20): Promise<Testimony[]> {
    const supabase = await createClient()
    
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error } = await supabase
      .from('testimonies')
      .select()
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw new Error(`Failed to find public testimonies: ${error.message}`)
    }

    return (data || []).map(this.mapToTestimony)
  }

  private mapToTestimony(data: any): Testimony {
    return {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      framework_type: data.framework_type,
      content: data.content,
      is_public: data.is_public,
      share_token: data.share_token,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    }
  }
}

