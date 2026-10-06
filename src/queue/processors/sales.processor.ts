import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';

@Processor('sales')
export class SalesProcessor {
  @Process('process-sale')
  async processSale(job: Job) {
    console.log(`🔄 Processing sale job: ${job.id}`);
    console.log('Sale data:', JSON.stringify(job.data));
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Sale processed: ${job.id}`);
    return { success: true, jobId: job.id };
  }
}