import { $Enums, Todo } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TodoEntity implements Todo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  title: string;

  @ApiProperty()
  dateOfCompleted: Date;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  isExpired: boolean;

  @ApiProperty()
  todoPriority: $Enums.TodoPriority;

  @ApiProperty()
  userId: number;
}
