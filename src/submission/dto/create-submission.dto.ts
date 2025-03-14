import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSubmissionDto {
    @IsNotEmpty()
    @IsString()
    fileUrl: string;

    @IsNotEmpty()
    @IsNumber()
    studentId: number;

    @IsNotEmpty()
    @IsNumber()
    subjectId: number;
}
