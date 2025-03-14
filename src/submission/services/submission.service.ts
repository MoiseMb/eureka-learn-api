import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { ListArgs } from 'src/lib/listArg';
import { Role } from '@prisma/client';

@Injectable()
export class SubmissionService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateSubmissionDto, studentId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: studentId }
        });

        if (user.role !== Role.STUDENT) {
            throw new ForbiddenException('Only students can submit assignments');
        }

        return this.prisma.submission.create({
            data: {
                ...data,
                studentId
            },
            include: {
                student: true,
                subject: true
            }
        });
    }

    async findAll(args: ListArgs = {}) {
        const { skip, take } = args;
        return this.prisma.submission.findMany({
            skip,
            take,
            include: {
                student: true,
                subject: true,
                correction: true
            }
        });
    }

    async findOne(id: number) {
        return this.prisma.submission.findUnique({
            where: { id },
            include: {
                student: true,
                subject: true,
                correction: true
            }
        });
    }

    async findMySubmissions(studentId: number) {
        return this.prisma.submission.findMany({
            where: {
                studentId
            },
            include: {
                subject: true,
                correction: true
            }
        });
    }
}
