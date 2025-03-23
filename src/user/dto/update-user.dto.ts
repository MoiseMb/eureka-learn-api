import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Role } from '@prisma/client';  // Correction de la casse ici

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: 'The ID of the user',
        example: 1,
    })
    @IsNumber()
    id: number;

    @ApiPropertyOptional({
        description: 'The first name of the user',
        example: 'John',
    })
    firstName?: string;

    @ApiPropertyOptional({
        description: 'The last name of the user',
        example: 'Doe',
    })
    lastName?: string;

    @ApiPropertyOptional({
        description: 'The email address of the user',
        example: 'john.doe@example.com',
    })
    email?: string;

    @ApiPropertyOptional({
        description: 'The password of the user (must be at least 6 characters long)',
        example: 'password123',
        minLength: 6,
    })
    password?: string;

    @ApiPropertyOptional({
        description: 'The role of the user',
        enum: Role,
        example: Role.STUDENT,
    })
    role?: Role;

    @ApiPropertyOptional({
        description: 'The ID of the classroom the user belongs to',
        example: 1,
    })
    classroomId?: number;
} import { PrismaClient } from '@prisma/client';

