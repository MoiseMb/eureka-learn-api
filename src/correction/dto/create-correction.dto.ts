import { ApiProperty } from "@nestjs/swagger";

export class CreateCorrectionDto {
    @ApiProperty({
            type: Number,
            description: 'score ',
          })
    score?: number;
    @ApiProperty({
        type: String,
        description: 'notes',
      })
    notes?: string;
    @ApiProperty({
        type: Number,
        description: 'submission ID',
      })
    submissionId: number;
}
