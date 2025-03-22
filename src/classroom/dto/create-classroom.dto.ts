import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassroomDto {
    @ApiProperty({
        description: 'The name of the classroom',
        example: 'Math Class 101',
    })
    name: string;

    @ApiPropertyOptional({
        description: 'The description of the classroom (optional)',
        example: 'A classroom for advanced math students',
    })
    description?: string;
}