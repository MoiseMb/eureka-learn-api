import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './constants';
import { AuthResponseDto, LoginDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiOperation({ summary: 'Login to the system' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'User logged in successfully.', type: AuthResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials.' })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get the profile of the authenticated user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Profile retrieved successfully.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    getProfile(@Request() req) {
        return req.user;
    }
}