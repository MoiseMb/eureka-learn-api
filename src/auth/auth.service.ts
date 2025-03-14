import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) { }

    // async signIn(username: string, password: string): Promise<{ access_token: string }> {
    //     const admin = await this.prisma.amdin.findUnique({ where: { username: username } });

    //     if (amdin) {
    //         if (doctor.password !== password) {
    //             throw new UnauthorizedException();
    //         }
    //         const payload = { id: doctor.id, role: doctor.role, fullName: `${doctor.firstname} ${doctor.lastname}` };
    //         return {
    //             access_token: await this.jwtService.signAsync(payload),
    //         };
    //     }

    //     const medicalAssistant = await this.prisma.medicalAssistant.findFirst({ where: { username } });

    //     if (medicalAssistant) {
    //         if (medicalAssistant.password !== password) {
    //             throw new UnauthorizedException();
    //         }
    //         const payload = { id: medicalAssistant.id, role: medicalAssistant.role, fullName: `${medicalAssistant.firstname} ${medicalAssistant.lastname}` };
    //         return {
    //             access_token: await this.jwtService.signAsync(payload),
    //         };
    //     }

    //     const admin = await this.prisma.admin.findFirst({ where: { username } });

    //     if (admin) {
    //         if (admin.password !== password) {
    //             throw new UnauthorizedException();
    //         }
    //         const payload = { id: admin.id, role: admin.role, fullName: `${admin.firstname} ${admin.lastname}` };
    //         return {
    //             access_token: await this.jwtService.signAsync(payload),
    //         };
    //     }

    //     return null;
    // }
    async adminLogin(username: string, password: string): Promise<{ access_token: string }> {
        const admin = await this.prisma.admin.findUnique({ where: { username: username } });

        if (admin) {
            if (admin.password !== password) {
                throw new UnauthorizedException();
            }
            const payload = { id: admin.id, fullName: `${admin.firstName} ${admin.lastName}` };
            return {
                access_token: await this.jwtService.signAsync(payload),
            };
        }

        return null;
    }

    googleLogin(req) {
        if (!req.user) {
            return 'No user from google'
        }

        return {
            message: 'User information from google',
            user: req.user
        }
    }
}
