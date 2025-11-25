import { Worker } from 'bullmq';
import { connection } from '@repo/queue';
import { handleJob } from './handlers';

const worker = new Worker('djr:queue', async job => {
  return handleJob(job.data);
}, { connection });

worker.on('failed', (job, err) => console.error('failed', job?.id, err));
