import { Controller, Get, Request } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { Role } from '@prisma/client';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard')
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
