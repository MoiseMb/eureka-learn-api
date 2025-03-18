import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common';
import { SubjectService } from '../services/subject.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('subject')
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) { }

    @Post()
    @Roles(Role.PROFESSOR)
    @UseInterceptors(FileInterceptor('file'))
    create(
        @Body() createSubjectDto: CreateSubjectDto,
        @UploadedFile() file: Multer.File,
        @Request() req
    ) {
        return this.subjectService.create(createSubjectDto, file, req.user.id);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto, @Request() req) {
        return this.subjectService.findAll(paginationDto, req.user.id);
    }

    // @Get('my-subjects')
    // @Roles(Role.PROFESSOR)
    // findMySubjects(@Request() req) {
    //     return this.subjectService.findByTeacher(req.user.id);
    // }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.subjectService.findOne(+id);
    }
}
