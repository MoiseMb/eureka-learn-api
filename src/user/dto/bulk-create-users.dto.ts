import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class BulkUserDto {
    @ApiProperty({ example: 'John', description: 'User first name' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'User last name' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
    @IsString()
    email: string;

    @ApiProperty({ example: 'password123', description: 'User password' })
    @IsString()
    password: string;
}

class BulkStudentDto extends BulkUserDto {
    @ApiProperty({ example: 'Class A', description: 'Student classroom name' })
    @IsString()
    className: string;
}

export class BulkCreateProfessorsDto {
    @ApiProperty({
        type: [BulkUserDto],
        description: 'Array of professors to create',
        example: [{
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'password123'
        }]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkUserDto)
    professors: BulkUserDto[];
}

export class BulkCreateStudentsDto {
    @ApiProperty({
        type: [BulkStudentDto],
        description: 'Array of students to create',
        example: [{
            firstName: 'Alice',
            lastName: 'Smith',
            email: 'alice.smith@example.com',
            password: 'password123',
            className: 'Class A'
        }]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkStudentDto)
    students: BulkStudentDto[];
}