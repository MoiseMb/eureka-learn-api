import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Request,
    Res,
    UseGuards,

} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Public } from './constants';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // @Public()
    // @HttpCode(HttpStatus.OK)
    // @Post('login')
    // async signIn(@Body() signInDto: Record<string, any>, @Res() res: Response) {
    //     const token = await this.authService.signIn(signInDto.username, signInDto.password);
    //     if (token) {
    //         return res.status(HttpStatus.CREATED).json(token.access_token);
    //     } else {
    //         return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Username or password is incorrect' })
    //     }

    // }
    @Public()
    @Get("google")
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }


    @Public()
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req() req) {
        return this.authService.googleLogin(req)
    }

    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
