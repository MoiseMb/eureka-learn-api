import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, AuthResponseDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('admin/login')
    @ApiOperation({ summary: 'Login for admin users only' })
    @ApiResponse({ status: 200, description: 'Admin logged in successfully', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials or not an admin' })
    async loginAdmin(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.loginAdmin(loginDto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('student-professor/login')
    @ApiOperation({ summary: 'Login for students and admin users' })
    @ApiResponse({ status: 200, description: 'User logged in successfully', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials or invalid role' })
    async loginStudentOrAdmin(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.loginStudentOrProfessor(loginDto);
    }
}