import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, Put } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/roles.decorator';
import { Public } from '../../auth/constants';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Public()
    @Post('')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get('profile')
    getProfile(@Request() req) {
        return this.userService.findById(req.user.id);
    }

    @Get()
    @Roles(Role.ADMIN)
    findAll(@Query() paginationDto: PaginationDto) {
        return this.userService.findAll(paginationDto);
    }

    @Get(':id')
    @Roles(Role.ADMIN)
    findOne(@Param('id') id: string) {
        return this.userService.findById(+id);
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
