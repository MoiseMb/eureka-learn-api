import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/services/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, AuthResponseDto } from './dto/auth.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService
    ) { }

    async loginAdmin(loginDto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.userService.findByEmail(loginDto.email);

        if (!user || user.role !== Role.ADMIN) {
            throw new UnauthorizedException('Access denied. Admin only.');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        return {
            accessToken: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        };
    }

    async loginStudentOrProfessor(loginDto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.userService.findByEmail(loginDto.email);

        if (!user || user.role === Role.ADMIN) {
            throw new UnauthorizedException('Access denied. Student or professor only.');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        return {
            accessToken: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        };
    }
}
