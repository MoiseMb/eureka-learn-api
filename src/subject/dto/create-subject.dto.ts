import { IsNotEmpty, IsString, IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EvaluationType, SubjectType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectDto {
    @ApiProperty({
        description: 'The title of the subject',
        example: 'Math Homework',
    })
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({
        description: 'The description of the subject',
        example: 'Complete exercises 1 to 10',
    })
    description?: string;


    @ApiPropertyOptional({
        description: 'The URL of the correction file (optional)',
        example: 'https://example.com/correction.pdf',
    })
    @IsOptional()
    correctionFileUrl?: string;

    @ApiProperty({
        description: 'The start date of the subject',
        example: '2023-10-01T12:00:00Z',
    })
    @IsNotEmpty()
    startDate: Date;

    @ApiProperty({
        description: 'The end date of the subject',
        example: '2023-10-10T12:00:00Z',
    })
    @IsNotEmpty()
    endDate: Date;

    @ApiProperty({
        description: 'The evaluation type of the subject',
        enum: EvaluationType,
        example: EvaluationType.POO_JAVA,
    })
    @IsNotEmpty()
    @IsEnum(EvaluationType)
    evaluationType: EvaluationType;

    @ApiProperty({
        description: 'The type of the subject',
        enum: SubjectType,
        example: SubjectType.TEXT,
    })
    @IsNotEmpty()
    @IsEnum(SubjectType)
    type: SubjectType;

    @ApiProperty({
        description: 'The ID of the classroom to which the subject belongs',
        example: 1,
    })
    @IsNotEmpty()
    classroomId: number;
}