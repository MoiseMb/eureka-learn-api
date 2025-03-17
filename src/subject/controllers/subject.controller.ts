import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SubjectService } from '../services/subject.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('subject')
@Controller('subject')
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) { }

    @Post()
    @Roles(Role.PROFESSOR)
    create(@Body() createSubjectDto: CreateSubjectDto, @Request() req) {
        return this.subjectService.create(createSubjectDto, req.user.id);
    }

    @Get()
    findAll() {
        return this.subjectService.findAll();
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
