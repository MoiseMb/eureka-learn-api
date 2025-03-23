import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubjectType } from '@prisma/client';


export class UserDto {
    @ApiProperty({ description: "User ID", example: 1 })
    id: number;
}

export class SubjectDto {
    @ApiProperty({ description: "Subject ID", example: 1 })
    id: number;
}

export class CorrectionDto {
    @ApiProperty({ description: "Correction ID", example: 1 })
    id: number;
}

export class SubmissionDto {
    @ApiProperty({
        description: 'The ID of the submission',
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'The URL of the submitted file',
        example: 'https://example.com/file.pdf',
    })
    fileUrl: string;

    @ApiProperty({
        description: 'The date and time when the submission was made',
        example: '2023-10-01T12:00:00Z',
    })
    submittedAt: Date;

    @ApiProperty({
        description: 'The ID of the student who made the submission',
        example: 1,
    })
    studentId: number;

    @ApiProperty({
        description: 'The ID of the subject for which the submission was made',
        example: 1,
    })
    subjectId: number;

    @ApiPropertyOptional({
        description: 'The student who made the submission',
        type: () => UserDto,
    })
    student?: UserDto;

    @ApiPropertyOptional({
        description: 'The subject for which the submission was made',
        type: () => SubjectDto,
    })
    subject?: SubjectDto;

    @ApiPropertyOptional({
        description: 'The correction associated with the submission',
        type: () => CorrectionDto,
    })
    correction?: CorrectionDto;

    @ApiProperty({
        description: 'The type of the subject',
        enum: SubjectType,
        example: SubjectType.PDF,
    })
    type: SubjectType;

    @ApiProperty({
        description: 'Indicates if the submission is currently being corrected',
        example: false,
    })
    isCorrecting: boolean;

    @ApiProperty({
        description: 'Indicates if the submission has been corrected',
        example: false,
    })
    isCorrected: boolean;
}
