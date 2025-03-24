import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubmissionDto {
    @ApiProperty({
        description: 'The URL of the submitted file',
        example: 'https://example.com/file.pdf',
    })
    fileUrl?: string;

    @ApiProperty({
        description: 'The ID of the student submitting the file',
        example: 1,
    })
    studentId?: number;

    @ApiProperty({
        description: 'The ID of the subject for which the file is submitted',
        example: 1,
    })
    subjectId: string;
}