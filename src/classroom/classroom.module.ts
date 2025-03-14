import { Module } from '@nestjs/common';
import { ClassroomService } from './services/classroom.service';
import { ClassroomController } from './controllers/classroom.controller';

@Module({
  providers: [ClassroomService],
  controllers: [ClassroomController]
})
export class ClassroomModule {}
