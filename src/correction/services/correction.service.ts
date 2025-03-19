import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateCorrectionDto } from '../dto/create-correction.dto';
import { ListArgs } from 'src/lib/listArg';
import { Correction, Role } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/types/pagination.type';
import { PrismaService } from 'src/prisma/prisma.service';

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

        const submission = await this.prisma.submission.findUnique({
            where: { id: data.submissionId },
            include: { subject: true }
        });

        if (!submission) {
            throw new ForbiddenException('Submission not found');
        }

        if (submission.subject.teacherId !== professorId) {
            throw new ForbiddenException('You can only correct submissions for your subjects');
        }

        return this.prisma.correction.create({
            data: {
                ...data,
                evaluationType: submission.subject.evaluationType
            },
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

    async findUserCorrections(userId: number, paginationDto: PaginationDto): Promise<PaginatedResult<Correction>> {
        const { page = 1, limit = 10, orderBy, order } = paginationDto;

        const where = {
            submission: {
                studentId: userId,
                isCorrected: true
            }
        };

        const [total, corrections] = await Promise.all([
            this.prisma.correction.count({ where }),
            this.prisma.correction.findMany({
                where,
                skip: (page - 1) * limit,
                take: +limit,
                orderBy: orderBy ? { [orderBy]: order } : { correctedAt: 'desc' },
                include: {
                    submission: {
                        include: {
                            subject: true,
                            student: true
                        }
                    }
                }
            })
        ]);

        const lastPage = Math.ceil(total / limit);

        return {
            data: corrections,
            meta: {
                total,
                page,
                lastPage
            }
        };
    }
}
