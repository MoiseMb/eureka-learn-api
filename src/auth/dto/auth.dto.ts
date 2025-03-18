import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({
        type: String,
        description: 'authentication email',
          })
    email: string;
    @ApiProperty({
        type: String,
        description: 'authentication password',
      })

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class AuthResponseDto {
    access_token: string;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
} 