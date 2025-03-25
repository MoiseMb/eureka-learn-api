import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateCorrectionDto {
    @ApiProperty({ description: 'The score of the correction', required: false })
    @IsNumber()
    @IsOptional()
    score?: number;

    @ApiProperty({ description: 'Notes for the correction', required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}