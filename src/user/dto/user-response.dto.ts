import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({
        description: 'The ID of the user',
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'The first name of the user',
        example: 'John',
    })
    firstName: string;

    @ApiProperty({
        description: 'The last name of the user',
        example: 'Doe',
    })
    lastName: string;

    @ApiProperty({
        description: 'The email address of the user',
        example: 'john.doe@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'The role of the user',
        enum: Role,
        example: Role.STUDENT,
    })
    role: Role;

    @ApiProperty({
        description: 'The date and time when the user was created',
        example: '2023-10-01T12:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'The date and time when the user was last updated',
        example: '2023-10-01T12:00:00Z',
    })
    updatedAt: Date;

    @ApiPropertyOptional({
        description: 'The ID of the classroom the user belongs to (optional)',
        example: 1,
    })
    classroomId?: number;
}