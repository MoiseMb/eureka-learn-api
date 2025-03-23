import { Controller, Post, Body, Get, Param, Query, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SubjectService } from '../services/subject.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Multer } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Subject')
@ApiBearerAuth()
@Controller('subject')
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) { }

    @Post()
    @Roles(Role.PROFESSOR)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'file', maxCount: 1 },
        { name: 'correctionFile', maxCount: 1 }
    ]))
    @ApiOperation({ summary: 'Create a new subject' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                file: {
                    type: 'string',
                    format: 'binary',
                },
                correctionFile: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'The subject has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async create(
        @Body() createSubjectDto: CreateSubjectDto,
        @UploadedFiles() files: { file: Multer.File[], correctionFile?: Multer.File[] },
        @Request() req
    ) {

        const file = files.file?.[0];
        const correctionFile = files.correctionFile?.[0];
        return this.subjectService.create(createSubjectDto, file, req.user.id, correctionFile);
    }

    @Get()
    @ApiOperation({ summary: 'Get all subjects' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'List of subjects retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    findAll(@Query() paginationDto: PaginationDto, @Request() req) {
        return this.subjectService.findAll(paginationDto, req.user.id);
    }

    @Get('students-grades/:id')
    @Roles(Role.PROFESSOR)
    @ApiOperation({ summary: 'Get students grades for a specific subject' })
    @ApiParam({ name: 'id', type: Number, description: 'Subject ID' })
    @ApiResponse({ status: 200, description: 'Students grades retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Subject not found.' })
    async getStudentsGrades(
        @Param('id') subjectId: string,
        @Request() req
    ) {
        return this.subjectService.getStudentsGrades(+subjectId, req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a subject by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'Subject ID' })
    @ApiResponse({ status: 200, description: 'Subject retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Subject not found.' })
    findOne(@Param('id') id: string, @Request() req) {
        return this.subjectService.findOne(+id);
    }
}