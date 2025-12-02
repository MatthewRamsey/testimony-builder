import { ITestimonyRepository } from '@/domain/testimony/repositories/ITestimonyRepository'
import { Testimony, CreateTestimonyDto, UpdateTestimonyDto } from '@/domain/testimony/types'
import { createClient } from '@/lib/supabase/server'

export class SupabaseTestimonyRepository implements ITestimonyRepository {
  async create(data: CreateTestimonyDto & { user_id: string }): Promise<Testimony> {
    const supabase = await createClient()
    
    const { data: testimony, error } = await supabase
      .from('testimonies')
      .insert({
        user_id: data.user_id,
        title: data.title,
        framework_type: data.framework_type,
        content: data.content,
        is_public: false,
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
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    }
  }
}

