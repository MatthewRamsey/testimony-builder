import { Testimony } from '@/domain/testimony/types'

export interface IExportProvider {
  generate(testimony: Testimony): Promise<Buffer>
}


