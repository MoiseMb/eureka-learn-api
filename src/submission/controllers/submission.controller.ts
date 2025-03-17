import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common';
import { SubmissionService } from '../services/submission.service';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('submission')
export class SubmissionController {
    constructor(private readonly submissionService: SubmissionService) { }

    @Post()
    @Roles(Role.STUDENT)
    create(@Body() createSubmissionDto: CreateSubmissionDto, @Request() req) {
        return this.submissionService.create(createSubmissionDto, req.user.id);
    }

    @Get()
    @Roles(Role.PROFESSOR, Role.ADMIN)
    findAll(@Query() paginationDto: PaginationDto) {
        return this.submissionService.findAll(paginationDto);
    }

    @Get('my-submissions')
    @Roles(Role.STUDENT)
    findMySubmissions(@Request() req) {
        return this.submissionService.findMySubmissions(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.submissionService.findOne(+id);
    }
}
