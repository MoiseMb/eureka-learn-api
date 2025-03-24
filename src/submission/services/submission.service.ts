import { Injectable, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/types/pagination.type';
import { Submission } from '@prisma/client';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { Role } from '@prisma/client';
import { UploadService } from 'src/upload/upload.service';
import { Multer } from 'multer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubmissionCreatedEvent } from '../events/submission-created.event';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubmissionService {
    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
        private eventEmitter: EventEmitter2
    ) { }

    async create(data: CreateSubmissionDto, file: Multer.File, studentId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: studentId }
        });

        if (user.role !== Role.STUDENT) {
            throw new ForbiddenException('Only students can submit assignments');
        }

        try {
            const uploadResult = await this.uploadService.uploadFile(file, 'submissions');
            const subject = await this.prisma.subject.findUnique({
                where: { id: Number(data.subjectId) }
            });

            const submission = await this.prisma.submission.create({
                data: {
                    fileUrl: uploadResult,
                    subjectId: Number(data.subjectId),
                    studentId
                },
                include: {
                    student: true,
                    subject: true
                }
            });

            this.eventEmitter.emit('submission.created', new SubmissionCreatedEvent({ ...submission, file }, subject));

            return submission;
        } catch (error) {
            if (error.url) {
                await this.uploadService.deleteFile(error.url);
            }
            throw new InternalServerErrorException('Failed to create submission: ' + error.message);
        }
    }

    async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Submission>> {
        const { page = 1, limit = 10, search, orderBy, order } = paginationDto;

        const where = search ? {
            OR: [
                { subject: { title: { contains: search } } },
                {
                    student: {
                        OR: [
                            { firstName: { contains: search } },
                            { lastName: { contains: search } }
                        ]
                    }
                }
            ]
        } : {};

        const [total, submissions] = await Promise.all([
            this.prisma.submission.count({ where }),
            this.prisma.submission.findMany({
                where,
                skip: (page - 1) * limit,
                take: +limit,
                orderBy: orderBy ? { [orderBy]: order } : { submittedAt: 'desc' },
                include: {
                    student: true,
                    subject: true,
                    correction: true
                }
            })
        ]);

        const lastPage = Math.ceil(total / limit);

        return {
            data: submissions,
            meta: {
                total,
                page,
                lastPage
            }
        };
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
