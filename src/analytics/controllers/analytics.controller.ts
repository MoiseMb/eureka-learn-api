import { Controller, Get, Request } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get dashboard statistics based on user role' })
    @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async getDashboardStats(@Request() req) {
        switch (req.user.role) {
            case Role.STUDENT:
                return this.analyticsService.getStudentStats(req.user.id);
            case Role.PROFESSOR:
                return this.analyticsService.getProfessorStats(req.user.id);
            case Role.ADMIN:
                return this.analyticsService.getAdminStats();
            default:
                throw new Error('Invalid role');
        }
    }
}