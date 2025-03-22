import { Controller, Post, Body, Get, Param, Query, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SubjectService } from '../services/subject.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Multer } from 'multer';


@Controller('subject')
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) { }

    @Post()
    @Roles(Role.PROFESSOR)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'file', maxCount: 1 },
        { name: 'correctionFile', maxCount: 1 }
    ]))
    async create(
        @Body() createSubjectDto: CreateSubjectDto,
        @UploadedFiles() files: { file?: Multer.File[], correctionFile?: Multer.File[] },
        @Request() req
    ) {
        const file = files.file?.[0];
        const correctionFile = files.correctionFile?.[0];
        return this.subjectService.create(createSubjectDto, file, req.user.id, correctionFile);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto, @Request() req) {
        return this.subjectService.findAll(paginationDto, req.user.id);
    }
    @Get('students-grades/:id')
    @Roles(Role.PROFESSOR)
    async getStudentsGrades(
        @Param('id') subjectId: string,
        @Request() req
    ) {
        return this.subjectService.getStudentsGrades(+subjectId, req.user.id);
    }


    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.subjectService.findOne(+id);
    }


}
