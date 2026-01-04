import { IExportProvider } from './interfaces/IExportProvider'
import { Testimony } from '@/domain/testimony/types'

export class ExportService {
  constructor(private provider: IExportProvider) {}

  async exportToPDF(testimony: Testimony): Promise<Buffer> {
    return this.provider.generate(testimony)
  }
}


