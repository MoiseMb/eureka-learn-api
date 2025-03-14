import { Module } from '@nestjs/common';
import { CorrectionService } from './services/correction.service';
import { CorrectionController } from './controllers/correction.controller';

@Module({
  providers: [CorrectionService],
  controllers: [CorrectionController]
})
export class CorrectionModule {}
