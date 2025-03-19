import { Injectable, ForbiddenException, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UploadService } from 'src/upload/upload.service';
import { Role, Subject } from '@prisma/client';
import { Multer } from 'multer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/types/pagination.type';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubjectService {
    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService
    ) { }

    async create(data: CreateSubjectDto, file: Multer.File, userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (user.role !== Role.PROFESSOR) {
            throw new ForbiddenException('Only professors can create subjects');
        }

        try {
            const uploadResult = await this.uploadService.uploadImage(file, 'subjects');

            const subject = await this.prisma.subject.create({
                data: {
                    ...data,
                    classroomId: Number(data.classroomId),
                    fileUrl: uploadResult.url,
                    teacherId: userId
                },
                include: {
                    teacher: true,
                    classroom: true
                }
            });

            return subject;

        } catch (error) {
            if (error.url) {
                await this.uploadService.deleteImage(error.url);
            }

            if (error.message.includes('Invalid value provided')) {
                throw new BadRequestException('Invalid classroom ID provided');
            }

            throw new InternalServerErrorException('Failed to create subject: ' + error.message);
        }
    }

    async findAll(paginationDto: PaginationDto, userId: number): Promise<PaginatedResult<Subject>> {
        const { page = 1, limit = 10, search, orderBy, order } = paginationDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        const where = {
            ...(search ? {
                OR: [
                    { title: { contains: search } },
                    { description: { contains: search } }
                ]
            } : {}),
            ...(user.role === Role.STUDENT ? {
                classroom: {
                    students: {
                        some: { id: userId }
                    }
                }
            } : {
                OR: [
                    { teacherId: userId },
                    {
                        classroom: {
                            teacherId: userId
                        }
                    }
                ]
            })
        };

        const [total, subjects] = await Promise.all([
            this.prisma.subject.count({ where }),
            this.prisma.subject.findMany({
                where,
                skip: (page - 1) * limit,
                take: +limit,
                orderBy: orderBy ? { [orderBy]: order } : { createdAt: 'desc' },
                include: {
                    teacher: true,
                    classroom: true,
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
        const subject = await this.prisma.subject.findUnique({
            where: { id },
            include: {
                teacher: true,
                classroom: true,
                submissions: {
                    include: {
                        student: true,
                        correction: true
                    }
                }
            }
        });

        if (!subject) {
            throw new NotFoundException(`Subject with ID ${id} not found or access denied`);
        }

        return subject;
    }

    async findByTeacher(teacherId: number) {
        return this.prisma.subject.findMany({
            where: {
                teacherId
            },
            include: {
                teacher: true,
                classroom: true,
                submissions: {
                    include: {
                        student: true,
                        correction: true
                    }
                }
            }
        });
    }

    async update(id: number, data: Partial<CreateSubjectDto>, teacherId: number) {
        const subject = await this.findOne(id);

        if (subject.teacherId !== teacherId) {
            throw new ForbiddenException('You can only update your own subjects');
        }

        return this.prisma.subject.update({
            where: { id },
            data,
            include: {
                teacher: true,
                submissions: {
                    include: {
                        student: true,
                        correction: true
                    }
                }
            }
        });
    }

    async remove(id: number, teacherId: number) {
        const subject = await this.findOne(id);

        if (subject.teacherId !== teacherId) {
            throw new ForbiddenException('You can only delete your own subjects');
        }

        return this.prisma.subject.delete({
            where: { id }
        });
    }
}
