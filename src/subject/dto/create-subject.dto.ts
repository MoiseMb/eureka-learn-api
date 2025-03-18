import { IsNotEmpty, IsString, IsDate, IsEnum, IsNumber } from 'class-validator';
import { EvaluationType } from '@prisma/client';

export class CreateSubjectDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString()
    fileUrl: string;

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
    @IsNumber()
    classroomId: number;
}
