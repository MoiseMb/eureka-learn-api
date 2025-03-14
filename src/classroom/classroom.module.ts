import { Module } from '@nestjs/common';
import { ClassroomService } from './services/classroom.service';
import { ClassroomController } from './controllers/classroom.controller';
import { PrismaService } from 'src/lib/prisma.service';

@Module({
  providers: [ClassroomService, PrismaService],
  controllers: [ClassroomController]
})
export class ClassroomModule { }
