import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    search?: string;

    @IsOptional()
    orderBy?: string;

    @IsOptional()
    order?: 'asc' | 'desc' = 'desc';

    @IsOptional()
    role?: Role = 'STUDENT';
} 