import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { ListArgs } from 'src/lib/listArg';

@Injectable()
export class ClassroomService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateClassroomDto) {
        return this.prisma.classroom.create({ data });
    }

    async findAll(args: ListArgs = {}) {
        const { skip, take } = args;
        return this.prisma.classroom.findMany({
            skip,
            take,
            include: {
                students: true
            }
        });
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
