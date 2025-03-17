import { ApiProperty } from '@nestjs/swagger';
import { Submission, User, Subject, Correction } from '@prisma/client';

export class SubmissionDto implements Submission {
    @ApiProperty({
        type: Number,
        description: 'classroom id',
          })
    id: number;
    @ApiProperty({
        type: String,
        description: 'fichier ',
      })
    fileUrl: string;
    @ApiProperty({
        type: Date,
        description: 'submit date',
      })
    submittedAt: Date;
    @ApiProperty({
        type: Number,
        description: "identifiant de l'etudiant",
      })
    studentId: number;
    @ApiProperty({
        type: Number,
        description: 'subject id',
      })
    subjectId: number;
    @ApiProperty({
        type: Enumerator,
        description: 'student',
      })
    student?: User;
    @ApiProperty({
        type: Enumerator,
        description: 'subject',
      })
    subject?: Subject;
    @ApiProperty({
        type: Enumerator,
        description: 'correction',
      })
    correction?: Correction;
} 