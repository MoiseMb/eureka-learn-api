import { Module } from '@nestjs/common';
import { SubjectService } from './services/subject.service';
import { SubjectController } from './controllers/subject.controller';

@Module({
  providers: [SubjectService],
  controllers: [SubjectController]
})
export class SubjectModule {}
