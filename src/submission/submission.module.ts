import { Module } from '@nestjs/common';
import { SubmissionService } from './services/submission.service';
import { SubmissionController } from './controllers/submission.controller';
import { PrismaService } from 'src/lib/prisma.service';

@Module({
  providers: [SubmissionService, PrismaService],
  controllers: [SubmissionController]
})
export class SubmissionModule { }
