import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateCorrectionDto {
    @ApiProperty({
        type: Number,
        description: 'The unique identifier of the correction',
        example: 1,
    })
    id: number;

    @ApiPropertyOptional({
        type: Number,
        description: 'The score assigned to the correction (optional)',
        example: 85,
    })
    score?: number;

    @ApiPropertyOptional({
        type: String,
        description: 'Additional notes or comments for the correction (optional)',
        example: 'Good effort, but needs improvement in section 3.',
    })
    notes?: string;

    @ApiProperty({
        type: Number,
        description: 'The ID of the submission associated with this correction',
        example: 1,
    })
    submissionId: number;
}