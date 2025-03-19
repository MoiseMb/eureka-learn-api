import { Module } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [AnalyticsService, PrismaService],
  controllers: [AnalyticsController]
})
export class AnalyticsModule { }
