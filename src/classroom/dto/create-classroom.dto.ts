import { ApiProperty } from "@nestjs/swagger";

export class CreateClassroomDto {
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
