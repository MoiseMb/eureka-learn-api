import { Module } from '@nestjs/common';
import { SubjectService } from './services/subject.service';
import { SubjectController } from './controllers/subject.controller';
import { PrismaService } from 'src/lib/prisma.service';

@Module({
  providers: [SubjectService, PrismaService],
  controllers: [SubjectController]
})
export class SubjectModule { }
