import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, Put } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/roles.decorator';
import { Public } from '../../auth/constants';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BulkCreateProfessorsDto, BulkCreateStudentsDto, } from '../dto/bulk-create-users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Public()
    @Post('')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'User registered successfully.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get('profile')
    @ApiOperation({ summary: 'Get the profile of the authenticated user' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    getProfile(@Request() req) {
        return this.userService.findById(req.user.id);
    }

    @Get()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all users' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'List of users retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    findAll(@Query() paginationDto: PaginationDto) {
        return this.userService.findAll(paginationDto);
    }

    @Get(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    findOne(@Param('id') id: string) {
        return this.userService.findById(+id);
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update a user' })
    @ApiParam({ name: 'id', type: Number, description: 'User ID' })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'User updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete a user' })
    @ApiParam({ name: 'id', type: Number, description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User deleted successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }

    @ApiOperation({ summary: 'Bulk create professors' })
    @ApiResponse({
        status: 201,
        description: 'Professors successfully created',
    })
    @Post('bulk/professors')
    @Roles(Role.ADMIN)
    async bulkCreateProfessors(@Body() data: BulkCreateProfessorsDto) {
        return this.userService.bulkCreateProfessors(data);
    }

    @ApiOperation({ summary: 'Bulk create students' })
    @ApiResponse({
        status: 201,
        description: 'Students successfully created',
    })
    @Post('bulk/students')
    @Roles(Role.ADMIN, Role.PROFESSOR)
    async bulkCreateStudents(@Body() data: BulkCreateStudentsDto) {
        return this.userService.bulkCreateStudents(data);
    }
}