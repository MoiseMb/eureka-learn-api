import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubmissionDto {
    @ApiProperty({
        description: 'The URL of the submitted file',
        example: 'https://example.com/file.pdf',
    })
    @IsNotEmpty()
    @IsString()
    fileUrl: string;

    @ApiProperty({
        description: 'The ID of the student submitting the file',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    studentId: number;

    @ApiProperty({
        description: 'The ID of the subject for which the file is submitted',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    subjectId: number;
}