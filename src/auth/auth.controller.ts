import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Public } from './constants';
import { AuthGuard } from '@nestjs/passport';
import { AuthResponseDto, LoginDto } from './dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user')
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
