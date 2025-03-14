import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { CreateCorrectionDto } from '../dto/create-correction.dto';
import { ListArgs } from 'src/lib/listArg';
import { Role } from '@prisma/client';

@Injectable()
export class CorrectionService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateCorrectionDto, professorId: number) {
        const professor = await this.prisma.user.findUnique({
            where: { id: professorId }
        });

        if (professor.role !== Role.PROFESSOR) {
            throw new ForbiddenException('Only professors can create corrections');
        }

        // Vérifier si le sujet appartient au professeur
        const submission = await this.prisma.submission.findUnique({
            where: { id: data.submissionId },
            include: { subject: true }
        });

        if (submission.subject.teacherId !== professorId) {
            throw new ForbiddenException('You can only correct submissions for your subjects');
        }

        return this.prisma.correction.create({
            data,
            include: {
                submission: {
                    include: {
                        student: true,
                        subject: true
                    }
                }
            }
        });
    }

    async findAll(args: ListArgs = {}) {
        const { skip, take } = args;
        return this.prisma.correction.findMany({
            skip,
            take,
            include: {
                submission: {
                    include: {
                        student: true,
                        subject: true
                    }
                }
            }
        });
    }

    async findOne(id: number) {
        return this.prisma.correction.findUnique({
            where: { id },
            include: {
                submission: {
                    include: {
                        student: true,
                        subject: true
                    }
                }
            }
        });
    }
}
