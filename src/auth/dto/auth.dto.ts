import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class AuthResponseDto {
    accessToken: string;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
} 