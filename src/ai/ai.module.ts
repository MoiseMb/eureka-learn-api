import { Module } from '@nestjs/common';
import { DeepseekService } from './deepseek.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
    providers: [DeepseekService, PrismaService, UploadService],
})
export class AiModule { }