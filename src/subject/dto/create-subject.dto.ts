export class CreateSubjectDto {
    title: string;
    description?: string;
    fileUrl: string;
    startDate: Date;
    endDate: Date;
    teacherId: number;
}
