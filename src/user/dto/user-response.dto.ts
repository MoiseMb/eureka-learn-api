import { Role } from '@prisma/client';

export class UserResponseDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
    classroomId?: number;
} 