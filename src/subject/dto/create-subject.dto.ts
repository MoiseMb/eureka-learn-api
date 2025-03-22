import { IsNotEmpty, IsString, IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EvaluationType, SubjectType } from '@prisma/client';

export class CreateSubjectDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString()
    fileUrl: string;

    @IsOptional()
    @IsString()
    correctionFileUrl?: string;

    @IsNotEmpty()
    @IsDate()
    startDate: Date;

    @IsNotEmpty()
    @IsDate()
    endDate: Date;

    @IsNotEmpty()
    @IsEnum(EvaluationType)
    evaluationType: EvaluationType;

    @IsNotEmpty()
    @IsEnum(SubjectType)
    type: SubjectType;

    @IsNotEmpty()
    @IsNumber()
    classroomId: number;
}
