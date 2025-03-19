import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { ClassroomModule } from './classroom/classroom.module';
import { UserModule } from './user/user.module';
import { SubjectModule } from './subject/subject.module';
import { SubmissionModule } from './submission/submission.module';
import { CorrectionModule } from './correction/correction.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ClassroomModule,
    UserModule,
    SubjectModule,
    SubmissionModule,
    CorrectionModule,
    AnalyticsModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule { }
