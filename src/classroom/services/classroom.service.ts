import { Injectable } from '@nestjs/common';
import { CreateClassroomDto } from '../dto/create-classroom.dto';

import { Classroom } from '@prisma/client';
import { PaginatedResult } from 'src/common/types/pagination.type';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClassroomService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateClassroomDto) {
        return this.prisma.classroom.create({ data });
    }

    async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Classroom>> {
        const { page = 1, limit = 10, search, orderBy, order } = paginationDto;

        const where = search ? {
            OR: [
                { name: { contains: search } },
                { description: { contains: search } }
            ]
        } : {};

        const [total, classrooms] = await Promise.all([
            this.prisma.classroom.count({ where }),
            this.prisma.classroom.findMany({
                where,
                skip: (page - 1) * limit,
                take: +limit,
                orderBy: orderBy ? { [orderBy]: order } : { createdAt: 'desc' },
                include: { students: true }
            })
        ]);

        const lastPage = Math.ceil(total / limit);

        return {
            data: classrooms,
            meta: {
                total,
                page,
                lastPage
            }
        };
    }

    async findOne(id: number) {
        return this.prisma.classroom.findUnique({
            where: { id },
            include: {
                students: true
            }
        });
    }
}
