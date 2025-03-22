import { Submission, User, Subject, Correction, $Enums } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmissionDto implements Submission {
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
        type: () => User,
    })
    student?: User;

    @ApiPropertyOptional({
        description: 'The subject for which the submission was made',
        type: () => Subject,
    })
    subject?: Subject;

    @ApiPropertyOptional({
        description: 'The correction associated with the submission',
        type: Correction,
    })
    correction?: Correction;

    @ApiProperty({
        description: 'The type of the subject',
        enum: $Enums.SubjectType,
        example: $Enums.SubjectType.PDF,
    })
    type: $Enums.SubjectType;

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