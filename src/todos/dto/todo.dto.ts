import { TodoPriority } from '@prisma/client';
import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDate()
  @IsNotEmpty()
  dateOfCompleted: string;

  @IsEnum(TodoPriority)
  @IsNotEmpty()
  todoPriority: TodoPriority;
}
