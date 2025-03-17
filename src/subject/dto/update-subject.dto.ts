import { ApiProperty } from "@nestjs/swagger";

export class CreateSubjectDto {
    
    @ApiProperty({
        type: Number,
        description: 'identifiant du sujet',
      })
    id: number;

   
    @ApiProperty({
        type: String,
        description: 'Titre du sujet ',
      })
    title: string;
    
    @ApiProperty({
        type: String,
        description: 'description du sujet ',
      })
    description?: string;
    @ApiProperty({
        type: String,
        description: 'fichier contenant le sujet ',
      })
    fileUrl: string;
    @ApiProperty({
        type: Date,
        description: 'Date de debut de l epreuve',
      })
    startDate: Date;
    @ApiProperty({
        type: Date,
        description: 'Date de fin de l epreuve  ',
      })
    endDate: Date;
    @ApiProperty({
        type: Number,
        description: 'Description du sujet ',
      })
    teacherId: number;
}
