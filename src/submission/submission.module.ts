import { Module } from '@nestjs/common';
import { SubmissionService } from './services/submission.service';
import { SubmissionController } from './controllers/submission.controller';

@Module({
  providers: [SubmissionService],
  controllers: [SubmissionController]
})
export class SubmissionModule {}
