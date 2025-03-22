import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'The first name of the user',
        example: 'John',
    })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({
        description: 'The last name of the user',
        example: 'Doe',
    })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({
        description: 'The email address of the user',
        example: 'john.doe@example.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'The password of the user (must be at least 6 characters long)',
        example: 'password123',
        minLength: 6,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({
        description: 'The role of the user',
        enum: Role,
        example: Role.STUDENT,
    })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiPropertyOptional({
        description: 'The ID of the classroom the user belongs to',
        example: 1,
    })
    @IsOptional()
    classroomId?: number;
}