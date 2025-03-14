import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { ListArgs } from 'src/lib/listArg';
import { Role } from '@prisma/client';

@Injectable()
export class SubjectService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateSubjectDto, userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (user.role !== Role.PROFESSOR) {
            throw new ForbiddenException('Only professors can create subjects');
        }

        return this.prisma.subject.create({
            data: {
                ...data,
                teacherId: userId
            },
            include: {
                teacher: true
            }
        });
    }

    async findAll(args: ListArgs = {}) {
        const { skip, take } = args;
        return this.prisma.subject.findMany({
            skip,
            take,
            include: {
                teacher: true,
                submissions: true
            }
        });
    }

    async findOne(id: number) {
        return this.prisma.subject.findUnique({
            where: { id },
            include: {
                teacher: true,
                submissions: true
            }
        });
    }

    async findByTeacher(teacherId: number) {
        return this.prisma.subject.findMany({
            where: {
                teacherId
            },
            include: {
                submissions: true
            }
        });
    }
}
