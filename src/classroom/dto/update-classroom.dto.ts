import { PartialType } from '@nestjs/mapped-types';
import { CreateClassroomDto } from './create-classroom.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClassroomDto extends PartialType(CreateClassroomDto) {
    @ApiPropertyOptional({
        description: 'The name of the classroom (optional)',
        example: 'Math Class 101',
    })
    name?: string;

    @ApiPropertyOptional({
        description: 'The description of the classroom (optional)',
        example: 'A classroom for advanced math students',
    })
    description?: string;

    @ApiPropertyOptional({
        description: 'The ID of the teacher assigned to the classroom (optional)',
        example: 1,
    })
    teacherId?: number;
}