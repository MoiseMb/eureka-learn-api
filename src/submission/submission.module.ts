import { Module } from '@nestjs/common';
import { SubmissionService } from './services/submission.service';
import { SubmissionController } from './controllers/submission.controller';
import { PrismaService } from 'src/lib/prisma.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  providers: [SubmissionService, PrismaService, UploadService],
  controllers: [SubmissionController]
})
export class SubmissionModule { }
