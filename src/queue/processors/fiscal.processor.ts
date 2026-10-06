import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';

@Processor('fiscal')
export class FiscalProcessor {
  @Process('submit-invoice')
  async submitInvoice(job: Job) {
    console.log(`🔄 Submitting invoice to EIMS: ${job.id}`);
    
    // Simulate government API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`✅ Invoice submitted: ${job.id}`);
    return { success: true, irn: `IRN-${Date.now()}` };
  }
}