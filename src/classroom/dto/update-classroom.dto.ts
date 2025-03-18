import { ApiProperty } from "@nestjs/swagger";

export class UpdateClassroomDto {
    @ApiProperty({
        type: Number,
        description: 'classroom identifiant',
          })
    id: number;
    @ApiProperty({
            type: String,
            description: 'classroom name',
              })
    name: string;
    @ApiProperty({
        type: String,
        description: 'classroom description',
      })
    description?: string;
}
