import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { Role, Subject } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/types/pagination.type';


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

    async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Subject>> {
        const { page = 1, limit = 10, search, orderBy, order } = paginationDto;

        const where = search ? {
            OR: [
                { title: { contains: search } },
                { description: { contains: search } }
            ]
        } : {};

        const [total, subjects] = await Promise.all([
            this.prisma.subject.count({ where }),
            this.prisma.subject.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: orderBy ? { [orderBy]: order } : { createdAt: 'desc' },
                include: {
                    teacher: true,
                    submissions: {
                        include: {
                            student: true,
                            correction: true
                        }
                    }
                }
            })
        ]);

        const lastPage = Math.ceil(total / limit);

        return {
            data: subjects,
            meta: {
                total,
                page,
                lastPage
            }
        };
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
