import { Controller, Get, Post, Body, Param, Query, Request, Patch, Put } from '@nestjs/common';
import { CorrectionService } from '../services/correction.service';
import { CreateCorrectionDto } from '../dto/create-correction.dto';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateCorrectionDto } from '../dto/update-correction.dto';

@ApiTags('Correction')
@ApiBearerAuth()
@Controller('correction')
export class CorrectionController {
    constructor(private readonly correctionService: CorrectionService) { }

    @Post()
    @Roles(Role.PROFESSOR)
    @ApiOperation({ summary: 'Create a new correction' })
    @ApiBody({ type: CreateCorrectionDto })
    @ApiResponse({ status: 201, description: 'The correction has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    create(@Body() createCorrectionDto: CreateCorrectionDto, @Request() req) {
        return this.correctionService.create(createCorrectionDto, req.user.id);
    }

    @Get('my-corrections')
    @Roles(Role.STUDENT)
    @ApiOperation({ summary: 'Get corrections for the current student' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'List of corrections retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    findMyCorrections(@Query() paginationDto: PaginationDto, @Request() req) {
        return this.correctionService.findUserCorrections(req.user.id, paginationDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all corrections' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'List of corrections retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    findAll(@Query() paginationDto: PaginationDto) {
        return this.correctionService.findAll(paginationDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a correction by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'Correction ID' })
    @ApiResponse({ status: 200, description: 'Correction retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Correction not found.' })
    findOne(@Param('id') id: string) {
        return this.correctionService.findOne(+id);
    }

    @Put(':id')
    @Roles(Role.PROFESSOR)
    @ApiOperation({ summary: 'Update a correction' })
    @ApiParam({ name: 'id', type: Number, description: 'Correction ID' })
    @ApiBody({ type: UpdateCorrectionDto })
    @ApiResponse({ status: 200, description: 'Correction updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Correction not found.' })
    async update(
        @Param('id') id: number,
        @Body() updateCorrectionDto: UpdateCorrectionDto,
        @Request() req
    ) {
        return this.correctionService.update(+id, updateCorrectionDto, req.user.id);
    }
}