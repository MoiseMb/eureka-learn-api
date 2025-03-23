import { Controller, Get, Post, Body, Param, Query, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubmissionService } from '../services/submission.service';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Multer } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Submission')
@ApiBearerAuth()
@Controller('submission')
export class SubmissionController {
    constructor(private readonly submissionService: SubmissionService) { }

    @Post()
    @Roles(Role.STUDENT)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Create a new submission' })
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
            },
        },
    })
    @ApiResponse({ status: 201, description: 'The submission has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    create(
        @Body() createSubmissionDto: CreateSubmissionDto,
        @UploadedFile() file: Multer.File,
        @Request() req
    ) {
        return this.submissionService.create(createSubmissionDto, file, req.user.id);
    }

    @Get()
    @Roles(Role.PROFESSOR, Role.ADMIN)
    @ApiOperation({ summary: 'Get all submissions' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'List of submissions retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    findAll(@Query() paginationDto: PaginationDto) {
        return this.submissionService.findAll(paginationDto);
    }

    @Get('my-submissions')
    @Roles(Role.STUDENT)
    @ApiOperation({ summary: 'Get submissions for the current student' })
    @ApiResponse({ status: 200, description: 'List of submissions retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    findMySubmissions(@Request() req) {
        return this.submissionService.findMySubmissions(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a submission by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'Submission ID' })
    @ApiResponse({ status: 200, description: 'Submission retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Submission not found.' })
    findOne(@Param('id') id: string) {
        return this.submissionService.findOne(+id);
    }
}