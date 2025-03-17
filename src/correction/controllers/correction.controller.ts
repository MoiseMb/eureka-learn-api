import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CorrectionService } from '../services/correction.service';
import { CreateCorrectionDto } from '../dto/create-correction.dto';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('correction')
@Controller('correction')
export class CorrectionController {
    constructor(private readonly correctionService: CorrectionService) { }

    @Post()
    @Roles(Role.PROFESSOR)
    create(@Body() createCorrectionDto: CreateCorrectionDto, @Request() req) {
        return this.correctionService.create(createCorrectionDto, req.user.id);
    }

    @Get()
    findAll() {
        return this.correctionService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.correctionService.findOne(+id);
    }
}
