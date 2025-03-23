import { IsNotEmpty, IsString, IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EvaluationType, SubjectType } from '.prisma/client'; // Correction de l'importation

export class CreateSubjectDto {
    @ApiPropertyOptional({
        description: 'The ID of the subject (auto-generated if not provided)',
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    id?: number;

    @ApiProperty({
        description: 'The title of the subject',
        example: 'Math Homework',
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiPropertyOptional({
        description: 'The description of the subject',
        example: 'Complete exercises 1 to 10',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'The URL of the subject file',
        example: 'https://example.com/file.pdf',
    })
    @IsNotEmpty()
    @IsString()
    fileUrl: string;

    @ApiPropertyOptional({
        description: 'The URL of the correction file (optional)',
        example: 'https://example.com/correction.pdf',
    })
    @IsOptional()
    @IsString()
    correctionFileUrl?: string;

    @ApiProperty({
        description: 'The start date of the subject',
        example: '2023-10-01T12:00:00Z',
    })
    @IsNotEmpty()
    @IsDate()
    startDate: Date;

    @ApiProperty({
        description: 'The end date of the subject',
        example: '2023-10-10T12:00:00Z',
    })
    @IsNotEmpty()
    @IsDate()
    endDate: Date;

    @ApiProperty({
        description: 'The evaluation type of the subject',
        enum: EvaluationType,
        example: EvaluationType.SQL,
    })
    @IsNotEmpty()
    @IsEnum(EvaluationType)
    evaluationType: EvaluationType;

    @ApiProperty({
        description: 'The type of the subject',
        enum: SubjectType,
        example: SubjectType.PDF,
    })
    @IsNotEmpty()
    @IsEnum(SubjectType)
    type: SubjectType;

    @ApiProperty({
        description: 'The ID of the classroom to which the subject belongs',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    classroomId: number;
}