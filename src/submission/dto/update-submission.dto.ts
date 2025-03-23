import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmissionDto } from './create-submission.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {
    @ApiPropertyOptional({
        description: 'The URL of the submitted file',
        example: 'https://example.com/file.pdf',
    })
    fileUrl?: string;

    @ApiPropertyOptional({
        description: 'The ID of the student submitting the file',
        example: 1,
    })
    studentId?: number;

    @ApiPropertyOptional({
        description: 'The ID of the subject for which the file is submitted',
        example: 1,
    })
    subjectId?: number;
}