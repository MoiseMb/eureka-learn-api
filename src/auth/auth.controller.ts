import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './constants';
import { AuthResponseDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }


    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
