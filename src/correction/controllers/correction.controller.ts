import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common';
import { CorrectionService } from '../services/correction.service';
import { CreateCorrectionDto } from '../dto/create-correction.dto';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('correction')
export class CorrectionController {
    constructor(private readonly correctionService: CorrectionService) { }

    @Post()
    @Roles(Role.PROFESSOR)
    create(@Body() createCorrectionDto: CreateCorrectionDto, @Request() req) {
        return this.correctionService.create(createCorrectionDto, req.user.id);
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
