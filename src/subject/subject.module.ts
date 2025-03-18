import { Module } from '@nestjs/common';
import { SubjectService } from './services/subject.service';
import { SubjectController } from './controllers/subject.controller';
import { PrismaService } from 'src/lib/prisma.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  providers: [SubjectService, PrismaService, UploadService],
  controllers: [SubjectController]
})
export class SubjectModule { }
