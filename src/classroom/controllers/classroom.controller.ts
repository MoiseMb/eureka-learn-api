import { Controller, Get, Post, Body, Param, Query, Put, Delete, Request } from '@nestjs/common';
import { ClassroomService } from '../services/classroom.service';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Classroom')
@ApiBearerAuth()
@Controller('classroom')
export class ClassroomController {
    constructor(private readonly classroomService: ClassroomService) { }

    @Post()
    @Roles(Role.ADMIN, Role.PROFESSOR)
    @ApiOperation({ summary: 'Create a new classroom' })
    @ApiBody({ type: CreateClassroomDto })
    @ApiResponse({ status: 201, description: 'The classroom has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    create(@Body() createClassroomDto: CreateClassroomDto) {
        return this.classroomService.create(createClassroomDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all classrooms' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'List of classrooms retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    findAll(@Query() paginationDto: PaginationDto) {
        return this.classroomService.findAll(paginationDto);
    }

    @Get('my-classes')
    @Roles(Role.PROFESSOR)
    @ApiOperation({ summary: 'Get classrooms assigned to the current professor' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'List of classrooms retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    findMyClasses(@Query() paginationDto: PaginationDto, @Request() req) {
        return this.classroomService.findByTeacher(paginationDto, req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a classroom by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'Classroom ID' })
    @ApiResponse({ status: 200, description: 'Classroom retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Classroom not found.' })
    findOne(@Param('id') id: string) {
        return this.classroomService.findOne(+id);
    }

    @Put(':id')
    @Roles(Role.ADMIN, Role.PROFESSOR)
    @ApiOperation({ summary: 'Update a classroom' })
    @ApiParam({ name: 'id', type: Number, description: 'Classroom ID' })
    @ApiBody({ type: UpdateClassroomDto })
    @ApiResponse({ status: 200, description: 'Classroom updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Classroom not found.' })
    update(@Param('id') id: string, @Body() updateClassroomDto: UpdateClassroomDto) {
        return this.classroomService.update(+id, updateClassroomDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.PROFESSOR)
    @ApiOperation({ summary: 'Delete a classroom' })
    @ApiParam({ name: 'id', type: Number, description: 'Classroom ID' })
    @ApiResponse({ status: 200, description: 'Classroom deleted successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Classroom not found.' })
    remove(@Param('id') id: string) {
        return this.classroomService.remove(+id);
    }
}