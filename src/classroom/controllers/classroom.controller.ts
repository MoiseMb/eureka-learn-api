import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ClassroomService } from '../services/classroom.service';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';

@Controller('classroom')
export class ClassroomController {
    constructor(private readonly classroomService: ClassroomService) { }

    @Post()
    @Roles(Role.ADMIN, Role.PROFESSOR)
    create(@Body() createClassroomDto: CreateClassroomDto) {
        return this.classroomService.create(createClassroomDto);
    }

    @Get()
    findAll() {
        return this.classroomService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.classroomService.findOne(+id);
    }
}
