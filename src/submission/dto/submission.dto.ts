import { Submission, User, Subject, Correction, $Enums } from '@prisma/client';

export class SubmissionDto implements Submission {
    id: number;
    fileUrl: string;
    submittedAt: Date;
    studentId: number;
    subjectId: number;
    student?: User;
    subject?: Subject;
    correction?: Correction;
    type: $Enums.SubjectType;
    isCorrecting: boolean;
    isCorrected: boolean;
} 