import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common';
import { SubjectService } from '../services/subject.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('subject')
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) { }

    @Post()
    @Roles(Role.PROFESSOR)
    create(@Body() createSubjectDto: CreateSubjectDto, @Request() req) {
        return this.subjectService.create(createSubjectDto, req.user.id);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.subjectService.findAll(paginationDto);
    }

    @Get('my-subjects')
    @Roles(Role.PROFESSOR)
    findMySubjects(@Request() req) {
        return this.subjectService.findByTeacher(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.subjectService.findOne(+id);
    }
}
