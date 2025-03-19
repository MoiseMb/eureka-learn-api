import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common';
import { CorrectionService } from '../services/correction.service';
import { CreateCorrectionDto } from '../dto/create-correction.dto';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/roles.decorator'; // Updated path
import { PaginationDto } from '../../common/dto/pagination.dto'; // Updated path

@Controller('correction')
export class CorrectionController {
    constructor(private readonly correctionService: CorrectionService) { }

    @Post()
    @Roles(Role.PROFESSOR)
    create(@Body() createCorrectionDto: CreateCorrectionDto, @Request() req) {
        return this.correctionService.create(createCorrectionDto, req.user.id);
    }
    @Get('my-corrections')
    @Roles(Role.STUDENT)
    findMyCorrections(@Query() paginationDto: PaginationDto, @Request() req) {
        return this.correctionService.findUserCorrections(req.user.id, paginationDto);
    }
    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.correctionService.findAll(paginationDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.correctionService.findOne(+id);
    }


}
