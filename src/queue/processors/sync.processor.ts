import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';

@Processor('sync')
export class SyncProcessor {
  @Process('sync-item')
  async syncItem(job: Job) {
    console.log(`🔄 Syncing item: ${job.id}`);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ Item synced: ${job.id}`);
    return { success: true, jobId: job.id };
  }
}