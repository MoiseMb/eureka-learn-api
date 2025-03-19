import { Module } from '@nestjs/common';
import { CorrectionService } from './services/correction.service';
import { CorrectionController } from './controllers/correction.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [CorrectionService, PrismaService],
  controllers: [CorrectionController]
})
export class CorrectionModule { }
