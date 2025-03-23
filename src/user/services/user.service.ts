import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/types/pagination.type';
import { BulkCreateProfessorsDto, BulkCreateStudentsDto } from '../dto/bulk-create-users.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    private toResponseDto(user: User): UserResponseDto {
        const { password, ...userResponse } = user;
        return userResponse;
    }

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
        });

        return this.toResponseDto(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: number): Promise<UserResponseDto | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return null;
        }

        return this.toResponseDto(user);
    }

    async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<UserResponseDto>> {
        const { page = 1, limit = 10, search, orderBy, order, role } = paginationDto;


        const where = search ? {
            OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } }
            ]
        } : { role }




        const [total, users] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: +limit,
                orderBy: orderBy ? { [orderBy]: order } : { createdAt: 'desc' },
                include: { classroom: true, teaching: true }
            })
        ]);

        const lastPage = Math.ceil(total / limit);

        return {
            data: users.map(user => this.toResponseDto(user)),
            meta: {
                total,
                page,
                lastPage
            }
        };
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        let data = { ...updateUserDto };
        if (updateUserDto.password) {
            data.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data
        });

        return this.toResponseDto(updatedUser);
    }

    async remove(id: number): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const deletedUser = await this.prisma.user.delete({
            where: { id },
        });

        return this.toResponseDto(deletedUser);
    }

    async bulkCreateProfessors(data: BulkCreateProfessorsDto) {
        const defaultPassword = await hash('passer', 12);

        const professors = await this.prisma.$transaction(
            data.professors.map(professor =>
                this.prisma.user.create({
                    data: {
                        ...professor,
                        password: defaultPassword,
                        role: Role.PROFESSOR
                    }
                })
            )
        );

        return professors;
    }

    async bulkCreateStudents(data: BulkCreateStudentsDto) {
        const studentsByClass = data.students.reduce((acc, student) => {
            if (!acc[student.className]) {
                acc[student.className] = [];
            }
            acc[student.className].push(student);
            return acc;
        }, {});

        const results = await this.prisma.$transaction(async (prisma) => {
            const createdStudents = [];

            for (const [className, students] of Object.entries(studentsByClass)) {
                const classroom = await prisma.classroom.upsert({
                    where: { name: className },
                    update: {},
                    create: { name: className }
                });

                const classStudents = await Promise.all(
                    (students as any[]).map(student =>
                        prisma.user.create({
                            data: {
                                firstName: student.firstName,
                                lastName: student.lastName,
                                email: student.email,
                                password: student.password,
                                role: Role.STUDENT,
                                classroomId: classroom.id
                            }
                        })
                    )
                );

                createdStudents.push(...classStudents);
            }

            return createdStudents;
        });

        return results;
    }
}
