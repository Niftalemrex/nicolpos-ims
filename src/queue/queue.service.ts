import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue, Job } from 'bull';

@Injectable()
export class QueueService {
  private readonly logger = new Logger('QueueService');

  constructor(
    @InjectQueue('sales') private salesQueue: Queue,
    @InjectQueue('fiscal') private fiscalQueue: Queue,
    @InjectQueue('sync') private syncQueue: Queue,
  ) {}

  async addSaleToQueue(saleData: any) {
    const job = await this.salesQueue.add('process-sale', saleData, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    });
    this.logger.log(`Sale job added: ${job.id}`);
    return job;
  }

  async addFiscalSubmission(invoiceData: any) {
    const job = await this.fiscalQueue.add('submit-invoice', invoiceData, {
      attempts: 10,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 50,
      removeOnFail: 200,
    });
    this.logger.log(`Fiscal job added: ${job.id}`);
    return job;
  }

  async addSyncItem(syncData: any) {
    const job = await this.syncQueue.add('sync-item', syncData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    });
    this.logger.log(`Sync job added: ${job.id}`);
    return job;
  }

  async getQueueStats() {
    const [salesCount, fiscalCount, syncCount, salesWaiting, fiscalWaiting, syncWaiting] = await Promise.all([
      this.salesQueue.getJobCounts(),
      this.fiscalQueue.getJobCounts(),
      this.syncQueue.getJobCounts(),
      this.salesQueue.getWaitingCount(),
      this.fiscalQueue.getWaitingCount(),
      this.syncQueue.getWaitingCount(),
    ]);

    return {
      sales: { ...salesCount, waiting: salesWaiting },
      fiscal: { ...fiscalCount, waiting: fiscalWaiting },
      sync: { ...syncCount, waiting: syncWaiting },
      timestamp: new Date().toISOString(),
    };
  }

  async getFailedJobs() {
    const [salesFailed, fiscalFailed, syncFailed] = await Promise.all([
      this.salesQueue.getFailed(),
      this.fiscalQueue.getFailed(),
      this.syncQueue.getFailed(),
    ]);

    return {
      sales: salesFailed.map(j => ({ id: j.id, failedReason: j.failedReason, attempts: j.attemptsMade })),
      fiscal: fiscalFailed.map(j => ({ id: j.id, failedReason: j.failedReason, attempts: j.attemptsMade })),
      sync: syncFailed.map(j => ({ id: j.id, failedReason: j.failedReason, attempts: j.attemptsMade })),
    };
  }

  async retryFailedJobs(queueName: string) {
    const queue = this.getQueueByName(queueName);
    const failedJobs = await queue.getFailed();
    
    for (const job of failedJobs) {
      await job.retry();
    }

    return { message: `Retried ${failedJobs.length} failed jobs in ${queueName} queue` };
  }

  async pauseQueue(queueName: string) {
    const queue = this.getQueueByName(queueName);
    await queue.pause();
    return { message: `Paused ${queueName} queue` };
  }

  async resumeQueue(queueName: string) {
    const queue = this.getQueueByName(queueName);
    await queue.resume();
    return { message: `Resumed ${queueName} queue` };
  }

  private getQueueByName(name: string): Queue {
    switch (name) {
      case 'sales': return this.salesQueue;
      case 'fiscal': return this.fiscalQueue;
      case 'sync': return this.syncQueue;
      default: throw new Error(`Unknown queue: ${name}`);
    }
  }
}