import { Controller, Get, Post, Body, Param, Query, Put, Delete, Request } from '@nestjs/common';
import { ClassroomService } from '../services/classroom.service';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';

@Controller('classroom')
export class ClassroomController {
    constructor(private readonly classroomService: ClassroomService) { }


    @Post()
    @Roles(Role.ADMIN, Role.PROFESSOR)
    create(@Body() createClassroomDto: CreateClassroomDto) {
        return this.classroomService.create(createClassroomDto);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.classroomService.findAll(paginationDto);
    }
    @Get('my-classes')
    @Roles(Role.PROFESSOR)
    findMyClasses(@Query() paginationDto: PaginationDto, @Request() req) {
        return this.classroomService.findByTeacher(paginationDto, req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.classroomService.findOne(+id);
    }



    @Put(':id')
    @Roles(Role.ADMIN, Role.PROFESSOR)
    update(@Param('id') id: string, @Body() updateClassroomDto: UpdateClassroomDto) {
        return this.classroomService.update(+id, updateClassroomDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.PROFESSOR)
    remove(@Param('id') id: string) {
        return this.classroomService.remove(+id);
    }
}
