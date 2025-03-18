import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/types/pagination.type';
import { Classroom } from '@prisma/client';

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
                include: { students: true, teacher: true }
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

    async update(id: number, updateClassroomDto: UpdateClassroomDto) {
        const classroom = await this.prisma.classroom.findUnique({
            where: { id },
        });

        if (!classroom) {
            throw new NotFoundException(`Classroom with ID ${id} not found`);
        }

        return this.prisma.classroom.update({
            where: { id },
            data: updateClassroomDto,
            include: {
                teacher: true,
                students: true,
            },
        });
    }

    async remove(id: number) {
        const classroom = await this.prisma.classroom.findUnique({
            where: { id },
        });

        if (!classroom) {
            throw new NotFoundException(`Classroom with ID ${id} not found`);
        }

        return this.prisma.classroom.delete({
            where: { id },
            include: {
                teacher: true,
                students: true,
            },
        });
    }

    async findByTeacher(paginationDto: PaginationDto, teacherId: number): Promise<PaginatedResult<Classroom>> {
        const { page = 1, limit = 10, search, orderBy, order } = paginationDto;

        const where = {
            teacherId,
            ...(search ? {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ]
            } : {})
        };

        const [total, classrooms] = await Promise.all([
            this.prisma.classroom.count({ where }),
            this.prisma.classroom.findMany({
                where,
                skip: (page - 1) * limit,
                take: +limit,
                orderBy: orderBy ? { [orderBy]: order } : { createdAt: 'desc' },
                include: {
                    students: true,
                    teacher: true
                }
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
}
