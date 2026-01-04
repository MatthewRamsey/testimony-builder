import { Testimony, CreateTestimonyDto, UpdateTestimonyDto } from '../types'

export interface ITestimonyRepository {
  create(data: CreateTestimonyDto & { user_id: string }): Promise<Testimony>
  findById(id: string): Promise<Testimony | null>
  findByUserId(userId: string): Promise<Testimony[]>
  update(id: string, data: UpdateTestimonyDto): Promise<Testimony>
  delete(id: string): Promise<void>
  findPublicEntries(page?: number, limit?: number): Promise<Testimony[]>
}


