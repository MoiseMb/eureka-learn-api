
import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto  {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: Number,
        description: "user's id",
      })
    id: number;
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: 'user firstname ',
      })
    firstName: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: 'user lastname ',
      })
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({
        type: String,
        description: 'user email',
      })
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @ApiProperty({
        type: String,
        description: 'user password',
      })
    password: string;

    @IsOptional()
    @IsEnum(Role)
    @ApiProperty({
        type: Enumerator,
        description: 'user role',
      })
    role?: Role;

    @ApiProperty({
        type: Number,
        description: 'classroom id',
      })
    @IsOptional()
    classroomId?: number;
}

 
