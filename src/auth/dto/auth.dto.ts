import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'The email address of the user',
        example: 'john.doe@example.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'password123',
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}

export class AuthResponseDto {
    @ApiProperty({
        description: 'The JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;

    @ApiProperty({
        description: 'The authenticated user details',
        type: 'object',
        properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'john.doe@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', example: 'USER' },
        },
    })
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}