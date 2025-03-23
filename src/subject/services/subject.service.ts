import { Injectable, ForbiddenException, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UploadService } from 'src/upload/upload.service';
import { Role, Subject } from '@prisma/client';
import { Multer } from 'multer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/types/pagination.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubjectCreatedEvent } from '../events/subject-created.event';

@Injectable()
export class SubjectService {
    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
        private eventEmitter: EventEmitter2
    ) { }

    async create(data: CreateSubjectDto, file: Multer.File, userId: number, correctionFile?: Multer.file) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (user.role !== Role.PROFESSOR) {
            throw new ForbiddenException('Only professors can create subjects');
        }



        try {
            const uploadResult = await this.uploadService.uploadFile(file, 'subjects');
            data.correctionFileUrl = correctionFile ? await this.uploadService.uploadFile(correctionFile, 'professorCorrectionSubjects') : null;

            const subject = await this.prisma.subject.create({
                data: {
                    ...data,
                    classroomId: Number(data.classroomId),
                    fileUrl: uploadResult,
                    teacherId: userId
                },
                include: {
                    teacher: true,
                    classroom: true
                }
            });

            const eventSubject = await new SubjectCreatedEvent(subject);
            this.eventEmitter.emit('subject.created', eventSubject);

            return subject;
        } catch (error) {
            if (error.url) {
                await this.uploadService.deleteFile(error.url);
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

    async getStudentsGrades(subjectId: number, professorId: number) {
        const subject = await this.prisma.subject.findUnique({
            where: { id: subjectId },
            include: {
                teacher: true,
                classroom: {
                    include: {
                        students: true
                    }
                }
            }
        });

        if (!subject) {
            throw new NotFoundException('Subject not found');
        }

        if (subject.teacherId !== professorId) {
            throw new ForbiddenException('You can only access grades for your subjects');
        }

        const studentsGrades = await this.prisma.user.findMany({
            where: {
                classroomId: subject.classroomId,
                role: Role.STUDENT
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                submissions: {
                    where: {
                        subjectId
                    },
                    select: {
                        id: true,
                        fileUrl: true,
                        submittedAt: true,
                        isCorrecting: true,
                        isCorrected: true,
                        correction: {
                            select: {
                                score: true,
                                notes: true,
                                correctedAt: true
                            }
                        }
                    }
                }
            }
        });

        return {
            subject: {
                id: subject.id,
                title: subject.title,
                endDate: subject.endDate,
                startDate: subject.startDate,
                classroom: {
                    id: subject.classroom.id,
                    name: subject.classroom.name
                }
            },
            students: studentsGrades.map(student => ({
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                submission: student.submissions[0] || null
            }))
        };
    }
}
