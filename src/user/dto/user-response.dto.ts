import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
@ApiProperty({
    type: Number,
    description: "user's id",
          })
    id: number;
    @ApiProperty({
        type: String,
        description: 'user firstname ',
      })
    firstName: string;
    @ApiProperty({
        type: String,
        description: 'user lastname ',
      })
    lastName: string;
    @ApiProperty({
        type: String,
        description: 'user email',
      })
    email: string;
    @ApiProperty({
        type: Enumerator,
        description: "user's role",
      })
    role: Role;
    @ApiProperty({
        type: Date,
        description: " user's registration date  ",
      })
    createdAt: Date;
    @ApiProperty({
        type: Date,
        description: " user'supdate date ",
      })
    updatedAt: Date;
    @ApiProperty({
        type: Number,
        description: 'classroom id',
      })
    classroomId?: number;
} 